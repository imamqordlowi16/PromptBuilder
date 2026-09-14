// app.js - Precision Role & Task Prompt Architect with Intelligent Auto-Refine
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
    task: "",
    aiProvider: "gemini",
    aiModel: "gemini-3.6-flash",
    aiEndpoint: "",
    aiApiKey: ""
  };

  // Provider Models Catalog (Dropdown Options)
  const PROVIDER_MODELS = {
    gemini: [
      { value: "gemini-3.6-flash", label: "Gemini 3.6 Flash (Terbaru, Cepat & Cerdas) ⭐ Default", default: true },
      { value: "gemini-3.6-pro", label: "Gemini 3.6 Pro (Penalaran Kompleks & Kode Arsitektur)" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Alternatif Cepat)" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Ringan)" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Long Context)" },
      { value: "custom", label: "✏️ Ketik Nama Model Lain (Kustom)" }
    ],
    claude: [
      { value: "claude-3-7-sonnet-latest", label: "Claude 3.7 Sonnet (Hybrid Reasoning) ⭐ Rekomendasi", default: true },
      { value: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet v2" },
      { value: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku (Super Cepat)" },
      { value: "claude-3-opus-latest", label: "Claude 3 Opus" },
      { value: "custom", label: "✏️ Ketik Nama Model Lain (Kustom)" }
    ],
    adacode: [
      { value: "default", label: "AdaCode Sesi Aktif (Default IDE)", default: true },
      { value: "gpt-4o", label: "GPT-4o (Omni Model)" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "o3-mini", label: "o3-mini Reasoning" },
      { value: "claude-3.7-sonnet", label: "Claude 3.7 Sonnet (Proxy Sesi)" },
      { value: "deepseek-chat", label: "DeepSeek V3 / R1" },
      { value: "custom", label: "✏️ Ketik Nama Model Lain (Kustom)" }
    ]
  };

  // DOM Elements
  const el = {
    rolePresetSelect: document.getElementById("rolePresetSelect"),
    roleInput: document.getElementById("roleInput"),
    taskInput: document.getElementById("taskInput"),
    btnSampleBlazor: document.getElementById("btnSampleBlazor"),
    btnClearTask: document.getElementById("btnClearTask"),
    btnRefineTask: document.getElementById("btnRefineTask"),
    refineSpinner: document.getElementById("refineSpinner"),
    promptDisplay: document.getElementById("promptDisplay"),
    statScore: document.getElementById("statScore"),
    statChars: document.getElementById("statChars"),
    statWords: document.getElementById("statWords"),
    statTokens: document.getElementById("statTokens"),
    btnCopyPrompt: document.getElementById("btnCopyPrompt"),
    copyIcon: document.getElementById("copyIcon"),
    copyText: document.getElementById("copyText"),
    btnToggleAiTest: document.getElementById("btnToggleAiTest"),
    aiTestConsole: document.getElementById("aiTestConsole"),
    aiTestToggleHeader: document.getElementById("aiTestToggleHeader"),
    btnCollapseAi: document.getElementById("btnCollapseAi"),
    aiProviderSelect: document.getElementById("aiProviderSelect"),
    aiModelSelect: document.getElementById("aiModelSelect"),
    aiCustomModelInput: document.getElementById("aiCustomModelInput"),
    customEndpointGroup: document.getElementById("customEndpointGroup"),
    aiEndpointInput: document.getElementById("aiEndpointInput"),
    aiApiKeyInput: document.getElementById("aiApiKeyInput"),
    btnToggleKeyVis: document.getElementById("btnToggleKeyVis"),
    btnRunAiTest: document.getElementById("btnRunAiTest"),
    runAiText: document.getElementById("runAiText"),
    aiRunSpinner: document.getElementById("aiRunSpinner"),
    aiResponseContainer: document.getElementById("aiResponseContainer"),
    aiResponseContent: document.getElementById("aiResponseContent"),
    btnCopyAiResponse: document.getElementById("btnCopyAiResponse"),
    toastContainer: document.getElementById("toastContainer")
  };

  // Initialize
  function init() {
    loadSavedAiConfig();
    setupEventListeners();
    checkServerConfig();

    // Default Role & Initial Render
    el.roleInput.value = state.role;
    updatePromptOutput();
  }

  // Check if backend has a pre-configured server key
  async function checkServerConfig() {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const cfg = await res.json();
        state.hasServerKey = !!cfg.hasServerKey;
        if (state.hasServerKey) {
          if (!el.aiApiKeyInput.value.trim()) {
            el.aiApiKeyInput.placeholder = "🔒 Opsional (Kunci Server Gemini Aktif - Siap Pakai Langsung)";
          }
          const keyHint = document.querySelector(".key-hint");
          if (keyHint) {
            keyHint.innerHTML = "✅ <strong>Kunci Server Aktif:</strong> Anda & pengunjung lain bisa langsung mengeksekusi Gemini 3 secara gratis tanpa memasukkan key pribadi.";
            keyHint.style.color = "#34d399";
          }
        }
      }
    } catch (e) {
      console.warn("Could not check server config:", e);
    }
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

    // Task Input Edit
    el.taskInput.addEventListener("input", (e) => {
      state.task = e.target.value;
      updatePromptOutput();
    });

    // Preset Sample: Blazor
    el.btnSampleBlazor.addEventListener("click", () => {
      el.rolePresetSelect.value = "blazor_dotnet";
      state.role = ROLE_PRESETS.blazor_dotnet;
      el.roleInput.value = state.role;
      state.task = SAMPLE_TASKS.blazor_etl;
      el.taskInput.value = state.task;
      updatePromptOutput();
      showToast("Contoh Blazor & ETL dimuat!");
    });

    // Clear Task
    el.btnClearTask.addEventListener("click", () => {
      state.task = "";
      el.taskInput.value = "";
      updatePromptOutput();
      showToast("Kotak tugas dibersihkan.");
    });

    // Refine Task Button
    el.btnRefineTask.addEventListener("click", handleRefineTask);

    // Copy Prompt Button
    el.btnCopyPrompt.addEventListener("click", handleCopyPrompt);

    // Toggle AI Test Console
    el.btnToggleAiTest.addEventListener("click", () => {
      toggleAiConsole(true);
    });
    el.aiTestToggleHeader.addEventListener("click", () => {
      toggleAiConsole();
    });

    // Provider Change
    el.aiProviderSelect.addEventListener("change", (e) => {
      const prov = e.target.value;
      state.aiProvider = prov;
      if (prov === "adacode") {
        el.customEndpointGroup.style.display = "block";
      } else {
        el.customEndpointGroup.style.display = "none";
      }
      renderModelOptions(prov);
      saveAiConfig();
    });

    // Model Dropdown Change
    el.aiModelSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "custom") {
        el.aiCustomModelInput.style.display = "block";
        el.aiCustomModelInput.focus();
        state.aiModel = el.aiCustomModelInput.value.trim();
      } else {
        el.aiCustomModelInput.style.display = "none";
        state.aiModel = val;
      }
      saveAiConfig();
    });

    // Custom Model Input
    el.aiCustomModelInput.addEventListener("input", (e) => {
      state.aiModel = e.target.value.trim();
      saveAiConfig();
    });

    // Endpoint Input
    el.aiEndpointInput.addEventListener("input", (e) => {
      state.aiEndpoint = e.target.value;
      saveAiConfig();
    });

    // API Key Input
    el.aiApiKeyInput.addEventListener("input", (e) => {
      state.aiApiKey = e.target.value;
      saveAiConfig();
    });

    // Toggle Key Visibility
    el.btnToggleKeyVis.addEventListener("click", () => {
      const isPass = el.aiApiKeyInput.type === "password";
      el.aiApiKeyInput.type = isPass ? "text" : "password";
      el.btnToggleKeyVis.textContent = isPass ? "🔒" : "👁️";
    });

    // Run AI Test
    el.btnRunAiTest.addEventListener("click", handleRunAiTest);

    // Copy AI Response
    el.btnCopyAiResponse.addEventListener("click", () => {
      const text = el.aiResponseContent.textContent;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        showToast("Jawaban AI berhasil disalin!");
      });
    });
  }

  // Compile Master Prompt (Clean & Strictly Non-Repetitive)
  function compilePrompt() {
    const roleText = (state.role && state.role.trim()) ? state.role.trim() : "Senior Software Engineer";
    const taskText = (state.task && state.task.trim()) ? state.task.trim() : "(Tuliskan tugas atau requirement Anda pada kolom sebelah kiri...)";

    let prompt = `### ROLE\n${roleText}\n\n`;
    prompt += `### TASK\n${taskText}\n\n`;
    prompt += `### KETENTUAN IMPLEMENTASI\n`;
    prompt += `- Fokus terisolasi: Lakukan perubahan HANYA pada bagian/file/fungsi yang dispesifikasikan (hindari efek samping ke bagian lain).\n`;
    prompt += `- Error handling & validasi: Terapkan penanganan data dan error menyeluruh.\n`;
    prompt += `- Format jawaban: Langsung sajikan kode/solusi inti dengan penjelasan yang jelas dan praktis tanpa pengantar bertele-tele.\n`;

    return prompt;
  }

  // Calculate Prompt Precision Rate (0 - 100%)
  function calculatePromptScore(role, task) {
    let score = 25; // Base score
    
    // Evaluate Role
    const r = (role || "").trim();
    if (r.length > 20) score += 15;
    if (/(senior|principal|architect|engineer|specialist|expert|lead|master|polyglot)/i.test(r)) score += 10;
    
    // Evaluate Task
    const t = (task || "").trim();
    if (t.length > 30) score += 10;
    if (t.length > 100) score += 10;
    
    // Structure (bullet points or numbered list)
    if (/^[-*•\d.)]/m.test(t)) score += 15;
    
    // Specificity (mentions code entities, filenames, etl, function, sql, filter, etc.)
    if (/(\.razor|\.cs|\.py|\.js|\.ts|\.json|\.xlsx|\.sql|function|skema|etl|grid|filter|class|api|table)/i.test(t)) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  // Update Live Preview Output
  function updatePromptOutput() {
    const compiled = compilePrompt();
    el.promptDisplay.textContent = compiled;

    // Statistics
    const chars = compiled.length;
    const words = compiled.trim() ? compiled.trim().split(/\s+/).length : 0;
    const tokens = Math.ceil(chars / 3.8);

    el.statChars.textContent = `${chars} Karakter`;
    el.statWords.textContent = `${words} Kata`;
    el.statTokens.textContent = `~${tokens} Token`;

    // Prompt Precision Rate (%)
    const score = calculatePromptScore(state.role, state.task);
    if (el.statScore) {
      el.statScore.textContent = `🎯 Presisi: ${score}%`;
      el.statScore.className = "badge badge-score";
      if (score >= 85) {
        el.statScore.classList.add("score-high");
        el.statScore.title = "Tingkat Presisi Sangat Tinggi (Prompt Siap Eksekusi Optimal)";
      } else if (score >= 60) {
        el.statScore.classList.add("score-med");
        el.statScore.title = "Tingkat Presisi Sedang (Bagus, bisa dirapikan lagi jika perlu)";
      } else {
        el.statScore.classList.add("score-low");
        el.statScore.title = "Tingkat Presisi Rendah (Lengkapi task atau klik tombol ✨ Perbaiki)";
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

  // Intelligent Task Refinement (Auto-Refine)
  async function handleRefineTask() {
    const rawText = el.taskInput.value.trim();
    if (!rawText) {
      showToast("Tuliskan kalimat tugas terlebih dahulu sebelum diperbaiki.", "warning");
      return;
    }

    // Set Loading State
    el.btnRefineTask.disabled = true;
    el.refineSpinner.classList.remove("hidden");

    try {
      // 1. If API Key is configured, attempt high-precision LLM refinement via backend
      const apiKey = state.aiApiKey || localStorage.getItem("promptcraft_ai_key");
      let refined = null;

      if ((apiKey && apiKey.trim()) || (state.hasServerKey && state.aiProvider === "gemini")) {
        try {
          const res = await fetch("/api/refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task: rawText,
              role: state.role,
              provider: state.aiProvider,
              model: state.aiModel,
              apiKey: apiKey.trim(),
              customEndpoint: state.aiEndpoint
            })
          });
          const data = await res.json();
          if (res.ok && data.refined && data.refined.trim()) {
            refined = data.refined.trim();
          }
        } catch (apiErr) {
          console.warn("Server refine endpoint fallback to local heuristic:", apiErr);
        }
      }

      // 2. Local Heuristic Refiner (Rock-solid offline parser)
      if (!refined) {
        refined = cleanAndStructureTaskLocally(rawText);
      }

      // Apply Refined Text
      state.task = refined;
      el.taskInput.value = refined;
      updatePromptOutput();
      showToast("✨ Kalimat tugas berhasil diperbaiki & dirapikan!", "success");

    } catch (err) {
      showToast("Gagal merapikan teks: " + err.message, "error");
    } finally {
      el.btnRefineTask.disabled = false;
      el.refineSpinner.classList.add("hidden");
    }
  }

  // Local Intelligent Heuristic Parser & Restructurer
  function cleanAndStructureTaskLocally(text) {
    // 1. Remove duplicate notes or leftover boilerplate
    let clean = text
      .replace(/Catatan Penting & Ketentuan:[\s\S]*$/i, "")
      .replace(/### FORMAT[\s\S]*$/i, "")
      .replace(/### NEGATIVE CONSTRAINTS[\s\S]*$/i, "")
      .trim();

    // 2. Break down text into raw items
    const rawLines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const structuredItems = [];

    // Analyze line by line
    rawLines.forEach(line => {
      // Strip leading dashes or asterisks
      let content = line.replace(/^[-*•\d.)\t ]+/, "").trim();
      if (!content) return;

      // Detect sub-actions if line contains run-on sentences with "kemudian", "lalu", "untuk mengganti"
      if (content.toLowerCase().includes("loadpdnkelompokpage") || content.toLowerCase().includes("loadpdnindividualpage")) {
        // Break compound function description into clear sub-points
        const funcMatch = content.match(/^(Update pada function \w+)/i) || [null, content];
        const funcTitle = funcMatch[1] || content.split(/,|:/)[0];
        
        const subPoints = [];
        // Extract ETL replacement
        const etlMatch = content.match(/mengganti nama skema etl dari ["']?([^"']+)["']? menjadi ["']?([^"']+)["']?/i);
        if (etlMatch) {
          subPoints.push(`Ganti skema ETL dari "${etlMatch[1]}" menjadi "${etlMatch[2]}"`);
        }

        // Extract Grid method
        const gridMatch = content.match(/DynamicDataGrid (?:ubah menjadi|menjadi) (\w+)/i);
        if (gridMatch) {
          subPoints.push(`Ubah tipe DynamicDataGrid menjadi pemanggilan ${gridMatch[1]}`);
        }

        // Extract Filter
        const filterMatch = content.match(/filter untuk di lempar.*?dari ([^.]+?)(?:\.|$)/i);
        if (filterMatch) {
          subPoints.push(`Kirim parameter filter ke skema ETL dari ${filterMatch[1].trim()}`);
        }

        // Extract Excel reference (handles paths with spaces)
        const excelMatch = content.match(/(?:excel disini |tampilan.*?grid.*?seperti pada excel\s+)(?:disini\s+)?([A-Za-z]:\\[^,]+?\.xlsx|[^,]+?\.xlsx)/i);
        const gridPosMatch = content.match(/grid yang (diatas|dibawah)/i);
        if (excelMatch) {
          const pos = gridPosMatch ? `bagian ${gridPosMatch[1]}` : "sesuai rujukan";
          subPoints.push(`Tampilan grid disamakan dengan tabel excel ${pos} pada:\n     ${excelMatch[1].trim()}`);
        }

        // Extract column logic mapping (e.g. PUAB.razor)
        const refLogicMatch = content.match(/khusus untuk kolom ["']?([^"']+)["']?.*?samakan logic.*?dari ([a-zA-Z0-9_.-]+\.razor|[a-zA-Z0-9_.-]+)/i);
        if (refLogicMatch) {
          subPoints.push(`Khusus kolom "${refLogicMatch[1]}": adopsi logika ekstraksi datanya dari ${refLogicMatch[2].trim()} (kolom lain tetap dari ETL)`);
        }

        if (subPoints.length > 0) {
          let block = `- ${funcTitle}:\n` + subPoints.map(sp => `  * ${sp}`).join("\n");
          structuredItems.push(block);
          return;
        }
      }

      // Generic bullet point cleanup
      structuredItems.push(`- ${content}`);
    });

    // Check if user has main introductory line
    let header = "Lakukan update dengan requirement sebagai berikut:";
    if (structuredItems.length > 0 && structuredItems[0].toLowerCase().includes("lakukan update pada")) {
      header = structuredItems.shift().replace(/^- /, "");
    }

    let result = header + "\n" + structuredItems.join("\n");

    // Clean up typos or odd repetitions
    result = result
      .replace(/di lempar/gi, "dilempar")
      .replace(/\n{3,}/g, "\n\n");

    return result;
  }

  // Toggle AI Test Console
  function toggleAiConsole(forceOpen = false) {
    if (forceOpen) {
      el.aiTestConsole.classList.remove("collapsed");
      el.btnCollapseAi.textContent = "▲";
      el.aiTestConsole.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      const isCollapsed = el.aiTestConsole.classList.toggle("collapsed");
      el.btnCollapseAi.textContent = isCollapsed ? "▼" : "▲";
    }
  }

  // Render Model Dropdown Options dynamically
  function renderModelOptions(provider, selectedModel) {
    const models = PROVIDER_MODELS[provider] || PROVIDER_MODELS.gemini;
    el.aiModelSelect.innerHTML = models.map(m => {
      const isSelected = selectedModel ? m.value === selectedModel : m.default;
      return `<option value="${m.value}" ${isSelected ? 'selected' : ''}>${m.label}</option>`;
    }).join("");

    const isCustom = el.aiModelSelect.value === "custom" || (!models.some(m => m.value === selectedModel) && selectedModel);
    if (isCustom) {
      el.aiModelSelect.value = "custom";
      el.aiCustomModelInput.style.display = "block";
      el.aiCustomModelInput.value = selectedModel || "";
      state.aiModel = selectedModel || "";
    } else {
      el.aiCustomModelInput.style.display = "none";
      state.aiModel = el.aiModelSelect.value;
    }
  }

  // Run Prompt Directly in AI
  async function handleRunAiTest() {
    const promptText = compilePrompt();
    const apiKey = el.aiApiKeyInput.value.trim();

    if (!apiKey && (!state.hasServerKey || state.aiProvider !== "gemini")) {
      showToast("Silakan masukkan API Key / Session Token terlebih dahulu.", "warning");
      el.aiApiKeyInput.focus();
      return;
    }

    const effectiveModel = (el.aiModelSelect.value === "custom")
      ? (el.aiCustomModelInput.value.trim() || state.aiModel)
      : el.aiModelSelect.value;

    // Set UI Loading
    el.btnRunAiTest.disabled = true;
    el.aiRunSpinner.classList.remove("hidden");
    el.runAiText.textContent = "Menghubungi AI...";
    el.aiResponseContainer.classList.remove("hidden");
    el.aiResponseContent.textContent = `Sedang mengeksekusi ke model ${effectiveModel}... Menunggu respon...`;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: state.aiProvider,
          model: effectiveModel,
          apiKey: apiKey,
          prompt: promptText,
          customEndpoint: el.aiEndpointInput.value.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      el.aiResponseContent.textContent = data.text || "(Respon kosong)";
      showToast("Respon AI berhasil diterima!", "success");

    } catch (err) {
      el.aiResponseContent.textContent = `⚠️ Terjadi Kesalahan:\n${err.message}`;
      showToast("Gagal mengeksekusi AI: " + err.message, "error");
    } finally {
      el.btnRunAiTest.disabled = false;
      el.aiRunSpinner.classList.add("hidden");
      el.runAiText.textContent = "Eksekusi Prompt ke AI";
    }
  }

  // LocalStorage Persistence for AI Config
  function saveAiConfig() {
    const config = {
      provider: state.aiProvider,
      model: state.aiModel,
      endpoint: el.aiEndpointInput.value.trim(),
      apiKey: el.aiApiKeyInput.value.trim()
    };
    try {
      localStorage.setItem("promptcraft_ai_config", JSON.stringify(config));
    } catch (e) {
      console.warn("Cannot save AI config to localStorage:", e);
    }
  }

  function loadSavedAiConfig() {
    try {
      const raw = localStorage.getItem("promptcraft_ai_config");
      if (raw) {
        const config = JSON.parse(raw);
        if (config.provider) {
          state.aiProvider = config.provider;
          el.aiProviderSelect.value = config.provider;
        }
        if (config.model) {
          if (config.model === "gemini-2.5-flash" || config.model === "gemini-3-flash" || config.model === "gemini-3") {
            state.aiModel = "gemini-3.6-flash";
          } else {
            state.aiModel = config.model;
          }
        }
        if (config.endpoint) {
          state.aiEndpoint = config.endpoint;
          el.aiEndpointInput.value = config.endpoint;
        }
        if (config.apiKey) {
          state.aiApiKey = config.apiKey;
          el.aiApiKeyInput.value = config.apiKey;
        }
        if (state.aiProvider === "adacode") {
          el.customEndpointGroup.style.display = "block";
        }
      }
    } catch (e) {
      console.warn("Cannot load AI config:", e);
    }

    // Populate model dropdown
    renderModelOptions(state.aiProvider, state.aiModel);
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
