// app.js - Precision Role & Task Prompt Architect with Embedded Gemini Refinement & Multi-File Attachments
(function () {
  "use strict";

  // Role Presets Database
  const ROLE_PRESETS = {
    fullstack_engineer: "Senior Polyglot Full-Stack Engineer ahli dalam SEMUA bahasa pemrograman utama (JavaScript/TypeScript, Python, Golang, Rust, Java/Kotlin, C#/.NET, C/C++, PHP, Swift, Dart/Flutter, Ruby, SQL, Shell/Bash) dan ekosistem framework modern.",
    blazor_dotnet: "Senior .NET & Blazor Architect ahli dalam C# 12, ASP.NET Core, Blazor WebAssembly/Server, Entity Framework Core, SQL Server, dan integrasi Dynamic Data Grid / ETL pipelines.",
    senior_architect: "Principal Systems & Software Architect dengan pengalaman 15+ tahun merancang arsitektur perangkat lunak terdistribusi, Clean Architecture, high-throughput, low-latency, dan fault-tolerant.",
    frontend_engineer: "Senior Frontend Architect & UI/UX Specialist ahli dalam modern JavaScript/TypeScript, React 19, Next.js, Vue 3, state management, CSS modern, dan performa web.",
    mobile_engineer: "Senior Mobile Solutions Architect ahli dalam Dart/Flutter, React Native, Swift/SwiftUI (iOS), Kotlin/Jetpack Compose (Android), dan offline-first mobile sync.",
    ai_ml_engineer: "Senior AI / Machine Learning & Data Systems Engineer ahli dalam Python, PyTorch, LangChain, RAG pipelines, Vector Databases, dan orkestrasi GenAI / LLM enterprise.",
    devops_sre: "Principal Site Reliability Engineer & Cloud Architect ahli dalam Docker, Kubernetes, Terraform, AWS, Azure, GCP, CI/CD pipelines, dan zero-touch deployment.",
    database_architect: "Senior Database Administrator & Data Architect ahli dalam SQL Server, PostgreSQL, MySQL, optimasi query performa tinggi, indexing, dan arsitektur data warehouse / ETL.",
    custom: ""
  };

  // Sample Real-world Tasks
  const SAMPLE_TASKS = {
    blazor_etl: `Lakukan update pada PDN.razor dengan requirement sebagai berikut:
- Lakukan update khusus pada tab 1 (Rasio PDN) saja.
- Update pada function LoadPdnKelompokPage:
  * Ganti nama skema etl dari "DATA_PDN_ABSOLUT_MODAL2" menjadi "RASIO_PDN_SEBELUM_TD_VALAS_KELOMPOK"
  * Ubah tipe DynamicDataGrid menjadi pemanggilan LoadPivotAsync
  * Buatkan filter untuk dilempar ke skema etl dari Datetime Picker Posisi Laporan dan Kelompok Bank
  * Tampilan grid disamakan dengan tabel excel bagian atas pada file C:\\Users\\Iqbal\\Downloads\\Contoh Laporan\\MONITORING-HARIAN-AGREGASI-PDN_RASIO PDN.xlsx
  * Khusus kolom "Kelompok Bank" (karena tidak ada di etl), samakan logic pengambilan datanya dari PUAB.razor. Kolom lain tetap ambil dari etl.
- Update pada function LoadPdnIndividualPage:
  * Ganti nama skema etl dari "PDN_ABSOLUT_MODAL" menjadi "RASIO_PDN_SEBELUM_TDVALAS_INDIVIDU_BANK"
  * Ubah tipe DynamicDataGrid menjadi pemanggilan LoadPivotAsync
  * Buatkan filter untuk dilempar ke skema etl dari Datetime Picker Posisi Laporan dan Kelompok Bank
  * Tampilan grid disamakan dengan tabel excel bagian bawah pada file excel rujukan tersebut
  * Khusus kolom "Bank" (karena tidak ada di etl), samakan logic pengambilannya dari PUAB.razor. Kolom lain tetap ambil dari etl.
- Pastikan filter pada form bekerja reaktif, terkirim ke dalam etl, dan data tertampil sesuai hasil etl.`
  };

  // State Management
  const state = {
    role: ROLE_PRESETS.fullstack_engineer,
    rawTask: "",
    refinedTask: null,
    attachments: [] // Array of { id, name, sizeFormatted, type, ext, content, isBinary }
  };

  // DOM Elements
  const el = {
    rolePresetSelect: document.getElementById("rolePresetSelect"),
    roleInput: document.getElementById("roleInput"),
    taskInput: document.getElementById("taskInput"),
    btnSampleBlazor: document.getElementById("btnSampleBlazor"),
    btnClearTask: document.getElementById("btnClearTask"),
    btnRefineTask: document.getElementById("btnRefineTask"),
    refineText: document.getElementById("refineText"),
    refineSpinner: document.getElementById("refineSpinner"),
    promptDisplay: document.getElementById("promptDisplay"),
    statRefinedBadge: document.getElementById("statRefinedBadge"),
    statScore: document.getElementById("statScore"),
    statChars: document.getElementById("statChars"),
    statWords: document.getElementById("statWords"),
    statTokens: document.getElementById("statTokens"),
    btnCopyPrompt: document.getElementById("btnCopyPrompt"),
    copyIcon: document.getElementById("copyIcon"),
    copyText: document.getElementById("copyText"),
    toastContainer: document.getElementById("toastContainer"),

    // Attachments Elements
    attachmentsContainer: document.getElementById("attachmentsContainer"),
    attCountBadge: document.getElementById("attCountBadge"),
    btnBrowseFiles: document.getElementById("btnBrowseFiles"),
    btnBrowseFolder: document.getElementById("btnBrowseFolder"),
    btnClearAttachments: document.getElementById("btnClearAttachments"),
    fileInput: document.getElementById("fileInput"),
    folderInput: document.getElementById("folderInput"),
    dropzone: document.getElementById("dropzone"),
    attachmentsList: document.getElementById("attachmentsList")
  };

  // Initialize
  function init() {
    setupEventListeners();
    setupAttachmentHandlers();
    el.roleInput.value = state.role;
    updatePromptOutput();
  }

  // Event Listeners for Main Form
  function setupEventListeners() {
    // Role Preset Change
    el.rolePresetSelect.addEventListener("change", (e) => {
      const selectedKey = e.target.value;
      if (selectedKey === "blazor_dotnet") {
        state.role = ROLE_PRESETS.blazor_dotnet;
      } else if (ROLE_PRESETS[selectedKey] !== undefined) {
        state.role = ROLE_PRESETS[selectedKey];
      }
      el.roleInput.value = state.role;
      updatePromptOutput();
    });

    // Role Input Edit
    el.roleInput.addEventListener("input", (e) => {
      state.role = e.target.value;
      updatePromptOutput();
    });

    // Task Input Edit (Reset refined state if user modifies input directly)
    el.taskInput.addEventListener("input", (e) => {
      state.rawTask = e.target.value;
      state.refinedTask = null;
      updatePromptOutput();
    });

    // Preset Sample: Blazor & ETL
    el.btnSampleBlazor.addEventListener("click", () => {
      el.rolePresetSelect.value = "blazor_dotnet";
      state.role = ROLE_PRESETS.blazor_dotnet;
      el.roleInput.value = state.role;
      state.rawTask = SAMPLE_TASKS.blazor_etl;
      state.refinedTask = null;
      el.taskInput.value = state.rawTask;
      updatePromptOutput();
      showToast("Contoh Blazor & ETL dimuat!");
    });

    // Clear Task
    el.btnClearTask.addEventListener("click", () => {
      state.rawTask = "";
      state.refinedTask = null;
      el.taskInput.value = "";
      updatePromptOutput();
      showToast("Kotak tugas dibersihkan.");
    });

    // Refine Task Button (Powered directly by Gemini Key)
    el.btnRefineTask.addEventListener("click", handleRefineTask);

    // Copy Prompt Button
    el.btnCopyPrompt.addEventListener("click", handleCopyPrompt);
  }

  // Attachment System Handlers (Browse, Folder, Drag & Drop, Paste)
  function setupAttachmentHandlers() {
    // 1. Browse Files (Multiple)
    el.btnBrowseFiles.addEventListener("click", () => {
      el.fileInput.value = "";
      el.fileInput.click();
    });

    el.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleIncomingFiles(e.target.files);
      }
    });

    // 2. Browse Entire Folder (webkitdirectory)
    el.btnBrowseFolder.addEventListener("click", () => {
      el.folderInput.value = "";
      el.folderInput.click();
    });

    el.folderInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleIncomingFiles(e.target.files);
      }
    });

    // 3. Clear All Attachments
    el.btnClearAttachments.addEventListener("click", () => {
      state.attachments = [];
      renderAttachmentsList();
      updatePromptOutput();
      showToast("Semua berkas lampiran dihapus.", "info");
    });

    // 4. Dropzone Drag & Drop
    el.dropzone.addEventListener("click", (e) => {
      // If clicking dropzone directly, trigger file browser
      if (e.target.tagName !== "BUTTON" && e.target.tagName !== "A") {
        el.fileInput.click();
      }
    });

    ["dragenter", "dragover"].forEach(eventName => {
      el.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "dragend"].forEach(eventName => {
      el.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.dropzone.classList.remove("dragover");
      });
    });

    el.dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.dropzone.classList.remove("dragover");

      // Handle folder drag & drop via webkitGetAsEntry
      const items = e.dataTransfer ? e.dataTransfer.items : null;
      if (items && items.length > 0 && items[0].webkitGetAsEntry) {
        const fileList = [];
        const entries = [];
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry();
          if (entry) entries.push(entry);
        }
        await traverseEntries(entries, fileList);
        if (fileList.length > 0) {
          handleIncomingFiles(fileList);
          return;
        }
      }

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleIncomingFiles(e.dataTransfer.files);
      }
    });

    // Helper: Traverse dragged directories recursively
    async function traverseEntries(entries, fileList, parentPath = "") {
      const ignored = [
        "node_modules", "bin", "obj", ".git", ".vs", ".idea", ".vscode",
        "dist", "build", "TestResults", "packages", ".nuget"
      ];
      for (const entry of entries) {
        if (ignored.includes(entry.name)) continue;
        if (entry.isFile) {
          await new Promise(resolve => {
            entry.file(f => {
              const fullRel = parentPath ? `${parentPath}/${entry.name}` : entry.name;
              try {
                Object.defineProperty(f, 'webkitRelativePath', {
                  value: fullRel,
                  writable: true
                });
              } catch (e) {}
              fileList.push(f);
              resolve();
            }, () => resolve());
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const readAll = () => new Promise(resolve => {
            dirReader.readEntries(async subEntries => {
              if (!subEntries || subEntries.length === 0) return resolve();
              const nextPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
              await traverseEntries(subEntries, fileList, nextPath);
              readAll().then(resolve);
            }, () => resolve());
          });
          await readAll();
        }
      }
    }

    // 5. Global Clipboard Paste Handler
    window.addEventListener("paste", handlePasteEvent);
  }

  // Handle Clipboard Paste (Files or Snippet Text)
  function handlePasteEvent(e) {
    const activeEl = document.activeElement;
    // If typing inside role or task input, don't hijack normal text pasting
    const isTypingInTextarea = activeEl && (activeEl === el.roleInput || activeEl === el.taskInput);

    // Case A: File(s) in clipboard (e.g. copied file from explorer, screenshot, etc.)
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleIncomingFiles(e.clipboardData.files);
      return;
    }

    // Case B: User is focused on Dropzone or explicitly wants to paste code snippet as attachment
    const isDropzoneFocused = activeEl && (activeEl === el.dropzone || el.dropzone.contains(activeEl));
    if (isDropzoneFocused && !isTypingInTextarea) {
      const pastedText = e.clipboardData ? e.clipboardData.getData("text") : "";
      if (pastedText && pastedText.trim()) {
        e.preventDefault();
        const snippetIndex = state.attachments.length + 1;
        const detectedExt = detectExtensionFromContent(pastedText);
        const snippetName = `Snippet_${snippetIndex}.${detectedExt}`;

        addAttachmentRecord({
          name: snippetName,
          sizeFormatted: formatFileSize(pastedText.length),
          ext: detectedExt,
          content: pastedText.trim(),
          isBinary: false
        });

        renderAttachmentsList();
        updatePromptOutput();
        showToast(`📋 Teks/Kode clipboard berhasil ditempel sebagai lampiran: ${snippetName}`, "success");
      }
    }
  }

  // Check if file path belongs to ignored folders (bin, obj, node_modules, etc.)
  function isIgnoredPath(filePath) {
    const normalized = (filePath || "").replace(/\\/g, "/");
    const segments = normalized.split("/");
    const ignored = [
      "node_modules", "bin", "obj", ".git", ".vs", ".idea", ".vscode",
      "dist", "build", "TestResults", "packages", ".nuget"
    ];
    return segments.some(s => ignored.includes(s));
  }

  // Process and read incoming files (Text/Code vs Binary, preserves relative path)
  async function handleIncomingFiles(fileList) {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    let addedCount = 0;

    for (const file of files) {
      const fullPath = file.webkitRelativePath || file.name;
      // Filter out auto-generated build / git folders
      if (isIgnoredPath(fullPath)) continue;

      const sizeFormatted = formatFileSize(file.size);

      // Prevent duplicate file paths if identical size
      const isDuplicate = state.attachments.some(a => a.name === fullPath && a.sizeFormatted === sizeFormatted);
      if (isDuplicate) continue;

      const ext = getFileExtension(file.name);
      const isText = isTextOrCodeFile(file.name, file.type);

      let content = null;
      let isBinary = true;

      if (isText && file.size < 4 * 1024 * 1024) { // Up to 4MB text files
        try {
          content = await readFileAsText(file);
          isBinary = false;
        } catch (err) {
          console.warn("Could not read as text:", fullPath, err);
          content = null;
          isBinary = true;
        }
      }

      addAttachmentRecord({
        name: fullPath,
        sizeFormatted,
        ext,
        content,
        isBinary
      });

      addedCount++;
    }

    if (addedCount > 0) {
      renderAttachmentsList();
      updatePromptOutput();
      showToast(`📎 Berhasil melampirkan ${addedCount} berkas dari folder!`, "success");
    }
  }

  // Read File As Text Helper
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Add item to state.attachments
  function addAttachmentRecord({ name, sizeFormatted, ext, content, isBinary }) {
    state.attachments.push({
      id: "att_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      name,
      sizeFormatted,
      ext: ext.toLowerCase(),
      content,
      isBinary,
      showPreview: false
    });
  }

  // Render Attached Files
  function renderAttachmentsList() {
    const list = el.attachmentsList;
    list.innerHTML = "";

    const count = state.attachments.length;
    if (count === 0) {
      el.attCountBadge.classList.add("hidden");
      el.btnClearAttachments.classList.add("hidden");
      return;
    }

    el.attCountBadge.textContent = `${count} Berkas`;
    el.attCountBadge.classList.remove("hidden");
    el.btnClearAttachments.classList.remove("hidden");

    state.attachments.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "att-item";

      const extClass = getBadgeClassForExt(item.ext);

      itemEl.innerHTML = `
        <div class="att-header-row">
          <div class="att-info">
            <span class="att-ext-badge ${extClass}">${item.ext || "FILE"}</span>
            <span class="att-name" title="${item.name}">${item.name}</span>
            <span class="att-size">(${item.sizeFormatted})</span>
          </div>
          <div class="att-tools">
            ${item.content ? `<button type="button" class="att-btn-action att-btn-preview" title="Lihat cuplikan">${item.showPreview ? "Sembunyikan" : "👁️ Cuplikan"}</button>` : ""}
            <button type="button" class="att-btn-action att-btn-remove" title="Hapus berkas ini">✕</button>
          </div>
        </div>
        ${item.showPreview && item.content ? `<pre class="att-preview-pre"><code>${escapeHtml(item.content.slice(0, 3000))}${item.content.length > 3000 ? "\n\n... (cuplikan dipotong untuk efisiensi tampilan)" : ""}</code></pre>` : ""}
      `;

      // Preview Toggle
      const btnPreview = itemEl.querySelector(".att-btn-preview");
      if (btnPreview) {
        btnPreview.addEventListener("click", () => {
          item.showPreview = !item.showPreview;
          renderAttachmentsList();
        });
      }

      // Remove File
      const btnRemove = itemEl.querySelector(".att-btn-remove");
      if (btnRemove) {
        btnRemove.addEventListener("click", () => {
          state.attachments = state.attachments.filter(a => a.id !== item.id);
          renderAttachmentsList();
          updatePromptOutput();
          showToast(`Berkas ${item.name} dihapus.`);
        });
      }

      list.appendChild(itemEl);
    });
  }

  // Compile Master Prompt (Clean, Strict & Production Ready with Attachments)
  function compilePrompt() {
    const roleText = (state.role && state.role.trim()) ? state.role.trim() : "Senior Software Engineer";
    const taskContent = state.refinedTask || state.rawTask;
    const taskText = (taskContent && taskContent.trim())
      ? taskContent.trim()
      : "(Tuliskan rincian tugas Anda pada kolom input di sebelah kiri...)";

    // Build Attachments Markdown Section
    let attachmentsSection = "";
    if (state.attachments.length > 0) {
      attachmentsSection = `\n\n### LAMPIRAN & REFERENSI TEKNIS\nBerikut adalah rincian berkas dan konteks kode yang dilampirkan:\n`;
      state.attachments.forEach((att, idx) => {
        attachmentsSection += `\n#### [Lampiran ${idx + 1}: ${att.name}] (${att.sizeFormatted})\n`;
        if (att.content && !att.isBinary) {
          const lang = getMarkdownLang(att.ext);
          attachmentsSection += `\`\`\`${lang}\n${att.content.trim()}\n\`\`\`\n`;
        } else {
          attachmentsSection += `*(Berkas biner / referensi lembar kerja: ${att.sizeFormatted})*\n`;
        }
      });
    }

    return `### ROLE
${roleText}

### TASK
${taskText}${attachmentsSection}

### KETENTUAN IMPLEMENTASI
- Fokus terisolasi: Ubah HANYA bagian/file/fungsi yang dispesifikasikan (hindari efek samping ke bagian lain).
- Error handling & validasi: Terapkan penanganan data, null checking, dan logging/error handling menyeluruh.
- Standar penamaan: Pertahankan konsistensi penamaan variabel, skema data, method, dan struktur kode eksisting.
- Format jawaban: Langsung sajikan kode/solusi inti lengkap dengan penjelasan perubahan yang jelas dan siap dieksekusi.`;
  }

  // Calculate Prompt Precision Rate
  function calculatePromptPrecision(role, task) {
    if (!task || !task.trim()) return 0;
    
    let score = 0;
    const cleanTask = task.trim();
    const words = cleanTask.split(/\s+/).length;

    // 1. Role specificity (max 15%)
    if (role && role.trim().length > 20) score += 15;
    else if (role && role.trim().length > 5) score += 10;

    // 2. Task length & depth (max 25%)
    if (words >= 80) score += 25;
    else if (words >= 40) score += 20;
    else if (words >= 15) score += 15;
    else score += 5;

    // 3. Technical file/function specificity (max 20%)
    if (/(\.razor|\.cs|\.ts|\.js|\.py|\.go|\.java|\.php|\.sql|\.json|\.html)/i.test(cleanTask)) score += 10;
    if (/(function|method|endpoint|skema|schema|tabel|table|query|class|interface|controller|service|grid|pivot)/i.test(cleanTask)) score += 10;

    // 4. Action clarity (max 15%)
    if (/(update|ganti|ubah|tambah|buat|perbaiki|refactor|integrasikan|hapus|fix)/i.test(cleanTask)) score += 15;

    // 5. Structure & Organization (max 15%)
    if (/(\n\s*[-*•\d.]+|\n\s*###|\n\s*\*\*)/i.test(cleanTask)) score += 15;

    // 6. Refined Bonus (max 10%)
    if (state.refinedTask) score += 10;

    // 7. Attachments Bonus (+10% if code/files attached)
    if (state.attachments.length > 0) score += 10;

    return Math.min(100, Math.max(10, score));
  }

  // Update Output Preview and Counters
  function updatePromptOutput() {
    const fullPrompt = compilePrompt();
    el.promptDisplay.textContent = fullPrompt;

    const charCount = fullPrompt.length;
    const wordCount = fullPrompt.trim() ? fullPrompt.trim().split(/\s+/).length : 0;
    const approxTokens = Math.round(charCount / 3.8);

    el.statChars.textContent = `${charCount.toLocaleString()} Karakter`;
    el.statWords.textContent = `${wordCount.toLocaleString()} Kata`;
    el.statTokens.textContent = `~${approxTokens.toLocaleString()} Token`;

    // Dynamic Precision Rate Badge
    const effectiveTask = state.refinedTask || state.rawTask;
    const score = calculatePromptPrecision(state.role, effectiveTask);

    if (el.statScore) {
      el.statScore.textContent = `🎯 Presisi: ${score}%`;
      el.statScore.classList.remove("score-high", "score-med", "score-low");
      if (score >= 80) {
        el.statScore.classList.add("score-high");
        el.statScore.title = "Tingkat Presisi Sangat Tinggi (Instruksi sangat jelas, spesifik, dan terstruktur)";
      } else if (score >= 60) {
        el.statScore.classList.add("score-med");
        el.statScore.title = "Tingkat Presisi Sedang (Bagus, klik 'Perbaiki' untuk hasil maksimal)";
      } else {
        el.statScore.classList.add("score-low");
        el.statScore.title = "Tingkat Presisi Rendah (Lengkapi task atau klik tombol ✨ Perbaiki)";
      }
    }

    // Toggle "Dirapikan" Badge
    if (el.statRefinedBadge) {
      if (state.refinedTask) {
        el.statRefinedBadge.classList.remove("hidden");
      } else {
        el.statRefinedBadge.classList.add("hidden");
      }
    }
  }

  // Copy Prompt to Clipboard
  function handleCopyPrompt() {
    const textToCopy = compilePrompt();
    navigator.clipboard.writeText(textToCopy).then(() => {
      el.btnCopyPrompt.classList.add("btn-success");
      el.copyIcon.textContent = "✓";
      el.copyText.textContent = "Berhasil Disalin!";
      showToast("Prompt berhasil disalin ke clipboard!");

      setTimeout(() => {
        el.btnCopyPrompt.classList.remove("btn-success");
        el.copyIcon.textContent = "📋";
        el.copyText.textContent = "Salin Prompt Lengkap";
      }, 2000);
    }).catch(err => {
      showToast("Gagal menyalin prompt: " + err, "error");
    });
  }

  // Intelligent Task Refinement (Powered by Embedded Gemini Key)
  async function handleRefineTask() {
    const rawText = el.taskInput.value.trim();
    if (!rawText) {
      showToast("Tuliskan kalimat tugas terlebih dahulu sebelum diperbaiki.", "warning");
      return;
    }

    // Set Loading State
    el.btnRefineTask.disabled = true;
    el.refineSpinner.classList.remove("hidden");
    if (el.refineText) el.refineText.textContent = "Merapikan via Gemini 3.6 Flash...";

    try {
      let refined = null;
      let usedAi = false;

      // Prepare lightweight attachment metadata for Gemini
      const attMeta = state.attachments.map(a => ({
        name: a.name,
        size: a.sizeFormatted,
        content: a.content ? a.content.slice(0, 2000) : ""
      }));

      // Call Backend Refine Endpoint (Securely connects with embedded Gemini Key)
      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: rawText,
            role: state.role,
            provider: "gemini",
            model: "gemini-3.6-flash",
            attachments: attMeta
          })
        });

        const data = await res.json();
        if (res.ok && data.refined && data.refined.trim()) {
          refined = data.refined.trim();
          usedAi = true;
        } else if (!res.ok) {
          console.warn("API refine returned error:", data.error);
        }
      } catch (apiErr) {
        console.warn("API refine failed, fallback to local heuristic:", apiErr);
      }

      // Local Heuristic Refiner (Fallback only if offline/network issue)
      if (!refined) {
        refined = cleanAndStructureTaskLocally(rawText);
      }

      // Apply Refined Text ONLY to the output master prompt (Keep user's input textarea untouched)
      state.refinedTask = refined;
      updatePromptOutput();

      if (usedAi) {
        showToast("✨ Berhasil dirapikan & distrukturkan oleh Gemini 3.6 Flash!", "success");
      } else {
        showToast("✨ Hasil Master Prompt dirapikan secara heuristik.", "info");
      }

    } catch (err) {
      showToast("Gagal merapikan teks: " + err.message, "error");
    } finally {
      el.btnRefineTask.disabled = false;
      el.refineSpinner.classList.add("hidden");
      if (el.refineText) el.refineText.textContent = "Perbaiki & Rapikan Kalimat Task (AI Gemini)";
    }
  }

  // Local Intelligent Heuristic Parser & Restructurer (Offline Fallback)
  function cleanAndStructureTaskLocally(text) {
    let clean = text
      .replace(/Catatan Penting & Ketentuan:[\s\S]*$/i, "")
      .replace(/### FORMAT[\s\S]*$/i, "")
      .replace(/### NEGATIVE CONSTRAINTS[\s\S]*$/i, "")
      .trim();

    const rawLines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const structuredItems = [];

    rawLines.forEach(line => {
      let content = line.replace(/^[-*•\d.)\t ]+/, "").trim();
      if (!content) return;

      const subClauses = content
        .split(/(?:,|\bkarena\b|\bkemudian\b|\blalu\b|\bserta\b)(?=\s*(?:ubah|ganti|tambahkan|pastikan|update|samakan|buatkan))/i)
        .map(s => s.trim())
        .filter(Boolean);

      if (subClauses.length > 1) {
        structuredItems.push({ title: subClauses[0], subs: subClauses.slice(1) });
      } else {
        structuredItems.push({ title: content, subs: [] });
      }
    });

    let result = "";
    structuredItems.forEach((item, idx) => {
      result += `${idx + 1}. ${item.title}\n`;
      if (item.subs && item.subs.length > 0) {
        item.subs.forEach(sub => {
          result += `   * ${sub}\n`;
        });
      }
    });

    result = result
      .replace(/di lempar/gi, "dilempar")
      .replace(/\n{3,}/g, "\n\n");

    return result.trim();
  }

  // Helper: Format File Size
  function formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  // Helper: Extract File Extension
  function getFileExtension(filename) {
    if (!filename || !filename.includes(".")) return "txt";
    return filename.split(".").pop().toLowerCase();
  }

  // Helper: Determine if file is text/code
  function isTextOrCodeFile(filename, mimeType) {
    if (mimeType && (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml") || mimeType.includes("javascript"))) {
      return true;
    }
    const ext = getFileExtension(filename);
    const codeExts = [
      "cs", "razor", "ts", "js", "jsx", "tsx", "html", "css", "scss",
      "py", "sql", "json", "md", "txt", "yaml", "yml", "xml", "csv",
      "sh", "bash", "bat", "ps1", "go", "java", "kt", "rs", "cpp", "c",
      "h", "hpp", "php", "rb", "swift", "dart", "env", "gitignore"
    ];
    return codeExts.includes(ext);
  }

  // Helper: Map extension to markdown language identifier
  function getMarkdownLang(ext) {
    const map = {
      razor: "razor",
      cs: "csharp",
      ts: "typescript",
      js: "javascript",
      py: "python",
      sql: "sql",
      json: "json",
      html: "html",
      css: "css",
      xml: "xml",
      md: "markdown",
      sh: "bash",
      yml: "yaml",
      yaml: "yaml",
      csv: "csv"
    };
    return map[ext] || "";
  }

  // Helper: Get badge color class
  function getBadgeClassForExt(ext) {
    if (["cs", "razor", "ts", "js", "py", "go", "java", "cpp"].includes(ext)) return "att-ext-code";
    if (["xlsx", "xls", "csv"].includes(ext)) return "att-ext-sheet";
    if (["sql", "json", "xml", "yml", "yaml"].includes(ext)) return "att-ext-code";
    return "att-ext-text";
  }

  // Helper: Guess extension from pasted text
  function detectExtensionFromContent(text) {
    if (/@code\b|@inject\b|@page\b|<[A-Z]\w+.*>/.test(text)) return "razor";
    if (/\bnamespace\b|\busing\s+System|\bpublic\s+class\b/.test(text)) return "cs";
    if (/\bSELECT\b|\bFROM\b|\bWHERE\b|\bINSERT\b/i.test(text)) return "sql";
    if (/^\s*[\{\[]/.test(text)) return "json";
    if (/\bfunction\b|\bconst\b|\blet\b|\bimport\b/.test(text)) return "js";
    return "txt";
  }

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Toast Notification System
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "ℹ️";
    if (type === "success") icon = "✅";
    if (type === "warning") icon = "⚠️";
    if (type === "error") icon = "❌";

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Start
  document.addEventListener("DOMContentLoaded", init);
})();
