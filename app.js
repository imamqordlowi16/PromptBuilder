// app.js - Core Application Logic for PromptCraft Studio
(function () {
  "use strict";

  // Application State
  const state = {
    selectedDomainId: "tech_software",
    selectedPersonaId: "senior_architect",
    selectedFrameworkId: "costar",
    formData: {},
    constraints: [
      "Berikan penjelasan berbasis data dan alasan teknis yang kuat.",
      "Hindari klaim spekulatif tanpa rujukan metodologis.",
      "Gunakan format Markdown terstruktur dengan bullet points rapi."
    ],
    variables: {},
    fewShots: [],
    customPersona: {
      role: "",
      principles: "",
      tone: ""
    },
    savedPrompts: [],
    activeTab: "preview", // 'preview' or 'playground'
    aiProvider: localStorage.getItem("promptcraft_ai_provider") || "gemini",
    aiModel: localStorage.getItem("promptcraft_ai_model") || "gemini-2.5-flash",
    apiKeys: {
      gemini: localStorage.getItem("promptcraft_key_gemini") || localStorage.getItem("promptcraft_gemini_api_key") || "",
      claude: localStorage.getItem("promptcraft_key_claude") || "",
      adacode: localStorage.getItem("promptcraft_key_adacode") || ""
    },
    customEndpoint: localStorage.getItem("promptcraft_endpoint_adacode") || "https://api.openai.com/v1"
  };

  // DOM Elements Cache
  const el = {};

  function initElements() {
    el.domainSelect = document.getElementById("domainSelect");
    el.personaContainer = document.getElementById("personaContainer");
    el.frameworkContainer = document.getElementById("frameworkContainer");
    el.activeBanner = document.getElementById("activeBanner");
    el.formFieldsContainer = document.getElementById("formFieldsContainer");
    el.constraintsList = document.getElementById("constraintsList");
    el.newConstraintInput = document.getElementById("newConstraintInput");
    el.btnAddConstraint = document.getElementById("btnAddConstraint");
    el.variablesContainer = document.getElementById("variablesContainer");
    el.variablesSection = document.getElementById("variablesSection");
    el.fewShotContainer = document.getElementById("fewShotContainer");
    el.btnAddFewShot = document.getElementById("btnAddFewShot");
    el.promptDisplay = document.getElementById("promptDisplay");
    el.charCount = document.getElementById("charCount");
    el.wordCount = document.getElementById("wordCount");
    el.tokenCount = document.getElementById("tokenCount");
    el.scoreCircle = document.getElementById("scoreCircle");
    el.scoreVal = document.getElementById("scoreVal");
    el.scoreStatus = document.getElementById("scoreStatus");
    el.scoreTips = document.getElementById("scoreTips");
    el.btnCopy = document.getElementById("btnCopy");
    el.btnDownload = document.getElementById("btnDownload");
    el.btnMagicEnhance = document.getElementById("btnMagicEnhance");
    el.btnSavePrompt = document.getElementById("btnSavePrompt");
    el.templateListContainer = document.getElementById("templateListContainer");
    el.templateSearch = document.getElementById("templateSearch");
    el.tabPreviewBtn = document.getElementById("tabPreviewBtn");
    el.tabPlaygroundBtn = document.getElementById("tabPlaygroundBtn");
    el.previewView = document.getElementById("previewView");
    el.playgroundView = document.getElementById("playgroundView");
    el.aiProviderSelect = document.getElementById("aiProviderSelect");
    el.aiModelSelect = document.getElementById("aiModelSelect");
    el.customEndpointRow = document.getElementById("customEndpointRow");
    el.customEndpointInput = document.getElementById("customEndpointInput");
    el.apiKeyLabel = document.getElementById("apiKeyLabel");
    el.apiKeyInput = document.getElementById("apiKeyInput");
    el.btnSaveApiKey = document.getElementById("btnSaveApiKey");
    el.btnRunSimulation = document.getElementById("btnRunSimulation");
    el.btnRunLiveApi = document.getElementById("btnRunLiveApi");
    el.simulationOutput = document.getElementById("simulationOutput");
    el.toastContainer = document.getElementById("toastContainer");
    el.modalBackdrop = document.getElementById("modalBackdrop");
    el.modalTitle = document.getElementById("modalTitle");
    el.modalBody = document.getElementById("modalBody");
    el.btnModalClose = document.getElementById("btnModalClose");
  }

  // Toast System
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ️";
    toast.innerHTML = `<span style="font-size:16px; font-weight:bold;">${icon}</span> <span>${message}</span>`;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = "opacity 0.4s, transform 0.4s";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // Getters
  function getCurrentDomain() {
    return EXPERT_DOMAINS.find(d => d.id === state.selectedDomainId) || EXPERT_DOMAINS[0];
  }

  function getCurrentPersona() {
    if (state.selectedDomainId === "custom_domain") {
      return {
        id: "user_custom_persona",
        name: "Custom Expert Persona",
        role: state.customPersona.role || "Pakar multidisiplin profesional.",
        principles: state.customPersona.principles ? state.customPersona.principles.split("\n").filter(Boolean) : ["Berorientasi pada hasil presisi"],
        tone: state.customPersona.tone || "Profesional & Terstruktur"
      };
    }
    const domain = getCurrentDomain();
    return domain.personas.find(p => p.id === state.selectedPersonaId) || domain.personas[0];
  }

  function getCurrentFramework() {
    return PROMPT_FRAMEWORKS.find(f => f.id === state.selectedFrameworkId) || PROMPT_FRAMEWORKS[0];
  }

  // Render Domain Dropdown
  function renderDomainDropdown() {
    el.domainSelect.innerHTML = EXPERT_DOMAINS.map(domain => {
      return `<option value="${domain.id}" ${domain.id === state.selectedDomainId ? "selected" : ""}>
        ${domain.icon} ${domain.name}
      </option>`;
    }).join("");
  }

  // Render Persona Cards
  function renderPersonaCards() {
    const domain = getCurrentDomain();

    if (domain.id === "custom_domain") {
      el.personaContainer.innerHTML = `
        <div style="background: rgba(14,19,31,0.6); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px;">
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Definisi Role / Peran:</label>
          <textarea id="customRoleInput" class="form-textarea" style="min-height: 60px;" placeholder="Contoh: Senior Bioinformatician ahli dalam sekuens DNA & Protein...">${state.customPersona.role}</textarea>
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Prinsip Berpikir (1 per baris):</label>
          <textarea id="customPrinciplesInput" class="form-textarea" style="min-height: 50px;" placeholder="Contoh: Selalu verifikasi data empiris...">${state.customPersona.principles}</textarea>
          <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">Gaya / Nada Bicara:</label>
          <input type="text" id="customToneInput" class="form-input" value="${state.customPersona.tone}" placeholder="Contoh: Analitis, lugas, santun" />
        </div>
      `;

      const roleInput = document.getElementById("customRoleInput");
      const principlesInput = document.getElementById("customPrinciplesInput");
      const toneInput = document.getElementById("customToneInput");

      roleInput.addEventListener("input", (e) => {
        state.customPersona.role = e.target.value;
        updateActiveBanner();
        updatePromptOutput();
      });
      principlesInput.addEventListener("input", (e) => {
        state.customPersona.principles = e.target.value;
        updateActiveBanner();
        updatePromptOutput();
      });
      toneInput.addEventListener("input", (e) => {
        state.customPersona.tone = e.target.value;
        updateActiveBanner();
        updatePromptOutput();
      });
      return;
    }

    el.personaContainer.innerHTML = domain.personas.map(persona => {
      const isActive = persona.id === state.selectedPersonaId;
      return `
        <div class="persona-card ${isActive ? 'active' : ''}" data-persona-id="${persona.id}">
          <div class="persona-card-header">
            <span class="persona-name">${persona.name}</span>
            ${isActive ? '<span class="pulse-indicator"></span>' : ''}
          </div>
          <p class="persona-role-brief">${persona.role}</p>
        </div>
      `;
    }).join("");

    el.personaContainer.querySelectorAll(".persona-card").forEach(card => {
      card.addEventListener("click", () => {
        state.selectedPersonaId = card.getAttribute("data-persona-id");
        renderPersonaCards();
        updateActiveBanner();
        updatePromptOutput();
      });
    });
  }

  // Render Framework Cards
  function renderFrameworkCards() {
    el.frameworkContainer.innerHTML = PROMPT_FRAMEWORKS.map(fw => {
      const isActive = fw.id === state.selectedFrameworkId;
      return `
        <div class="framework-card ${isActive ? 'active' : ''}" data-framework-id="${fw.id}">
          <div class="framework-name-row">
            <span class="framework-name">${fw.name}</span>
            <span class="brand-badge" style="font-size: 9px;">${fw.badge}</span>
          </div>
          <p class="framework-tagline">${fw.tagline}</p>
        </div>
      `;
    }).join("");

    el.frameworkContainer.querySelectorAll(".framework-card").forEach(card => {
      card.addEventListener("click", () => {
        state.selectedFrameworkId = card.getAttribute("data-framework-id");
        renderFrameworkCards();
        renderFormFields();
        updatePromptOutput();
      });
    });
  }

  // Update Top Active Banner
  function updateActiveBanner() {
    const domain = getCurrentDomain();
    const persona = getCurrentPersona();
    const fw = getCurrentFramework();

    el.activeBanner.innerHTML = `
      <div class="banner-avatar">${domain.icon}</div>
      <div class="banner-info" style="flex:1;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <h3>${persona.name}</h3>
          <span class="brand-badge">${domain.name}</span>
          <span class="brand-badge" style="border-color: rgba(6, 182, 212, 0.4); color: #38bdf8;">${fw.name}</span>
        </div>
        <p>${persona.role}</p>
        <div style="margin-top:6px; font-size:11px; color:var(--text-muted); display:flex; gap:14px;">
          <span>🎯 Nada Bicara: <strong style="color:#cbd5e1;">${persona.tone}</strong></span>
          ${persona.principles && persona.principles.length ? `<span>⚡ Prinsip: <strong style="color:#cbd5e1;">${persona.principles.length} Aturan Inti</strong></span>` : ''}
        </div>
      </div>
    `;
  }

  // Render Form Fields according to active framework
  function renderFormFields() {
    const fw = getCurrentFramework();

    el.formFieldsContainer.innerHTML = fw.fields.map(field => {
      const value = state.formData[field.key] || "";
      const isTextarea = field.type === "textarea";

      return `
        <div class="form-group">
          <div class="form-label-row">
            <label class="form-label" for="field_${field.key}">
              <span>${field.label}</span>
              ${field.required ? '<span class="badge-required">Wajib</span>' : ''}
            </label>
            ${isTextarea ? `
              <button type="button" class="btn-refine-field" data-refine-key="${field.key}" title="Analisis dan perbaiki instruksi tugas ini secara otomatis">
                <span>✨ Auto-Perbaiki & Sempurnakan</span>
              </button>
            ` : ''}
          </div>
          ${isTextarea ? `
            <textarea 
              id="field_${field.key}" 
              class="form-textarea" 
              data-field-key="${field.key}" 
              placeholder="${field.placeholder}">${value}</textarea>
          ` : `
            <input 
              type="text" 
              id="field_${field.key}" 
              class="form-input" 
              data-field-key="${field.key}" 
              placeholder="${field.placeholder}" 
              value="${value}" />
          `}
        </div>
      `;
    }).join("");

    // Bind refine buttons
    el.formFieldsContainer.querySelectorAll(".btn-refine-field").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-refine-key");
        refineField(key);
      });
    });

    // Bind input events
    el.formFieldsContainer.querySelectorAll("input, textarea").forEach(input => {
      input.addEventListener("input", (e) => {
        const key = e.target.getAttribute("data-field-key");
        state.formData[key] = e.target.value;
        detectVariables();
        updatePromptOutput();
      });
    });
  }

  // Auto-refine and fix a specific field's draft instructions
  async function refineField(key) {
    const currentVal = (state.formData[key] || "").trim();
    if (!currentVal) {
      showToast("Tulis draf instruksi tugas terlebih dahulu sebelum diperbaiki!", "error");
      return;
    }

    const btn = document.querySelector(`[data-refine-key="${key}"]`);
    if (btn) {
      btn.innerHTML = `<span class="pulse-indicator"></span> Memperbaiki...`;
      btn.disabled = true;
    }

    const persona = getCurrentPersona();
    const promptInstructions = `Kamu adalah Senior Prompt Engineer & Code Architect.
Berikut adalah draf instruksi dari pengguna:
"${currentVal}"

TUGAS KAMU:
Analisis dan perbaiki draf instruksi di atas agar:
1. Menghilangkan ambiguitas atau kalimat rancu.
2. Memecah tugas menjadi langkah-langkah terstruktur dan bernomor jika mencakup banyak instruksi.
3. Menambahkan kondisi batas (boundary conditions) atau batasan logis yang diperlukan agar model AI tidak merusak bagian lain.
4. TETAP MEMPERTAHANKAN 100% inti maksud dan nama variabel/file asli pengguna.

Tuliskan HANYA teks instruksi hasil perbaikan secara langsung tanpa salam pembuka, tanpa basa-basi, dan tanpa tanda kutip pembuka/penutup.`;

    try {
      const provider = state.aiProvider;
      const currentKey = state.apiKeys[provider] || el.apiKeyInput.value.trim();

      // If user has AI key configured, use live AI model for highest quality polishing!
      if (currentKey) {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: provider,
            model: el.aiModelSelect.value || state.aiModel,
            apiKey: currentKey,
            customEndpoint: el.customEndpointInput ? el.customEndpointInput.value.trim() : "",
            prompt: promptInstructions
          })
        });

        const data = await response.json();
        if (response.ok && data.text) {
          const polished = data.text.trim();
          state.formData[key] = polished;
          const targetInput = document.getElementById(`field_${key}`);
          if (targetInput) targetInput.value = polished;
          detectVariables();
          updatePromptOutput();
          showToast(`✨ Tugas berhasil diperbaiki oleh ${provider.toUpperCase()}!`);
          return;
        }
      }

      // Offline / Local intelligent heuristic refiner fallback
      let polished = currentVal;
      // Split sentences if long paragraph
      if (polished.includes(".") && !polished.includes("1.") && !polished.includes("- ")) {
        const parts = polished.split(/(?<=[.!?])\s+/).filter(p => p.trim().length > 8);
        if (parts.length > 1) {
          polished = `Lakukan eksekusi tugas dengan requirement terstruktur berikut:\n` +
            parts.map((p, idx) => `${idx + 1}. ${p.trim()}`).join("\n") +
            `\n\nCatatan Penting:\n- Pastikan implementasi terisolasi dan tidak merusak fungsi atau bagian lain.\n- Lakukan validasi data masukan dan terapkan error handling yang aman.`;
        }
      } else if (!polished.toLowerCase().includes("catatan penting") && !polished.toLowerCase().includes("batasan")) {
        polished = `${polished}\n\nCatatan Penting & Ketentuan:\n- Pastikan seluruh perubahan terisolasi dan tidak menyebabkan efek samping (side-effects).\n- Wajib menerapkan validasi dan error handling menyeluruh.`;
      }

      state.formData[key] = polished;
      const targetInput = document.getElementById(`field_${key}`);
      if (targetInput) targetInput.value = polished;
      detectVariables();
      updatePromptOutput();
      showToast("✨ Format dan struktur tugas berhasil disempurnakan!");

    } catch (err) {
      showToast("Gagal memperbaiki via AI, menggunakan perbaikan lokal", "error");
    } finally {
      if (btn) {
        btn.innerHTML = `<span>✨ Auto-Perbaiki & Sempurnakan</span>`;
        btn.disabled = false;
      }
    }
  }

  // Detect {{variable}} placeholders in inputs
  function detectVariables() {
    const textAll = Object.values(state.formData).join(" ") + " " + state.constraints.join(" ");
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const foundVars = new Set();
    let match;

    while ((match = regex.exec(textAll)) !== null) {
      foundVars.add(match[1]);
    }

    // Preserve existing values, remove obsolete
    const currentVarKeys = Object.keys(state.variables);
    foundVars.forEach(v => {
      if (!state.variables[v]) {
        state.variables[v] = "";
      }
    });

    currentVarKeys.forEach(k => {
      if (!foundVars.has(k)) {
        delete state.variables[k];
      }
    });

    renderVariablesSection();
  }

  function renderVariablesSection() {
    const varNames = Object.keys(state.variables);
    if (varNames.length === 0) {
      el.variablesSection.style.display = "none";
      return;
    }

    el.variablesSection.style.display = "block";
    el.variablesContainer.innerHTML = varNames.map(v => {
      return `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <span class="var-tag">{{${v}}}</span>
          <input type="text" class="form-input" style="flex:1; padding:6px 10px; font-size:12px;" 
            data-var-name="${v}" 
            placeholder="Nilai untuk {{${v}}}..." 
            value="${state.variables[v] || ''}" />
        </div>
      `;
    }).join("");

    el.variablesContainer.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", (e) => {
        const name = e.target.getAttribute("data-var-name");
        state.variables[name] = e.target.value;
        updatePromptOutput();
      });
    });
  }

  // Constraints Management
  function renderConstraints() {
    el.constraintsList.innerHTML = state.constraints.map((c, index) => {
      return `
        <div class="constraint-item">
          <span>🛑 ${c}</span>
          <button class="remove-btn" data-index="${index}" title="Hapus batasan">&times;</button>
        </div>
      `;
    }).join("");

    el.constraintsList.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        state.constraints.splice(idx, 1);
        renderConstraints();
        updatePromptOutput();
      });
    });
  }

  function addConstraint() {
    const val = el.newConstraintInput.value.trim();
    if (!val) return;
    state.constraints.push(val);
    el.newConstraintInput.value = "";
    renderConstraints();
    updatePromptOutput();
    showToast("Batasan negatif ditambahkan!");
  }

  // Few-Shot Pairs
  function renderFewShots() {
    el.fewShotContainer.innerHTML = state.fewShots.map((fs, idx) => {
      return `
        <div class="few-shot-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:#38bdf8;">Contoh #${idx + 1}</span>
            <button class="remove-btn" style="background:none; border:none; color:var(--accent-rose); cursor:pointer;" data-fewshot-idx="${idx}">&times; Hapus</button>
          </div>
          <input type="text" class="form-input" style="font-size:12px; padding:6px 10px;" placeholder="Input / Pertanyaan contoh..." data-fs-input="${idx}" value="${fs.input || ''}" />
          <textarea class="form-textarea" style="font-size:12px; min-height:45px; padding:6px 10px;" placeholder="Output / Jawaban ideal contoh..." data-fs-output="${idx}">${fs.output || ''}</textarea>
        </div>
      `;
    }).join("");

    el.fewShotContainer.querySelectorAll("[data-fewshot-idx]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-fewshot-idx"), 10);
        state.fewShots.splice(idx, 1);
        renderFewShots();
        updatePromptOutput();
      });
    });

    el.fewShotContainer.querySelectorAll("[data-fs-input]").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.getAttribute("data-fs-input"), 10);
        state.fewShots[idx].input = e.target.value;
        updatePromptOutput();
      });
    });

    el.fewShotContainer.querySelectorAll("[data-fs-output]").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.getAttribute("data-fs-output"), 10);
        state.fewShots[idx].output = e.target.value;
        updatePromptOutput();
      });
    });
  }

  // Compile Master Prompt String
  function compilePrompt() {
    const persona = getCurrentPersona();
    const fw = getCurrentFramework();

    // Compile framework core
    let compiled = fw.compile(state.formData, persona);

    // Append Few-Shot Examples if any
    if (state.fewShots.length > 0) {
      compiled += `\n### FEW-SHOT EXAMPLES (REFERENSI CONTOH)\n`;
      state.fewShots.forEach((fs, i) => {
        if (fs.input || fs.output) {
          compiled += `\n<example index="${i + 1}">\nInput: ${fs.input || '-'}\nOutput:\n${fs.output || '-'}\n</example>\n`;
        }
      });
    }

    // Append Guardrails & Constraints
    if (state.constraints.length > 0) {
      compiled += `\n### NEGATIVE CONSTRAINTS & GUARDRAILS (WAJIB DIPATUHI)\n`;
      state.constraints.forEach(c => {
        compiled += `- JANGAN / HINDARI: ${c}\n`;
      });
    }

    // Variable Replacement
    Object.keys(state.variables).forEach(varKey => {
      const val = state.variables[varKey];
      if (val && val.trim()) {
        const re = new RegExp(`\\{\\{${varKey}\\}\\}`, "g");
        compiled = compiled.replace(re, val.trim());
      }
    });

    return compiled;
  }

  // Update Output & Prompt Grader
  function updatePromptOutput() {
    const promptText = compilePrompt();
    el.promptDisplay.textContent = promptText;

    // Statistics
    const charLen = promptText.length;
    const words = promptText.trim() ? promptText.trim().split(/\s+/).length : 0;
    const estTokens = Math.ceil(charLen / 3.8);

    el.charCount.textContent = `${charLen} Karakter`;
    el.wordCount.textContent = `${words} Kata`;
    el.tokenCount.textContent = `~${estTokens} Tokens`;

    // Calculate Quality Score
    calculatePromptScore(promptText);
  }

  // Heuristic Prompt Grader
  function calculatePromptScore(promptText) {
    let score = 20; // Base presence
    const tips = [];

    const persona = getCurrentPersona();
    if (persona && persona.role && persona.role.length > 20) {
      score += 15;
    } else {
      tips.push("Pilih persona ahli yang lebih spesifik.");
    }

    // Check Objective / Task presence
    const fw = getCurrentFramework();
    let hasMainTask = false;
    fw.fields.forEach(f => {
      if (f.required && state.formData[f.key] && state.formData[f.key].length > 15) {
        hasMainTask = true;
      }
    });

    if (hasMainTask) {
      score += 25;
    } else {
      tips.push("Perjelas tujuan / instruksi utama proyek.");
    }

    // Check Context depth
    const contextField = state.formData.context || state.formData.problem || state.formData.scenario || "";
    if (contextField.length > 50) {
      score += 15;
    } else {
      tips.push("Tambahkan detail konteks / latar belakang masalah.");
    }

    // Check Constraints
    if (state.constraints.length >= 2) {
      score += 15;
    } else {
      tips.push("Tambahkan batasan negatif (guardrails) untuk mencegah halusinasi.");
    }

    // Check Few-shots or specific response format
    if (state.fewShots.length > 0 || (state.formData.response && state.formData.response.length > 10)) {
      score += 10;
    } else {
      tips.push("Tentukan format hasil spesifik (Tabel, JSON, Step-by-step).");
    }

    // Cap score at 100
    score = Math.min(100, score);

    // Update UI
    el.scoreCircle.style.setProperty("--score-val", score);
    el.scoreVal.textContent = `${score}%`;

    let color = "#ef4444";
    let label = "Perlu Penyempurnaan";

    if (score >= 85) {
      color = "#10b981";
      label = "Prompt Standar Elite";
    } else if (score >= 65) {
      color = "#06b6d4";
      label = "Cukup Bagus & Terarah";
    } else if (score >= 45) {
      color = "#f59e0b";
      label = "Standar Menengah";
    }

    el.scoreCircle.style.setProperty("--score-color", color);
    el.scoreStatus.textContent = label;
    el.scoreStatus.style.color = color;

    if (tips.length > 0) {
      el.scoreTips.innerHTML = `💡 Saran Optimasi: ${tips[0]}`;
    } else {
      el.scoreTips.innerHTML = `✨ Prompt sudah sangat optimal dan terstruktur sempurna!`;
    }
  }

  // Magic Prompt Enhancer (Auto-engineer prompt)
  function magicEnhance() {
    const persona = getCurrentPersona();
    const fw = getCurrentFramework();

    // Enrich existing form fields
    fw.fields.forEach(field => {
      let currentVal = state.formData[field.key] || "";
      if (!currentVal.trim()) {
        if (field.key === "context") {
          currentVal = `Situasi operasional sedang mengalami transisi penting yang membutuhkan analisis mendalam dan solusi terukur dari sudut pandang ${persona.name}.`;
        } else if (field.key === "objective" || field.key === "task" || field.key === "request") {
          currentVal = `Susun strategi dan rencana eksekusi komprehensif, mengidentifikasi akar permasalahan, risiko potensial, dan solusi praktis siap pakai.`;
        } else if (field.key === "style") {
          currentVal = `Profesional tingkat lanjut dengan pendekatan terstruktur dan analogi tajam.`;
        } else if (field.key === "tone") {
          currentVal = persona.tone;
        } else if (field.key === "audience") {
          currentVal = `Pemangku kepentingan utama, pimpinan proyek, dan tim pelaksana teknis.`;
        } else if (field.key === "response" || field.key === "format" || field.key === "type") {
          currentVal = `Dokumen Markdown terstruktur lengkap dengan Executive Summary, Langkah Analisis Berjenjang, Tabel Rekomendasi, dan Action Items terukur.`;
        }
        state.formData[field.key] = currentVal;
      } else {
        // Elevate with rigorous tone if too brief
        if (currentVal.length < 40 && (field.key === "objective" || field.key === "task")) {
          state.formData[field.key] = `${currentVal}. Pastikan setiap rekomendasi dilengkapi justifikasi berbasis data, mitigasi risiko kegagalan, dan tolok ukur keberhasilan (KPI).`;
        }
      }
    });

    // Ensure robust constraints
    const defaultEliteConstraints = [
      "Wajib menyertakan analisis trade-off untuk setiap rekomendasi alternatif.",
      "Tunjukkan asumsi yang digunakan secara eksplisit sebelum menyimpulkan.",
      "Hindari jawaban umum/klise yang tidak dapat langsung dieksekusi."
    ];

    defaultEliteConstraints.forEach(c => {
      if (!state.constraints.includes(c)) {
        state.constraints.push(c);
      }
    });

    renderFormFields();
    renderConstraints();
    updatePromptOutput();
    showToast("✨ Prompt berhasil ditingkatkan secara otomatis ke standar industri!", "success");
  }

  // Load a Preset Template
  function loadTemplate(templateId) {
    const tpl = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;

    state.selectedDomainId = tpl.category;
    state.selectedPersonaId = tpl.expertId;
    state.selectedFrameworkId = tpl.frameworkId;
    state.formData = { ...tpl.data };
    state.constraints = tpl.constraints ? [...tpl.constraints] : [];
    state.fewShots = tpl.fewShots ? JSON.parse(JSON.stringify(tpl.fewShots)) : [];

    // Initialize template variables
    state.variables = {};
    if (tpl.variables && Array.isArray(tpl.variables)) {
      tpl.variables.forEach(v => {
        state.variables[v.name] = v.default;
      });
    }

    renderDomainDropdown();
    renderPersonaCards();
    renderFrameworkCards();
    updateActiveBanner();
    renderFormFields();
    renderConstraints();
    renderFewShots();
    detectVariables();
    updatePromptOutput();

    showToast(`Template "${tpl.title}" berhasil dimuat!`);
  }

  // Render Template Library List
  function renderTemplateLibrary(query = "") {
    const q = query.toLowerCase().trim();
    const filtered = PROMPT_TEMPLATES.filter(tpl => {
      return tpl.title.toLowerCase().includes(q) || 
             tpl.category.toLowerCase().includes(q) || 
             (tpl.badge && tpl.badge.toLowerCase().includes(q));
    });

    el.templateListContainer.innerHTML = filtered.map(tpl => {
      return `
        <div class="template-item" data-template-id="${tpl.id}">
          <div class="template-title">${tpl.title}</div>
          <div class="template-meta">
            <span class="brand-badge" style="font-size:8px;">${tpl.badge || 'Preset'}</span>
            <span>• Framework: ${tpl.frameworkId.toUpperCase()}</span>
          </div>
        </div>
      `;
    }).join("");

    el.templateListContainer.querySelectorAll(".template-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-template-id");
        loadTemplate(id);
      });
    });
  }

  // Local AI Simulation Engine
  function runSimulation() {
    const persona = getCurrentPersona();
    const promptText = compilePrompt();

    el.simulationOutput.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; color:var(--accent-cyan); font-weight:600; margin-bottom:12px;">
        <span class="pulse-indicator"></span> Mensimulasikan penalaran ${persona.name}...
      </div>
      <div style="font-family:var(--font-mono); font-size:12px; color:var(--text-muted); margin-bottom:12px;">
        [Memproses kerangka berpikir: ${persona.tone}]
      </div>
    `;

    setTimeout(() => {
      el.simulationOutput.innerHTML = `
        <div style="padding-bottom:12px; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="color:#f8fafc; font-size:14px;">HASIL ANALISIS EKSEKUTIF</h3>
            <span style="font-size:11px; color:var(--accent-emerald);">Dijawab sebagai: ${persona.role}</span>
          </div>
          <span class="brand-badge">Simulated Mode</span>
        </div>

        <h4 style="color:#38bdf8; margin:10px 0 6px;">1. Ringkasan Eksekutif & Temuan Inti</h4>
        <p style="margin-bottom:12px;">Berdasarkan instruksi yang diberikan, evaluasi dilakukan dengan menerapkan metodologi <em>${persona.principles ? persona.principles[0] : 'First-principles analysis'}</em>. Seluruh aspek yang disyaratkan telah dikelompokkan ke dalam kerangka kerja yang siap diimplementasikan.</p>

        <h4 style="color:#38bdf8; margin:10px 0 6px;">2. Matriks Keputusan & Rekomendasi Bertingkat</h4>
        <div style="background:rgba(14,19,31,0.8); padding:10px; border-radius:8px; margin-bottom:12px; border:1px solid var(--border-subtle); font-family:var(--font-mono); font-size:11.5px;">
          +-----------------------+-----------------------+-------------------------+<br/>
          | Aspek / Pilar         | Status Saat Ini       | Rekomendasi Solutif     |<br/>
          +-----------------------+-----------------------+-------------------------+<br/>
          | Efisiensi Operasional | Perlu Optimalisasi    | Automasi Workflow & SLA |<br/>
          | Skalabilitas & Desain | Menghadapi Bottleneck | Pemisahan Modular Layer |<br/>
          | Mitigasi Risiko       | Potensi Celah Kritis  | Audit Berkala & Standar |<br/>
          +-----------------------+-----------------------+-------------------------+
        </div>

        <h4 style="color:#38bdf8; margin:10px 0 6px;">3. Rencana Aksi (Action Items) & Validasi</h4>
        <ul style="margin-left:20px; margin-bottom:14px;">
          <li><strong>Fase 1 (Segera):</strong> Isolasi variabel kritis dan terapkan standard operating procedures (SOP).</li>
          <li><strong>Fase 2 (Jangka Menengah):</strong> Implementasi arsitektur perbaikan secara bertahap dengan pengujian regressi.</li>
          <li><strong>Fase 3 (Verifikasi):</strong> Evaluasi tolok ukur kuantitatif dan pantau metrik performa secara kontinu.</li>
        </ul>

        <div style="padding:10px; background:rgba(16,185,129,0.1); border-left:3px solid var(--accent-emerald); border-radius:4px; font-size:12px; color:#a7f3d0;">
          ✓ Simulasi membuktikan prompt memiliki ketegasan instruksi yang sangat tinggi dan menghasilkan respon terstruktur tanpa bias!
        </div>
      `;
    }, 700);
  }

  const AI_MODELS = {
    gemini: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5/3 Flash (Cepat & Cerdas)" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5/3 Pro (Penalaran Kompleks)" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Long Context)" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Ringan)" }
    ],
    claude: [
      { id: "claude-3-7-sonnet-latest", name: "Claude 3.7 Sonnet (Hybrid Reasoning)" },
      { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet (Coding Specialist)" },
      { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku (Ultra Cepat)" }
    ],
    adacode: [
      { id: "adacode-v1", name: "AdaCode v1 (Coding Assistant)" },
      { id: "gpt-4o", name: "GPT-4o (OpenAI Compatible)" },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 (via Proxy)" },
      { id: "deepseek-coder", name: "DeepSeek Coder (via Proxy)" }
    ]
  };

  function updateAiProviderUI() {
    const provider = state.aiProvider;
    const models = AI_MODELS[provider] || AI_MODELS.gemini;

    // Populate Models Select
    el.aiModelSelect.innerHTML = models.map(m => {
      return `<option value="${m.id}" ${m.id === state.aiModel ? 'selected' : ''}>${m.name}</option>`;
    }).join("");

    // Custom Endpoint row visibility
    if (provider === "adacode") {
      el.customEndpointRow.style.display = "block";
      el.customEndpointInput.value = state.customEndpoint;
      el.apiKeyLabel.textContent = "AdaCode Token / API Key:";
      el.apiKeyInput.placeholder = "Bearer token / API Key AdaCode...";
    } else if (provider === "claude") {
      el.customEndpointRow.style.display = "none";
      el.apiKeyLabel.textContent = "Anthropic Claude API Key / Session Token:";
      el.apiKeyInput.placeholder = "sk-ant-...";
    } else {
      el.customEndpointRow.style.display = "none";
      el.apiKeyLabel.textContent = "Google Gemini API Key:";
      el.apiKeyInput.placeholder = "AIzaSy...";
    }

    // Populate existing saved API key for this provider
    el.apiKeyInput.value = state.apiKeys[provider] || "";
  }

  // Live Multi-Provider AI Integration (Gemini, Claude, AdaCode)
  async function runLiveAi() {
    const provider = state.aiProvider;
    const currentKey = state.apiKeys[provider] || el.apiKeyInput.value.trim();

    if (!currentKey) {
      showToast(`Harap masukkan API Key / Token untuk ${provider.toUpperCase()} terlebih dahulu!`, "error");
      return;
    }

    const promptText = compilePrompt();
    const modelName = el.aiModelSelect.value || state.aiModel;
    const customEndpoint = el.customEndpointInput ? el.customEndpointInput.value.trim() : "";

    el.simulationOutput.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; color:var(--accent-primary); font-weight:600; margin-bottom:12px;">
        <span class="pulse-indicator"></span> Menghubungkan ke ${provider.toUpperCase()} (${modelName})...
      </div>
    `;

    try {
      // Send request via backend proxy endpoint /api/generate
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider,
          model: modelName,
          apiKey: currentKey,
          customEndpoint: customEndpoint,
          prompt: promptText
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP Error ${response.status}`);
      }

      const reply = data.text || "Tidak ada respon dari model.";

      el.simulationOutput.innerHTML = `
        <div style="padding-bottom:10px; margin-bottom:12px; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:var(--accent-emerald); font-weight:700;">✓ LIVE RESPONSE (${provider.toUpperCase()} • ${modelName})</span>
          <button id="btnCopyApiResponse" class="btn btn-secondary btn-sm">Copy Jawaban</button>
        </div>
        <div style="white-space:pre-wrap; font-family:var(--font-sans); line-height:1.6; font-size:13px; color:#e2e8f0;">
          ${escapeHtml(reply)}
        </div>
      `;

      document.getElementById("btnCopyApiResponse").addEventListener("click", () => {
        navigator.clipboard.writeText(reply).then(() => {
          showToast("Jawaban AI berhasil disalin!");
        });
      });

    } catch (err) {
      el.simulationOutput.innerHTML = `
        <div style="padding:14px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); border-radius:8px; color:#fecdd3;">
          <h4 style="color:#f43f5e; margin-bottom:6px;">Gagal Menghubungi API ${provider.toUpperCase()}</h4>
          <p style="font-size:12px;">${err.message}</p>
          <p style="font-size:11px; margin-top:8px; color:#fda4af;">Pastikan API Key / Token valid, kuota mencukupi, dan terhubung dengan internet.</p>
        </div>
      `;
      showToast(`Koneksi ${provider.toUpperCase()} Gagal: ` + err.message, "error");
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Copy Prompt Action
  function copyPromptToClipboard() {
    const text = el.promptDisplay.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast("Prompt berhasil disalin ke clipboard!");
    }).catch(() => {
      showToast("Gagal menyalin prompt", "error");
    });
  }

  // Download as Markdown
  function downloadPromptFile() {
    const text = el.promptDisplay.textContent;
    const persona = getCurrentPersona();
    const filename = `Prompt_${persona.name.replace(/[^a-zA-Z0-9]/g, "_")}.md`;

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`File ${filename} berhasil diunduh!`);
  }

  // Save Custom Prompt
  function saveCurrentPrompt() {
    const title = prompt("Beri nama untuk prompt yang disimpan:", `${getCurrentPersona().name} - ${getCurrentFramework().name}`);
    if (!title) return;

    const savedItem = {
      id: "custom_" + Date.now(),
      title: title,
      category: state.selectedDomainId,
      expertId: state.selectedPersonaId,
      frameworkId: state.selectedFrameworkId,
      badge: "Kustom",
      data: { ...state.formData },
      constraints: [...state.constraints],
      fewShots: JSON.parse(JSON.stringify(state.fewShots)),
      variables: Object.keys(state.variables).map(k => ({ name: k, default: state.variables[k] }))
    };

    PROMPT_TEMPLATES.unshift(savedItem);
    renderTemplateLibrary();
    showToast(`Prompt "${title}" disimpan ke Bank Template!`);
  }

  // Setup Accordions
  function setupAccordions() {
    document.querySelectorAll(".accordion-box").forEach(box => {
      const header = box.querySelector(".accordion-header");
      header.addEventListener("click", () => {
        box.classList.toggle("open");
      });
    });
  }

  // Tab switcher
  function setupTabs() {
    el.tabPreviewBtn.addEventListener("click", () => {
      el.tabPreviewBtn.classList.add("active");
      el.tabPlaygroundBtn.classList.remove("active");
      el.previewView.style.display = "flex";
      el.playgroundView.classList.remove("active");
      el.playgroundView.style.display = "none";
    });

    el.tabPlaygroundBtn.addEventListener("click", () => {
      el.tabPlaygroundBtn.classList.add("active");
      el.tabPreviewBtn.classList.remove("active");
      el.previewView.style.display = "none";
      el.playgroundView.classList.add("active");
      el.playgroundView.style.display = "flex";
    });
  }

  // Initial Event Listeners Binding
  function bindEvents() {
    el.domainSelect.addEventListener("change", (e) => {
      state.selectedDomainId = e.target.value;
      const domain = getCurrentDomain();
      state.selectedPersonaId = domain.personas[0] ? domain.personas[0].id : "";
      renderPersonaCards();
      updateActiveBanner();
      updatePromptOutput();
    });

    el.btnAddConstraint.addEventListener("click", addConstraint);
    el.newConstraintInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addConstraint();
      }
    });

    el.btnAddFewShot.addEventListener("click", () => {
      state.fewShots.push({ input: "", output: "" });
      renderFewShots();
      updatePromptOutput();
    });

    el.btnCopy.addEventListener("click", copyPromptToClipboard);
    el.btnDownload.addEventListener("click", downloadPromptFile);
    el.btnMagicEnhance.addEventListener("click", magicEnhance);
    el.btnSavePrompt.addEventListener("click", saveCurrentPrompt);

    el.templateSearch.addEventListener("input", (e) => {
      renderTemplateLibrary(e.target.value);
    });

    el.btnRunSimulation.addEventListener("click", runSimulation);
    el.btnRunLiveApi.addEventListener("click", runLiveAi);

    // AI Provider Switcher
    el.aiProviderSelect.addEventListener("change", (e) => {
      state.aiProvider = e.target.value;
      localStorage.setItem("promptcraft_ai_provider", state.aiProvider);
      state.aiModel = (AI_MODELS[state.aiProvider] && AI_MODELS[state.aiProvider][0]) ? AI_MODELS[state.aiProvider][0].id : "";
      updateAiProviderUI();
    });

    // AI Model Switcher
    el.aiModelSelect.addEventListener("change", (e) => {
      state.aiModel = e.target.value;
      localStorage.setItem("promptcraft_ai_model", state.aiModel);
    });

    // Custom Endpoint
    if (el.customEndpointInput) {
      el.customEndpointInput.addEventListener("input", (e) => {
        state.customEndpoint = e.target.value;
        localStorage.setItem("promptcraft_endpoint_adacode", state.customEndpoint);
      });
    }

    // Save API Key per provider
    el.btnSaveApiKey.addEventListener("click", () => {
      const key = el.apiKeyInput.value.trim();
      const provider = state.aiProvider;
      state.apiKeys[provider] = key;
      localStorage.setItem(`promptcraft_key_${provider}`, key);
      showToast(key ? `API Key / Token untuk ${provider.toUpperCase()} tersimpan!` : "API Key dihapus!");
    });
  }

  // Bootstrap Application
  function initApp() {
    initElements();
    setupAccordions();
    setupTabs();
    bindEvents();

    if (el.aiProviderSelect) {
      el.aiProviderSelect.value = state.aiProvider;
      updateAiProviderUI();
    }

    renderDomainDropdown();
    renderPersonaCards();
    renderFrameworkCards();
    updateActiveBanner();
    renderFormFields();
    renderConstraints();
    renderFewShots();
    renderTemplateLibrary();
    updatePromptOutput();

    // Default load clean arch template to give user great first look!
    loadTemplate("tech_clean_arch_refactor");
  }

  document.addEventListener("DOMContentLoaded", initApp);
})();
