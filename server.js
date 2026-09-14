// server.js - Production-ready zero-dependency Node.js HTTP Server for Render with Multi-Provider AI Proxy
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 10000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=UTF-8"
};

// Helper: Handle Multi-Provider AI Requests (Gemini, Claude, AdaCode / OpenAI-Compatible)
async function handleAiProxy(req, res) {
  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const { provider, model, apiKey, prompt, customEndpoint } = payload;

      if (!apiKey || !apiKey.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "API Key / Session Token diperlukan." }));
      }
      if (!prompt || !prompt.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Prompt tidak boleh kosong." }));
      }

      let replyText = "";

      if (provider === "claude") {
        // Anthropic Claude API
        const claudeModel = model || "claude-3-7-sonnet-latest";
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey.trim(),
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 4096,
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || `Claude API Error (${response.status})`);
        }
        replyText = data.content?.[0]?.text || "Tidak ada teks respon dari Claude.";

      } else if (provider === "adacode" || provider === "custom") {
        // AdaCode / Custom OpenAI-Compatible Proxy Endpoint
        let targetUrl = (customEndpoint || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
        if (!targetUrl.endsWith("/chat/completions")) {
          targetUrl += "/chat/completions";
        }

        const customModel = model || "default";
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: customModel,
            messages: [{ role: "user", content: prompt }]
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || `Custom / AdaCode API Error (${response.status})`);
        }
        replyText = data.choices?.[0]?.message?.content || "Tidak ada respon dari model.";

      } else {
        // Default: Google Gemini API (Supports Gemini 3.6 Flash, 3.6 Pro, etc.)
        let geminiModel = (model || "gemini-3.6-flash").trim();
        if (geminiModel === "gemini-3-flash" || geminiModel === "gemini-3" || geminiModel === "gemini-2.5-flash") {
          geminiModel = "gemini-3.6-flash";
        } else if (geminiModel === "gemini-3-pro" || geminiModel === "gemini-2.5-pro") {
          geminiModel = "gemini-3.6-pro";
        }

        const executeGemini = async (targetModel) => {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          });
          const data = await response.json();
          return { ok: response.ok, status: response.status, data };
        };

        let result = await executeGemini(geminiModel);

        // Fallback to gemini-3.6-flash or gemini-2.0-flash if the requested model is deprecated or not found
        if (!result.ok && geminiModel !== "gemini-3.6-flash") {
          result = await executeGemini("gemini-3.6-flash");
        }
        if (!result.ok && geminiModel !== "gemini-2.0-flash") {
          result = await executeGemini("gemini-2.0-flash");
        }

        if (!result.ok) {
          throw new Error(result.data.error?.message || `Gemini API Error (${result.status})`);
        }
        replyText = result.data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada respon dari Gemini.";
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ text: replyText }));

    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message || "Internal Server Error" }));
    }
  });
}

// Helper: Handle Task Refinement Request
async function handleTaskRefine(req, res) {
  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const { task, role, provider, model, apiKey, customEndpoint } = payload;

      if (!task || !task.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Teks task tidak boleh kosong." }));
      }

      // If no API key provided, let client handle local heuristic
      if (!apiKey || !apiKey.trim()) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ refined: null, note: "No API key provided, use local heuristic" }));
      }

      const refinePrompt = `Kamu adalah Senior Prompt Engineer & Technical Specification Specialist.
Tugasmu: Perbaiki dan susun ulang teks instruksi / requirement teknis berikut agar menjadi sangat rapi, sistematis, presisi, dan mudah dieksekusi oleh AI coding assistant.

ATURAN PERBAIKAN:
1. Perbaiki kalimat yang berantakan, typo, atau kalimat panjang yang berulang tanpa mengubah maksud teknis aslinya.
2. Kelompokkan instruksi ke dalam poin-poin/sub-poin yang runtut dan terstruktur (misal: target fungsi, perubahan skema, filter data, dan pemetaan rujukan).
3. Buang kata-kata berulang yang tidak perlu agar ringkas dan padat makna.
4. JANGAN berikan teks pembuka ("Tentu, ini hasilnya...") atau penutup ("Semoga membantu...").
5. JANGAN menambahkan aturan bahasa pemrograman lain yang tidak ada hubungannya dengan konteks tugas.
6. Berikan HANYA teks requirement yang sudah diperbaiki dan terstruktur rapi.

Teks instruksi asli:
${task.trim()}`;

      let refinedText = "";

      if (provider === "claude") {
        const claudeModel = model || "claude-3-7-sonnet-latest";
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey.trim(),
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 2048,
            messages: [{ role: "user", content: refinePrompt }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `Claude Error (${response.status})`);
        refinedText = data.content?.[0]?.text?.trim() || "";
      } else if (provider === "adacode" || provider === "custom") {
        let targetUrl = (customEndpoint || "https://api.openai.com/v1").trim().replace(/\/+$/, "");
        if (!targetUrl.endsWith("/chat/completions")) targetUrl += "/chat/completions";
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model || "default",
            messages: [{ role: "user", content: refinePrompt }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || `API Error (${response.status})`);
        refinedText = data.choices?.[0]?.message?.content?.trim() || "";
      } else {
        let geminiModel = (model || "gemini-3.6-flash").trim();
        if (geminiModel === "gemini-3-flash" || geminiModel === "gemini-3" || geminiModel === "gemini-2.5-flash") {
          geminiModel = "gemini-3.6-flash";
        } else if (geminiModel === "gemini-3-pro" || geminiModel === "gemini-2.5-pro") {
          geminiModel = "gemini-3.6-pro";
        }

        const executeRefine = async (targetModel) => {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: refinePrompt }] }]
            })
          });
          const data = await response.json();
          return { ok: response.ok, status: response.status, data };
        };

        let result = await executeRefine(geminiModel);
        if (!result.ok && geminiModel !== "gemini-3.6-flash") {
          result = await executeRefine("gemini-3.6-flash");
        }
        if (!result.ok && geminiModel !== "gemini-2.0-flash") {
          result = await executeRefine("gemini-2.0-flash");
        }

        if (!result.ok) throw new Error(result.data.error?.message || `Gemini Error (${result.status})`);
        refinedText = result.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ refined: refinedText }));

    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message, refined: null }));
    }
  });
}

const server = http.createServer((req, res) => {
  // Handle AI Proxy Routes
  if (req.method === "POST" && req.url === "/api/generate") {
    return handleAiProxy(req, res);
  }
  if (req.method === "POST" && req.url === "/api/refine") {
    return handleTaskRefine(req, res);
  }

  // Normalize URL and remove query strings
  let reqUrl = req.url.split("?")[0];
  if (reqUrl === "/" || reqUrl === "") {
    reqUrl = "/index.html";
  }

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA behavior
      filePath = path.join(PUBLIC_DIR, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=UTF-8" });
        res.end("500 Internal Server Error");
        return;
      }

      // Set security & caching headers
      res.writeHead(200, {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      });
      res.end(content);
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`⚡ PromptCraft Studio is running on http://0.0.0.0:${PORT}`);
});
