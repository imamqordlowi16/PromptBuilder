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
    attachments: [], // Array of { id, name, sizeFormatted, type, ext, content, isBinary }
    previousPromptContext: null, // Context/assumptions saved from previous session
    continuationStep: 1 // Current continuation step counter
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

    // Continuation & Evaluation Elements
    continuationBanner: document.getElementById("continuationBanner"),
    contStepNum: document.getElementById("contStepNum"),
    btnResetContinuation: document.getElementById("btnResetContinuation"),
    revisionBox: document.getElementById("revisionBox"),
    revisionInput: document.getElementById("revisionInput"),
    btnSubmitRevision: document.getElementById("btnSubmitRevision"),
    btnCloseRevision: document.getElementById("btnCloseRevision"),
    revSpinner: document.getElementById("revSpinner"),
    promptEvalCard: document.getElementById("promptEvalCard"),
    btnConfirmSatisfied: document.getElementById("btnConfirmSatisfied"),
    btnFinishNewSession: document.getElementById("btnFinishNewSession"),
    btnTriggerRevision: document.getElementById("btnTriggerRevision"),
    btnDismissEval: document.getElementById("btnDismissEval"),
    btnContinuePrompting: document.getElementById("btnContinuePrompting"),
    btnFinishNewSessionAction: document.getElementById("btnFinishNewSessionAction"),
    btnContStepNum: document.getElementById("btnContStepNum"),

    // Attachments Elements
    attachmentsContainer: document.getElementById("attachmentsContainer"),
    attCountBadge: document.getElementById("attCountBadge"),
    btnBrowseFiles: document.getElementById("btnBrowseFiles"),
    btnBrowseFolder: document.getElementById("btnBrowseFolder"),
    btnDropzoneFiles: document.getElementById("btnDropzoneFiles"),
    btnDropzoneFolder: document.getElementById("btnDropzoneFolder"),
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
    if (el.btnSampleBlazor) {
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
    }

    // Clear Task
    if (el.btnClearTask) {
      el.btnClearTask.addEventListener("click", () => {
        state.rawTask = "";
        state.refinedTask = null;
        el.taskInput.value = "";
        updatePromptOutput();
        showToast("Kotak tugas dibersihkan.");
      });
    }

    // Refine Task Button (Powered directly by Gemini Key)
    if (el.btnRefineTask) {
      el.btnRefineTask.addEventListener("click", handleRefineTask);
    }

    // Copy Prompt Button
    if (el.btnCopyPrompt) {
      el.btnCopyPrompt.addEventListener("click", handleCopyPrompt);
    }

    // Evaluation: Sudah Sesuai (Lanjutkan Sesi Ngeprompt)
    if (el.btnConfirmSatisfied) {
      el.btnConfirmSatisfied.addEventListener("click", handleStartContinuation);
    }

    // Evaluation: Selesai (Buat Sesi Baru)
    if (el.btnFinishNewSession) {
      el.btnFinishNewSession.addEventListener("click", handleFinishNewSession);
    }

    // Output Action Row: Direct Lanjutkan Ngeprompt Button
    if (el.btnContinuePrompting) {
      el.btnContinuePrompting.addEventListener("click", handleStartContinuation);
    }

    // Output Action Row: Selesai Buat Sesi Baru Button
    if (el.btnFinishNewSessionAction) {
      el.btnFinishNewSessionAction.addEventListener("click", handleFinishNewSession);
    }

    // Reset Continuation Sesi
    if (el.btnResetContinuation) {
      el.btnResetContinuation.addEventListener("click", handleResetContinuation);
    }

    // Evaluation: Belum Sesuai (Buka Kotak Revisi)
    if (el.btnTriggerRevision) {
      el.btnTriggerRevision.addEventListener("click", () => {
        hidePromptEvaluation();
        if (el.revisionBox) {
          el.revisionBox.classList.remove("hidden");
          if (el.revisionInput) {
            el.revisionInput.focus();
            el.revisionBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      });
    }

    // Dismiss Evaluation Card
    if (el.btnDismissEval) {
      el.btnDismissEval.addEventListener("click", hidePromptEvaluation);
    }

    // Close Revision Box
    if (el.btnCloseRevision) {
      el.btnCloseRevision.addEventListener("click", () => {
        if (el.revisionBox) el.revisionBox.classList.add("hidden");
      });
    }

    // Submit AI Revision
    if (el.btnSubmitRevision) {
      el.btnSubmitRevision.addEventListener("click", handleExecuteRevision);
    }

    // Revision Input Enter Key Shortcut
    if (el.revisionInput) {
      el.revisionInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleExecuteRevision();
        }
      });
    }
  }

  // Attachment System Handlers (Browse, Folder, Drag & Drop, Paste)
  function setupAttachmentHandlers() {
    // 1. Browse Files (Multiple)
    const triggerFilePicker = (e) => {
      if (e) e.stopPropagation();
      el.fileInput.value = "";
      el.fileInput.click();
    };
    el.btnBrowseFiles.addEventListener("click", triggerFilePicker);
    if (el.btnDropzoneFiles) el.btnDropzoneFiles.addEventListener("click", triggerFilePicker);

    el.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleIncomingFiles(e.target.files);
      }
    });

    // 2. Browse Entire Folder (Modern showDirectoryPicker with instant folder skipping + webkitdirectory fallback)
    const triggerFolderPicker = async (e) => {
      if (e) e.stopPropagation();

      // Priority 1: Modern File System Access API (Chrome, Edge, Opera)
      // Ini mencegah browser membaca 130.000+ file di node_modules/.git dan
      // menghilangkan dialog "Upload 136.038 file" yang membekukan browser.
      if (window.showDirectoryPicker) {
        try {
          const dirHandle = await window.showDirectoryPicker({ mode: "read" });
          await handleDirectoryPicker(dirHandle);
          return;
        } catch (err) {
          // Jika user membatalkan (Cancel), jangan lakukan apa-apa
          if (err.name === "AbortError") return;
          console.warn("showDirectoryPicker tidak diizinkan atau gagal, gunakan fallback input:", err);
        }
      }

      // Priority 2: Fallback ke webkitdirectory input
      el.folderInput.value = "";
      el.folderInput.click();
    };
    el.btnBrowseFolder.addEventListener("click", triggerFolderPicker);
    if (el.btnDropzoneFolder) el.btnDropzoneFolder.addEventListener("click", triggerFolderPicker);

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

    // Helper: Traverse dragged directories recursively with instant skip
    async function traverseEntries(entries, fileList, parentPath = "") {
      for (const entry of entries) {
        if (isIgnoredFolder(entry.name)) continue;
        if (entry.isFile) {
          if (isIgnoredFile(entry.name)) continue;
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

  // Set of folders to completely ignore and skip
  const IGNORED_FOLDERS = new Set([
    "node_modules", "bin", "obj", ".git", ".github", ".vs", ".idea", ".vscode",
    "dist", "build", "out", ".next", ".nuxt", ".output", "coverage", ".nyc_output",
    "testresults", "packages", ".nuget", "vendor", "__pycache__", ".pytest_cache",
    ".venv", "venv", "env", ".cache", ".turbo", ".gradle", "target", "tmp", "temp",
    ".angular", ".svelte-kit", "pods", "deriveddata"
  ]);

  // Set of heavy / lock files to ignore
  const IGNORED_FILES = new Set([
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
    "composer.lock", "cargo.lock", "gemfile.lock", ".ds_store", "thumbs.db"
  ]);

  function isIgnoredFolder(folderName) {
    if (!folderName) return false;
    return IGNORED_FOLDERS.has(folderName.toLowerCase());
  }

  function isIgnoredFile(fileName) {
    if (!fileName) return false;
    return IGNORED_FILES.has(fileName.toLowerCase());
  }

  // Check if relative path belongs to ignored folders (bin, obj, node_modules, etc.)
  function isIgnoredPath(filePath) {
    if (!filePath) return false;
    const normalized = filePath.replace(/\\/g, "/");
    const segments = normalized.split("/");
    for (let i = 0; i < segments.length - 1; i++) {
      if (isIgnoredFolder(segments[i])) return true;
    }
    return false;
  }

  // Handler for File System Access API (showDirectoryPicker)
  // Super cepat karena node_modules dan .git langsung dilewati di root/cabang folder
  async function handleDirectoryPicker(dirHandle) {
    showToast("⚡ Memindai folder... (Melewati otomatis node_modules & .git)", "info");
    const collectedFiles = [];
    const MAX_FILES = 200; // Batas wajar agar prompt LLM tidak meledak

    async function scanDirectory(handle, currentPath = "") {
      if (collectedFiles.length >= MAX_FILES) return;

      for await (const [name, entry] of handle.entries()) {
        if (collectedFiles.length >= MAX_FILES) break;

        if (entry.kind === "directory") {
          // Lewati folder berat langsung! Tidak pernah membuka isinya
          if (isIgnoredFolder(name)) continue;
          const nextPath = currentPath ? `${currentPath}/${name}` : name;
          await scanDirectory(entry, nextPath);
        } else if (entry.kind === "file") {
          if (isIgnoredFile(name)) continue;
          try {
            const file = await entry.getFile();
            const fullRel = currentPath ? `${currentPath}/${name}` : name;
            try {
              Object.defineProperty(file, "webkitRelativePath", {
                value: fullRel,
                writable: true
              });
            } catch (e) {}
            collectedFiles.push(file);
          } catch (e) {}
        }
      }
    }

    try {
      await scanDirectory(dirHandle, dirHandle.name);
    } catch (err) {
      console.error("Gagal saat memindai direktori:", err);
      showToast("Gagal membaca sebagian berkas pada folder.", "error");
    }

    if (collectedFiles.length === 0) {
      showToast("Tidak ada berkas kode/teks yang ditemukan pada folder ini.", "warning");
      return;
    }

    if (collectedFiles.length >= MAX_FILES) {
      showToast(`Membatasi ${MAX_FILES} berkas pertama untuk efisiensi context window prompt.`, "warning");
    }

    await handleIncomingFiles(collectedFiles);
  }

  // Process and read incoming files (Text/Code vs Binary, preserves relative path)
  async function handleIncomingFiles(fileList) {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    // Fast O(1) deduplication check using Set
    const existingNames = new Set(state.attachments.map(a => a.name));

    // Fast filter: hanya ambil berkas yang valid & belum ada
    const validQueue = [];
    for (const file of rawFiles) {
      const fullPath = file.webkitRelativePath || file.name;
      if (isIgnoredPath(fullPath)) continue;
      if (isIgnoredFile(file.name)) continue;
      if (existingNames.has(fullPath)) continue;

      validQueue.push({ file, fullPath });
    }

    if (validQueue.length === 0) {
      showToast("Semua berkas diabaikan (folder build/cache atau berkas duplikat).", "info");
      return;
    }

    // Safety limit untuk mencegah tab browser hang jika user mengunggah ratusan file
    const MAX_PROCESS = 150;
    const toProcess = validQueue.slice(0, MAX_PROCESS);
    if (validQueue.length > MAX_PROCESS) {
      showToast(`Membatasi ${MAX_PROCESS} berkas agar tidak membebani browser dan token prompt.`, "warning");
    }

    // Baca file secara paralel dalam batch (15 concurrent reads)
    const BATCH_SIZE = 15;
    let addedCount = 0;

    for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
      const batch = toProcess.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async ({ file, fullPath }) => {
        const sizeFormatted = formatFileSize(file.size);
        const ext = getFileExtension(file.name);
        const isText = isTextOrCodeFile(file.name, file.type);

        let content = null;
        let isBinary = true;

        if (isText && file.size < 3 * 1024 * 1024) { // Sampai dengan 3MB teks
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

        existingNames.add(fullPath);
        addedCount++;
      }));
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

    let priorContextSection = "";
    if (state.previousPromptContext) {
      priorContextSection = `### KONTEKS & ASUMSI DARI SESI SEBELUMNYA (TAHAP ${state.continuationStep - 1})
Berikut adalah arsitektur, asumsi, dan hasil implementasi yang telah disepakati dari tahap sebelumnya:
"""
${state.previousPromptContext}
"""
Instruksi TASK di bawah ini merupakan KELANJUTAN TAHAP KE-${state.continuationStep} yang wajib dibangun secara konsisten di atas fondasi implementasi sebelumnya.\n\n`;
    }

    return `### ROLE
${roleText}

${priorContextSection}### TASK
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

      // Tampilkan notifikasi / kartu evaluasi hasil prompt
      showPromptEvaluation();
    }).catch(err => {
      showToast("Gagal menyalin prompt: " + err, "error");
    });
  }

  // Show / Hide Prompt Evaluation Notification
  function showPromptEvaluation() {
    if (el.promptEvalCard) {
      el.promptEvalCard.classList.remove("hidden");
      el.promptEvalCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function hidePromptEvaluation() {
    if (el.promptEvalCard) {
      el.promptEvalCard.classList.add("hidden");
    }
  }

  // Handle Continuation: Proceed to next prompt stage with prior assumptions
  function handleStartContinuation() {
    const currentPrompt = compilePrompt();
    if (!currentPrompt || (!state.rawTask && !state.refinedTask)) {
      showToast("Tuliskan dan susun prompt terlebih dahulu sebelum melanjutkan sesi.", "warning");
      return;
    }

    // Save current prompt as prior context
    state.previousPromptContext = currentPrompt;
    state.continuationStep += 1;

    // Update Banner & Continuation Action Button
    if (el.continuationBanner) el.continuationBanner.classList.remove("hidden");
    if (el.contStepNum) el.contStepNum.textContent = `Tahap ${state.continuationStep}`;
    if (el.btnContinuePrompting) el.btnContinuePrompting.classList.remove("hidden");
    if (el.btnContStepNum) el.btnContStepNum.textContent = `${state.continuationStep}`;

    // Reset task inputs for next prompt
    state.rawTask = "";
    state.refinedTask = null;
    el.taskInput.value = "";
    el.taskInput.placeholder = `Tuliskan requirement lanjutan untuk Tahap ${state.continuationStep} di sini...\n(AI akan mengingat seluruh arsitektur, asumsi, dan kode dari Tahap ${state.continuationStep - 1})`;

    // Hide evaluation and revision boxes
    hidePromptEvaluation();
    if (el.revisionBox) el.revisionBox.classList.add("hidden");

    // Refresh prompt preview & focus input
    updatePromptOutput();
    el.taskInput.focus();
    el.taskInput.scrollIntoView({ behavior: "smooth", block: "center" });

    showToast(`🚀 Mode Lanjutan Aktif! Menulis prompt untuk Tahap ${state.continuationStep} dengan asumsi tahap sebelumnya.`, "success");
  }

  // Reset Continuation
  function handleResetContinuation() {
    state.previousPromptContext = null;
    state.continuationStep = 1;

    if (el.continuationBanner) el.continuationBanner.classList.add("hidden");
    if (el.btnContinuePrompting) el.btnContinuePrompting.classList.add("hidden");
    el.taskInput.placeholder = "Tempel atau ketik requirement tugas Anda di sini...\nContoh:\n- Update PDN.razor tab 1 (Rasio PDN)\n- Ubah fungsi LoadPdnKelompokPage ganti skema etl jadi RASIO_PDN_SEBELUM_TD_VALAS_KELOMPOK\n- Ubah grid jadi LoadPivotAsync dan pasang filter tanggal dan kelompok bank...";

    updatePromptOutput();
    showToast("Sesi lanjutan direset. Kembali ke prompt mandiri awal.", "info");
  }

  // Handle Finish & Start Fresh Session
  function handleFinishNewSession() {
    state.previousPromptContext = null;
    state.continuationStep = 1;
    state.rawTask = "";
    state.refinedTask = null;

    el.taskInput.value = "";
    el.taskInput.placeholder = `Tempel atau ketik requirement tugas Anda di sini...
Contoh:
- Update PDN.razor tab 1 (Rasio PDN)
- Ubah fungsi LoadPdnKelompokPage ganti skema etl jadi RASIO_PDN_SEBELUM_TD_VALAS_KELOMPOK
- Ubah grid jadi LoadPivotAsync dan pasang filter tanggal dan kelompok bank...`;

    if (el.continuationBanner) el.continuationBanner.classList.add("hidden");
    if (el.btnContinuePrompting) el.btnContinuePrompting.classList.add("hidden");
    if (el.revisionBox) el.revisionBox.classList.add("hidden");
    hidePromptEvaluation();

    updatePromptOutput();
    el.taskInput.focus();
    el.taskInput.scrollIntoView({ behavior: "smooth", block: "center" });

    showToast("🎉 Sesi selesai! Form dibersihkan dan siap untuk membuat prompt sesi baru.", "success");
  }

  // Execute AI Revision based on user's correction note
  async function handleExecuteRevision() {
    const revisionNote = el.revisionInput ? el.revisionInput.value.trim() : "";
    if (!revisionNote) {
      showToast("Ketik catatan revisi terlebih dahulu (poin apa yang ingin disesuaikan).", "warning");
      if (el.revisionInput) el.revisionInput.focus();
      return;
    }

    const currentTask = el.taskInput.value.trim() || state.rawTask;
    if (!currentTask) {
      showToast("Tidak ada task aktif untuk direvisi.", "warning");
      return;
    }

    // Loading State
    if (el.btnSubmitRevision) el.btnSubmitRevision.disabled = true;
    if (el.revSpinner) el.revSpinner.classList.remove("hidden");

    try {
      const { tree, techStack, smartAttachments } = analyzeCodebaseContext(currentTask, state.attachments);

      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: currentTask,
          role: state.role,
          provider: "gemini",
          model: "gemini-3.6-flash",
          revisionNote: revisionNote,
          attachments: smartAttachments,
          codebaseTree: tree,
          techStack: techStack
        })
      });

      const data = await res.json();
      if (res.ok && data.refined && data.refined.trim()) {
        const revised = data.refined.trim();
        state.refinedTask = revised;
        state.rawTask = revised;
        el.taskInput.value = revised;
        updatePromptOutput();

        if (el.revisionInput) el.revisionInput.value = "";
        if (el.revisionBox) el.revisionBox.classList.add("hidden");

        showToast("✨ Revisi berhasil diterapkan oleh AI sesuai catatan Anda!", "success");
        showPromptEvaluation();
      } else {
        showToast("Gagal memproses revisi: " + (data.error || "Respon AI kosong"), "error");
      }
    } catch (err) {
      showToast("Kesalahan jaringan saat revisi: " + err.message, "error");
    } finally {
      if (el.btnSubmitRevision) el.btnSubmitRevision.disabled = false;
      if (el.revSpinner) el.revSpinner.classList.add("hidden");
    }
  }

  // Analyze Codebase Architecture, Directory Tree & Prioritize Relevant Files
  function analyzeCodebaseContext(rawTask, attachments) {
    if (!attachments || attachments.length === 0) {
      return { tree: "", techStack: "", smartAttachments: [] };
    }

    // 1. Detect Frameworks / Languages
    const extCounts = {};
    attachments.forEach(a => {
      const ext = a.ext ? a.ext.toLowerCase() : "txt";
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    });

    const detectedTech = [];
    if (extCounts["razor"] || extCounts["cs"]) detectedTech.push(".NET / C# & Blazor");
    if (extCounts["ts"] || extCounts["tsx"]) detectedTech.push("TypeScript / Modern Frontend");
    if (extCounts["js"] || extCounts["jsx"]) detectedTech.push("JavaScript / Node.js");
    if (extCounts["py"]) detectedTech.push("Python");
    if (extCounts["sql"]) detectedTech.push("SQL Database");
    if (extCounts["go"]) detectedTech.push("Golang");
    if (extCounts["java"] || extCounts["kt"]) detectedTech.push("Java / Kotlin");
    if (extCounts["xlsx"] || extCounts["xls"] || extCounts["csv"]) detectedTech.push("Spreadsheet Data Reference");

    const techStack = detectedTech.join(", ") || "General Source Code";

    // 2. Build Directory Tree
    const paths = attachments.map(a => a.name).sort();
    let tree = "";
    if (paths.length <= 80) {
      tree = paths.map(p => `├── ${p}`).join("\n");
    } else {
      tree = paths.slice(0, 60).map(p => `├── ${p}`).join("\n") + `\n└── ... dan ${paths.length - 60} berkas lainnya`;
    }

    // 3. Smart Attachment Prioritization based on user task mentions
    const lowerTask = (rawTask || "").toLowerCase();
    const smartAttachments = attachments.map(att => {
      const baseName = att.name.split("/").pop().toLowerCase();
      const isTarget = lowerTask.includes(baseName) || (att.name && lowerTask.includes(att.name.toLowerCase()));
      
      let contentSnippet = "";
      if (att.content && typeof att.content === "string") {
        // Target files get generous content up to 5000 chars, others up to 1600 chars
        const maxLen = isTarget ? 5000 : 1600;
        contentSnippet = att.content.slice(0, maxLen);
        if (att.content.length > maxLen) {
          contentSnippet += "\n... (cuplikan berlanjut)";
        }
      }

      return {
        name: att.name,
        size: att.sizeFormatted,
        ext: att.ext,
        isTarget,
        content: contentSnippet
      };
    });

    return { tree, techStack, smartAttachments };
  }

  // Intelligent Task Refinement (Powered by Embedded Gemini Key with Deep Codebase Analysis)
  async function handleRefineTask() {
    const rawText = el.taskInput.value.trim();
    if (!rawText) {
      showToast("Tuliskan kalimat tugas terlebih dahulu sebelum diperbaiki.", "warning");
      return;
    }

    const hasAttachments = state.attachments.length > 0;

    // Set Loading State
    el.btnRefineTask.disabled = true;
    el.refineSpinner.classList.remove("hidden");
    if (el.refineText) {
      el.refineText.textContent = hasAttachments 
        ? "🧠 Menganalisis alur & struktur berkas (Gemini)..." 
        : "Merapikan via Gemini 3.6 Flash...";
    }

    try {
      let refined = null;
      let usedAi = false;

      // Analyze Codebase Architecture, Directory Tree & Prioritize Files
      const { tree, techStack, smartAttachments } = analyzeCodebaseContext(rawText, state.attachments);

      // Call Backend Refine Endpoint
      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: rawText,
            role: state.role,
            provider: "gemini",
            model: "gemini-3.6-flash",
            attachments: smartAttachments,
            codebaseTree: tree,
            techStack: techStack
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

      // Update both task input textarea and master prompt state so user can see & edit
      state.refinedTask = refined;
      el.taskInput.value = refined;
      state.rawTask = refined;
      updatePromptOutput();

      if (usedAi) {
        if (hasAttachments) {
          showToast(`✨ Sukses! Task dipahami & disusun berdasarkan alur ${state.attachments.length} berkas!`, "success");
        } else {
          showToast("✨ Berhasil dirapikan & distrukturkan oleh Gemini 3.6 Flash!", "success");
        }
      } else {
        showToast("✨ Hasil Master Prompt dirapikan secara heuristik.", "info");
      }

      // Tampilkan notifikasi / dialog evaluasi apakah hasil prompt sudah sesuai
      showPromptEvaluation();
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
