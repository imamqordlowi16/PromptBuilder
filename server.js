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
        // Default: Google Gemini API (Supports Gemini 2.5 Flash, 2.5 Pro, 1.5 Pro, etc.)
        const geminiModel = model || "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || `Gemini API Error (${response.status})`);
        }
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada respon dari Gemini.";
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ text: replyText }));

    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message || "Internal Server Error" }));
    }
  });
}

const server = http.createServer((req, res) => {
  // Handle AI Proxy Route
  if (req.method === "POST" && req.url === "/api/generate") {
    return handleAiProxy(req, res);
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
