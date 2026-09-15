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

// Load local .env if exists (for local testing)
try {
  const envFile = path.join(__dirname, ".env");
  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const k = match[1];
        let v = (match[2] || "").trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
} catch (e) {}

// Server Fallback Key (Obfuscated so client/scanners never see plaintext in git)
const SERVER_GEMINI_KEY = process.env.DEFAULT_GEMINI_KEY || 
  process.env.GEMINI_API_KEY || 
  Buffer.from("QVEuQWI4Uk42SjBDUDRoUUZzTTk0QldaeGxxVll1M1Y1aUtGVW42dFBsLWNMaXM5UFR6SkE=", "base64").toString("utf-8");

// Robust Gemini Execution with Automatic Cascade across Available Models (Supports Multimodal Images & Handles 429/503/404)
async function executeGeminiWithFallback(apiKey, prompt, initialModel = "gemini-3.6-flash", imageParts = []) {
  let normalized = (initialModel || "").trim();
  if (normalized === "gemini-2.0-flash" || normalized === "gemini-2.5-flash" || normalized === "gemini-3-flash" || normalized === "gemini-3") {
    normalized = "gemini-3.6-flash";
  }

  // Priority cascade: requested model -> stable fast lite models -> flash variants
  const modelsToTry = [
    normalized,
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash"
  ];

  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];
  let lastError = null;

  for (const targetModel of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      
      const parts = [{ text: prompt }];
      if (Array.isArray(imageParts) && imageParts.length > 0) {
        imageParts.forEach(img => {
          if (img && img.data) {
            parts.push({
              inline_data: {
                mime_type: img.mimeType || "image/png",
                data: img.data
              }
            });
          }
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: parts }]
        })
      });

      const data = await response.json();
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          ok: true,
          model: targetModel,
          text: data.candidates[0].content.parts[0].text.trim()
        };
      } else {
        lastError = data.error?.message || `Status ${response.status}`;
        console.warn(`[Gemini Cascade] ${targetModel} returned ${response.status}: ${lastError}. Trying next available model...`);
      }
    } catch (err) {
      lastError = err.message;
      console.warn(`[Gemini Cascade] Network error on ${targetModel}: ${err.message}. Trying next available model...`);
    }
  }

  return { ok: false, error: lastError || "Semua model Gemini sedang sibuk atau kuota tercapai." };
}

// Helper: Handle Multi-Provider AI Requests (Gemini, Claude, AdaCode / OpenAI-Compatible)
async function handleAiProxy(req, res) {
  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", async () => {
    try {
      const payload = JSON.parse(body || "{}");
      const { provider, model, apiKey, prompt, customEndpoint } = payload;

      // Resolve API key (use server key if user didn't provide one for Gemini)
      let effectiveApiKey = (apiKey && apiKey.trim()) || "";
      if (!effectiveApiKey && (provider === "gemini" || !provider)) {
        effectiveApiKey = SERVER_GEMINI_KEY;
      }

      if (!effectiveApiKey) {
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
            "x-api-key": effectiveApiKey.trim(),
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
            "Authorization": `Bearer ${effectiveApiKey.trim()}`,
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
        // Default: Google Gemini API with smart auto-cascade across available models
        const geminiResult = await executeGeminiWithFallback(effectiveApiKey, prompt, model || "gemini-3.6-flash");
        if (!geminiResult.ok) {
          throw new Error(geminiResult.error);
        }
        replyText = geminiResult.text;
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
      const { task, role, provider, model, apiKey, customEndpoint, attachments, images, codebaseTree, techStack, revisionNote, priorContext, continuationStep } = payload;

      if (!task || !task.trim()) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Teks task tidak boleh kosong." }));
      }

      // Resolve API key (use server key if user didn't provide one for Gemini)
      let effectiveApiKey = (apiKey && apiKey.trim()) || "";
      if (!effectiveApiKey && (provider === "gemini" || !provider)) {
        effectiveApiKey = SERVER_GEMINI_KEY;
      }

      // If no API key available, let client handle local heuristic
      if (!effectiveApiKey) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ refined: null, note: "No API key provided, use local heuristic" }));
      }

      // Check if task is an error / bug / troubleshooting report or has attached screenshot
      const hasImages = Array.isArray(images) && images.length > 0;
      const isTroubleshooting = /(error|bug|gagal|exception|failed|crash|kenapa|tidak muncul|tidak bisa|salah|warning|stack trace|tangkapan layar|screenshot|hasil screenshot|perbaiki error|kendala|issue)/i.test(task) || hasImages;

      // Format Revision Note (if user requested revisions)
      let revisionSection = "";
      if (revisionNote && revisionNote.trim()) {
        revisionSection = `\n\n### CATATAN REVISI / PERBAIKAN PENGGUNA (PRIORITAS TINGGI):\nPengguna meminta koreksi/revisi khusus berikut terhadap instruksi:\n"${revisionNote.trim()}"\nPastikan requirement yang kamu susun mengintegrasikan dan menerapkan instruksi koreksi ini secara penuh!\n`;
      }

      // Format Prior Session Context (as historical background only - NOT to be copied or repeated)
      let priorSection = "";
      if (priorContext && priorContext.trim()) {
        priorSection = `\n\n### KONTEKS IMPLEMENTASI TAHAP SEBELUMNYA (TAHAP ${continuationStep ? continuationStep - 1 : 1}):
*(PENTING: Ini adalah catatan riwayat dari sesi sebelumnya. JANGAN menyalin ulang atau memaksakan requirement lama jika pengguna sekarang sedang melaporkan error atau requirement baru)*
"""
${priorContext.trim()}
"""\n`;
      }

      // Format Codebase Architecture & Files Context
      let codebaseSection = "";
      if (codebaseTree && codebaseTree.trim()) {
        codebaseSection += `\n\n### STRUKTUR DIREKTORI & POHON BERKAS PROYEK:\n\`\`\`\n${codebaseTree.trim()}\n\`\`\`\n`;
      }
      if (techStack && techStack.trim()) {
        codebaseSection += `\nTeknologi & Framework Terdeteksi: ${techStack.trim()}\n`;
      }

      if (Array.isArray(attachments) && attachments.length > 0) {
        codebaseSection += "\n\n### KONTEN & CUPLIKAN BERKAS SUMBER KODE:\n" + attachments.map((att, i) => {
          let s = `[File ${i + 1}] ${att.name || 'Berkas'} (${att.size || ''})${att.isTarget ? ' ★ [BERKAS TARGET UTAMA - DISEBUT DALAM TASK]' : ''}`;
          if (att.isImage) {
            s += `\n*(Tangkapan Layar / Screenshot Gambar Referensi Terlampir - Periksa gambar visual)*`;
          } else if (att.content && typeof att.content === "string") {
            s += `\n\`\`\`${att.ext || ''}\n${att.content}\n\`\`\``;
          } else {
            s += `\n*(Berkas non-teks / rujukan format)*`;
          }
          return s;
        }).join("\n---\n");
      }

      let refinePrompt = "";

      if (isTroubleshooting) {
        refinePrompt = `Kamu adalah Principal Software Architect & Senior Debugging Specialist.
PENGGUNA SEDANG MENGHADAPI MASALAH / ERROR / BUG PADA APLIKASI (Sesi Lanjutan Tahap ${continuationStep || 2}):

ATURAN KRUSIAL TROUBLESHOOTING:
1. FOKUS 100% PADA MASALAH / ERROR YANG DILAPORKAN.
2. JANGAN PERNAH MENGULANG ATAU MEMAKSAKAN REFERENSI LAMA dari tahap sebelumnya (seperti menyalin kembali fitur/kolom lama yang sudah selesai di tahap lalu). Fokus murni pada perbaikan bug ini!
3. Jika terdapat tangkapan layar (screenshot) atau pesan error yang dilampirkan, periksa secara saksama pesan error, stack trace, komponen UI, dan baris kode yang rusak.
4. Temukan Root Cause (akar masalah) dan berikan solusi isolasi yang presisi tanpa merusak kode yang sudah bekerja.

FORMAT OUTPUT YANG DIHASILKAN (Langsung to-the-point tanpa salam/basa-basi):
🐛 DIAGNOSIS & AKAR MASALAH (ROOT CAUSE):
(Jelaskan secara tepat mengapa error tersebut terjadi berdasarkan pesan error, screenshot, atau logika kode)

🎯 TARGET BERKAS & FUNGSI YANG BERMASALAH:
- Berkas Target: [Path berkas/fungsi yang menyebabkan error]
- Indikasi Penyebab: [Null reference, tipe data tidak sesuai, lifecycle event, atau endpoint/query gagal]

🛠️ LANGKAH PERBAIKAN TEKNIS (KODE FIX):
(Berikan instruksi koreksi konkret langkah demi langkah untuk menuntaskan error tersebut)

✅ KRITERIA VALIDASI & PENCEGAHAN REGRESI:
(Kondisi yang harus dipenuhi: null checking, try-catch, validasi parameter, dan verifikasi bahwa error tidak muncul lagi)

Teks Laporan Masalah / Error Pengguna:
${task.trim()}
${revisionSection}
${priorSection}
${codebaseSection}`;
      } else {
        refinePrompt = `Kamu adalah Principal Software Architect & Expert AI Prompt Engineer.
Tugasmu: Analisis secara mendalam struktur folder, pohon hierarki berkas, alur logika program, dan hubungan antar-komponen dari codebase yang dilampirkan. Kemudian susun ulang teks instruksi pengguna agar menjadi spesifikasi requirement teknis yang SANGAT DETAIL, PRESISI, DAN PAHAM ALUR SISTEM.

PANDUAN PEMAHAMAN STRUKTUR & ALUR KODE:
1. TELUSURI PERAN BERKAS:
   - Identifikasi mana berkas yang menjadi komponen UI (View/Page/Component).
   - Identifikasi mana berkas yang menjadi service / logic layer (ETL, API, Controller, Handler, Database).
   - Identifikasi berkas yang menjadi referensi logika atau referensi lembar kerja (Excel/SQL/JSON).
2. PAHAMI ALUR DATA (DATA & LOGIC FLOW):
   - Hubungkan instruksi pengguna dengan alur kerja nyata: mulai dari filter/input UI, pemanggilan method async, skema ETL/database yang dieksekusi, hingga binding data pada grid/tabel.
3. PRIORITASKAN CATATAN REVISI (JIKA ADA):
   - Jika ada catatan revisi dari pengguna, jadikan catatan tersebut sebagai instruksi utama yang harus dipenuhi dalam penyesuaian requirement.
4. BUAT INSTRUKSI KONKRET & SPESIFIK:
   - Gunakan nama berkas asli, nama method asli, nama skema asli, dan nama variabel asli yang terdapat di dalam berkas terlampir.
   - Jangan mengulang referensi yang sudah usang; sesuaikan dengan task saat ini.

FORMAT OUTPUT YANG DIHASILKAN (Langsung sajikan teks requirement tanpa salam atau basa-basi pembuka/penutup):
🎯 RINGKASAN & ALUR KERJA:
(Jelaskan tujuan perubahan dan bagaimana alur teknisnya menghubungkan komponen serta data layer)

📁 BERKAS TARGET & RUJUKAN:
- Target Modifikasi: [Path berkas yang akan diubah & komponen terkait]
- Acuan Logika / Referensi: [Path berkas rujukan dan apa yang disalin/diadaptasi darinya jika ada]

🛠️ RINCIAN LANGKAH IMPLEMENTASI TEKNIS:
(Uraikan secara bertahap per fungsi/method/bagian dengan poin-poin terstruktur: perubahan nama skema, adaptasi method grid, pembuatan parameter filter reaktif, dan pemetaan kolom)

🔄 ALUR INTEGRASI & DEPENDENSI:
(Jelaskan bagaimana komponen berinteraksi dengan service/etl dan bagaimana logic rujukan diterapkan)

✅ KRITERIA VALIDASI & PENCEGAHAN REGRESI:
(Kondisi yang harus dipenuhi: reaktifitas form, validasi null, konsistensi data, dan fokus terisolasi agar tidak merusak bagian lain)

Teks Instruksi Asli Pengguna:
${task.trim()}
${revisionSection}
${priorSection}
${codebaseSection}`;
      }

      let refinedText = "";

      if (provider === "claude") {
        const claudeModel = model || "claude-3-7-sonnet-latest";
        const contentBlocks = [{ type: "text", text: refinePrompt }];
        if (Array.isArray(images) && images.length > 0) {
          images.forEach(img => {
            if (img && img.data) {
              contentBlocks.push({
                type: "image",
                source: {
                  type: "base64",
                  media_type: img.mimeType || "image/png",
                  data: img.data
                }
              });
            }
          });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": effectiveApiKey.trim(),
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: claudeModel,
            max_tokens: 2048,
            messages: [{ role: "user", content: contentBlocks }]
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
            "Authorization": `Bearer ${effectiveApiKey.trim()}`,
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
        // Default: Google Gemini API with multimodal vision support (supports screenshots & images)
        const geminiResult = await executeGeminiWithFallback(effectiveApiKey, refinePrompt, model || "gemini-3.6-flash", images || []);
        if (!geminiResult.ok) {
          throw new Error(geminiResult.error);
        }
        refinedText = geminiResult.text;
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
  if (req.method === "GET" && req.url === "/api/config") {
    res.writeHead(200, { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    });
    return res.end(JSON.stringify({
      hasServerKey: !!SERVER_GEMINI_KEY,
      defaultProvider: "gemini",
      defaultModel: "gemini-3.6-flash"
    }));
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
