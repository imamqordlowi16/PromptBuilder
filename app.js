// app.js - Precision Role & Task Prompt Architect with Embedded Gemini Refinement
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
    refinedTask: null
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
    toastContainer: document.getElementById("toastContainer")
  };

  // Initialize
  function init() {
    setupEventListeners();
    el.roleInput.value = state.role;
    updatePromptOutput();
  }

  // Event Listeners
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

    // Refine Task Button (Powered directly by Gemini)
    el.btnRefineTask.addEventListener("click", handleRefineTask);

    // Copy Prompt Button
    el.btnCopyPrompt.addEventListener("click", handleCopyPrompt);
  }

  // Compile Master Prompt (Clean, Strict & Production Ready)
  function compilePrompt() {
    const roleText = (state.role && state.role.trim()) ? state.role.trim() : "Senior Software Engineer";
    // Prioritize refined task if available, otherwise raw input
    const taskContent = state.refinedTask || state.rawTask;
    const taskText = (taskContent && taskContent.trim())
      ? taskContent.trim()
      : "(Tuliskan rincian tugas Anda pada kolom input di sebelah kiri...)";

    return `### ROLE
${roleText}

### TASK
${taskText}

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

      // Call Backend Refine Endpoint (Securely connects with embedded Gemini Key)
      try {
        const res = await fetch("/api/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task: rawText,
            role: state.role,
            provider: "gemini",
            model: "gemini-3.6-flash"
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
