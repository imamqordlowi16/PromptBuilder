// data/frameworks.js - Framework Prompt Engineering Standar Industri
const PROMPT_FRAMEWORKS = [
  {
    id: "costar",
    name: "CO-STAR Framework",
    badge: "Paling Populer",
    tagline: "Context, Objective, Style, Tone, Audience, Response",
    description: "Framework terlengkap standar industri untuk menghasilkan luaran AI yang sangat terarah, kontekstual, dan sesuai dengan target audiens.",
    fields: [
      { key: "context", label: "Context (Konteks Latar Belakang)", placeholder: "Jelaskan latar belakang situasi, masalah yang dihadapi, batasan awal, atau data pengantar...", required: true, type: "textarea" },
      { key: "objective", label: "Objective (Tujuan / Tugas Utama)", placeholder: "Apa hasil spesifik yang ingin dicapai secara presisi?", required: true, type: "textarea" },
      { key: "style", label: "Style (Gaya Penulisan / Komunikasi)", placeholder: "Contoh: Jurnalistik investigatif, Konsultan McKinsey, Storytelling imersif, Kode modular...", required: false, type: "input" },
      { key: "tone", label: "Tone (Nada Bicara)", placeholder: "Contoh: Otoritatif namun ramah, sangat formal, persuasif berenergi, empatik...", required: false, type: "input" },
      { key: "audience", label: "Audience (Target Audiens)", placeholder: "Siapa pembaca/pengguna akhir? (Contoh: C-Level Executives, Mahasiswa Pemula, Developer Senior, Investor...)", required: true, type: "input" },
      { key: "response", label: "Response Format (Format Hasil)", placeholder: "Format yang diinginkan (Tabel komparasi, Markdown terstruktur dengan bullet points, JSON, Step-by-step tutorial...)", required: true, type: "input" }
    ],
    compile: (data, expert) => {
      let prompt = `### ROLE & IDENTITY\n${expert.role}\n\n`;
      if (expert.principles && expert.principles.length) {
        prompt += `### CORE PRINCIPLES & GUIDELINES\n`;
        expert.principles.forEach(p => prompt += `- ${p}\n`);
        prompt += `\n`;
      }
      prompt += `### CONTEXT\n${data.context || "(Konteks belum diisi)"}\n\n`;
      prompt += `### OBJECTIVE\n${data.objective || "(Tujuan belum diisi)"}\n\n`;
      if (data.style) prompt += `### STYLE\n${data.style}\n\n`;
      if (data.tone || expert.tone) prompt += `### TONE\n${data.tone || expert.tone}\n\n`;
      prompt += `### AUDIENCE\n${data.audience || "Umum / Profesional"}\n\n`;
      prompt += `### RESPONSE FORMAT\n${data.response || "Format terstruktur dalam Markdown rapi."}\n`;
      return prompt;
    }
  },
  {
    id: "create",
    name: "CREATE Framework",
    badge: "Fleksibel & Kreatif",
    tagline: "Character, Request, Examples, Adjustments, Type, Extras",
    description: "Sangat efektif untuk tugas kreatif, penulisan konten berkarakter unik, serta skenario yang membutuhkan batasan khusus (guardrails).",
    fields: [
      { key: "character", label: "Character (Karakter / Persona)", placeholder: "Siapa Anda dalam skenario ini? (Karakter, kepribadian, sudut pandang)", required: true, type: "input" },
      { key: "request", label: "Request (Permintaan Inti)", placeholder: "Apa perintah utama yang harus dikerjakan secara spesifik?", required: true, type: "textarea" },
      { key: "examples", label: "Examples (Contoh / Referensi)", placeholder: "Berikan contoh potongan teks, format, atau referensi gaya yang disukai...", required: false, type: "textarea" },
      { key: "adjustments", label: "Adjustments (Batasan / Penyesuaian Khusus)", placeholder: "Hal-hal yang WAJIB dihindari (Jangan gunakan kata klise, batasi 300 kata, hindari jargon berlebihan)...", required: false, type: "textarea" },
      { key: "type", label: "Type (Tipe Luaran)", placeholder: "Contoh: Artikel blog 1000 kata, Newsletter, Script podcast, Kode komponen React...", required: true, type: "input" },
      { key: "extras", label: "Extras (Instruksi Tambahan)", placeholder: "Sertakan Call to Action di akhir, berikan 3 alternatif judul memikat...", required: false, type: "input" }
    ],
    compile: (data, expert) => {
      let prompt = `### CHARACTER & PERSONA\n${data.character || expert.role}\n\n`;
      prompt += `### REQUEST (PERINTAH UTAMA)\n${data.request || "(Permintaan belum diisi)"}\n\n`;
      if (data.examples) prompt += `### EXAMPLES & REFERENCE\n${data.examples}\n\n`;
      if (data.adjustments) prompt += `### ADJUSTMENTS & CONSTRAINTS\n${data.adjustments}\n\n`;
      prompt += `### TYPE OF OUTPUT\n${data.type || "Dokumen Markdown profesional"}\n\n`;
      if (data.extras) prompt += `### EXTRAS & ADDITIONAL INSTRUCTIONS\n${data.extras}\n`;
      return prompt;
    }
  },
  {
    id: "rtf",
    name: "RTF Framework",
    badge: "Cepat & Ringkas",
    tagline: "Role, Task, Format",
    description: "Framework paling to-the-point dan cepat digunakan untuk tugas-tugas teknis, penulisan ringkas, atau instruksi langsung.",
    fields: [
      { key: "role", label: "Role (Peran Spesifik)", placeholder: "Contoh: Senior DevOps Engineer dengan keahlian Kubernetes & Helm...", required: true, type: "input" },
      { key: "task", label: "Task (Tugas yang Diberikan)", placeholder: "Jelaskan langkah demi langkah apa yang harus dilakukan...", required: true, type: "textarea" },
      { key: "format", label: "Format (Format Hasil Akhir)", placeholder: "Contoh: YAML configuration file lengkap dengan komentar penjelasan per baris...", required: true, type: "input" }
    ],
    compile: (data, expert) => {
      let prompt = `### ROLE\n${data.role || expert.role}\n\n`;
      prompt += `### TASK\n${data.task || "(Tugas belum ditentukan)"}\n\n`;
      prompt += `### FORMAT\n${data.format || "Jawaban terstruktur dengan penjelasan jelas dan praktis."}\n`;
      return prompt;
    }
  },
  {
    id: "cot",
    name: "Chain-of-Thought (CoT)",
    badge: "Penalaran Mendalam",
    tagline: "Step-by-Step Analytical Thinking & Self-Verification",
    description: "Menginstruksikan AI untuk berpikir secara bertahap melalui penalaran tersembunyi/eksplisit sebelum menarik kesimpulan, meminimalkan halusinasi hingga 80%.",
    fields: [
      { key: "problem", label: "Problem / Challenge (Masalah / Tantangan Kompleks)", placeholder: "Tuliskan persoalan kompleks, arsitektur yang perlu dianalisis, atau keputusan strategis...", required: true, type: "textarea" },
      { key: "assumptions", label: "Known Facts & Constraints (Fakta & Batasan)", placeholder: "Data yang sudah pasti diketahui, batas anggaran, kapasitas server, limit waktu...", required: false, type: "textarea" },
      { key: "reasoning_steps", label: "Mandatory Reasoning Protocol (Tahapan Analisis)", placeholder: "1. Identifikasi akar masalah, 2. Bedah 3 solusi alternatif, 3. Evaluasi pro-kontra...", required: false, type: "textarea" },
      { key: "final_deliverable", label: "Final Deliverable (Hasil Akhir & Rekomendasi)", placeholder: "Rekomendasi final yang didukung data, lengkap dengan rencana mitigasi risiko...", required: true, type: "input" }
    ],
    compile: (data, expert) => {
      let prompt = `### ROLE & THINKING CAPACITY\n${expert.role}\n\n`;
      prompt += `### COMPLEX PROBLEM STATEMENT\n${data.problem || "(Masalah belum diisi)"}\n\n`;
      if (data.assumptions) prompt += `### KNOWN FACTS & CONSTRAINTS\n${data.assumptions}\n\n`;
      prompt += `### MANDATORY CHAIN-OF-THOUGHT PROTOCOL\n`;
      prompt += `Sebelum memberikan kesimpulan akhir, kamu WAJIB melakukan penalaran bertahap dengan memecah masalah ke dalam blok berpikir berikut:\n`;
      if (data.reasoning_steps) {
        prompt += `${data.reasoning_steps}\n\n`;
      } else {
        prompt += `1. **Dekonstruksi Masalah**: Urai komponen inti dan identifikasi asumsi tersembunyi.\n`;
        prompt += `2. **Eksplorasi Hipotesis**: Tinjau minimal 2-3 pendekatan atau sudut pandang berbeda.\n`;
        prompt += `3. **Stress Testing**: Uji kelemahan masing-masing solusi terhadap skenario ekstrem.\n`;
        prompt += `4. **Sintesis & Validasi**: Tarik kesimpulan logis berbasis bukti terkuat.\n\n`;
      }
      prompt += `### FINAL DELIVERABLE SPECIFICATION\n${data.final_deliverable || "Laporan terstruktur dengan rekomendasi yang siap dieksekusi."}\n`;
      return prompt;
    }
  },
  {
    id: "tot",
    name: "Tree-of-Thought (ToT)",
    badge: "Eksplorasi Multidimensi",
    tagline: "Multi-Path Evaluation & Decision Matrix",
    description: "Mengharuskan model mengeksplorasi berbagai cabang alternatif pemikiran (Branches of Thought), membandingkan trade-offs, dan memilih cabang terbaik.",
    fields: [
      { key: "scenario", label: "Strategic Dilemma / Scenario (Skenario Keputusan)", placeholder: "Keputusan arsitektur atau bisnis strategis apa yang sedang dipertimbangkan?", required: true, type: "textarea" },
      { key: "criteria", label: "Evaluation Criteria (Kriteria Penilaian)", placeholder: "Contoh: Biaya operasional, Time-to-Market, Skalabilitas, Keamanan, Kompleksitas tim...", required: true, type: "textarea" },
      { key: "target_output", label: "Output Matrix & Final Verdict", placeholder: "Tabel perbandingan skor (1-10) untuk tiap jalur solusi diikuti kesimpulan keputusan final...", required: true, type: "input" }
    ],
    compile: (data, expert) => {
      let prompt = `### ROLE & ADVISORY IDENTITY\n${expert.role}\n\n`;
      prompt += `### DECISION SCENARIO\n${data.scenario || "(Skenario belum diisi)"}\n\n`;
      prompt += `### EVALUATION CRITERIA\n${data.criteria || "Efisiensi, Biaya, Skalabilitas, Keamanan, dan Resiko."}\n\n`;
      prompt += `### TREE-OF-THOUGHT INSTRUCTIONS\n`;
      prompt += `Lakukan analisis pohon pemikiran (Tree of Thought):\n`;
      prompt += `- **Jalur A (Solusi Konservatif/Standard)**: Kelebihan, kekurangan, dan perkiraan dampak.\n`;
      prompt += `- **Jalur B (Solusi Inovatif/Modern)**: Kelebihan, kekurangan, dan perkiraan dampak.\n`;
      prompt += `- **Jalur C (Solusi Hibrida/Out-of-the-box)**: Kelebihan, kekurangan, dan perkiraan dampak.\n`;
      prompt += `- **Matriks Penilaian**: Berikan tabel evaluasi komparatif.\n`;
      prompt += `- **Keputusan Final**: Pilih 1 jalur terbaik beserta roadmap implementasinya.\n\n`;
      prompt += `### FORMAT DELIVERABLE\n${data.target_output || "Matriks komparasi dan rekomendasi eksekutif."}\n`;
      return prompt;
    }
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PROMPT_FRAMEWORKS };
}
