# ⚡ PromptCraft Studio — AI Prompt Builder & Multi-Domain Expert Architect

Aplikasi canggih untuk rekayasa prompt (Prompt Engineering) berbasis web dengan kapabilitas **Pakar di Semua Bidang** (*Multi-Domain System Persona*), framework prompt teruji standar global, sistem penilai kualitas prompt (*Prompt Grader*), dan testing playground terintegrasi.

---

## 🌟 Fitur Utama

### 1. Pakar Multi-Disiplin di Semua Bidang
Aplikasi menyediakan persona pakar siap pakai dengan prinsip berpikir (*principles*) dan nada komunikasi (*tone*) yang mendalam:
- **💻 Teknologi & Rekayasa Perangkat Lunak**: Principal Software Architect, Staff Full-Stack Engineer, DevOps & Cloud SRE Master, Cybersecurity Specialist, Database DBA & Optimizer.
- **💼 Bisnis, Startup & Manajemen**: Senior Management Consultant (McKinsey style), Chief Product Officer (PRD Master), Growth Hacker & Marketer, VC & Pitch Deck Advisor.
- **🎨 Kreatif, Copywriting & Media**: Direct-Response Copywriter Legendaris, Viral Video Strategist (TikTok/Reels), Master Storyteller & Novelist.
- **🎓 Pendidikan & Riset Ilmiah**: Tutor Sokrates & Deep-Learning Coach, Senior Peer Reviewer & Journal Editor, Curriculum Architect.
- **📊 Keuangan, Investasi & Akuntansi**: Chartered Financial Analyst (CFA DCF Valuation), Macroeconomics & Web3 Strategist, Corporate Tax & Forensic Auditor.
- **⚖️ Hukum, Kontrak & Regulasi**: Senior Corporate Legal Counsel (Contract Risk Reviewer), Data Privacy & Compliance Specialist.
- **🏥 Kesehatan, Kedokteran & Sains**: Medical Doctor & Health Communicator, Biomedical & Genomics Researcher.
- **✨ UI/UX Design & Interaksi**: Principal Product Designer (WCAG, Usability Heuristics).
- **⚡ Custom Expert Builder**: Buat persona keahlian khusus Anda sendiri dengan parameter unik.

---

### 2. Kerangka Prompt Engineering Berstandar Industri
- **CO-STAR**: *Context, Objective, Style, Tone, Audience, Response Format*.
- **CREATE**: *Character, Request, Examples, Adjustments, Type, Extras*.
- **RTF**: *Role, Task, Format* (Cepat, ringkas, dan fokus).
- **Chain-of-Thought (CoT)**: Penalaran mendalam bertahap dengan dekonstruksi masalah, eksplorasi hipotesis, dan validasi sebelum kesimpulan.
- **Tree-of-Thought (ToT)**: Eksplorasi 3 cabang alternatif solusi pemikiran secara paralel, evaluasi pro-kontra, dan penentuan jalur optimal.

---

### 3. Fitur Cerdas Lainnya
- **✨ Magic Enhance**: Tombol otomatis untuk mengubah ide kasar menjadi prompt terstruktur kelas enterprise.
- **🏷️ Variabel Dinamis**: Otomatis mendeteksi placeholder `{{nama_variabel}}` dan menyediakannya sebagai input form yang interaktif.
- **🛑 Batasan Negatif & Guardrails**: Mencegah halusinasi model dengan aturan batasan tegas.
- **🎯 Few-Shot Examples**: Tambahkan pasangan contoh input/output ideal untuk mengunci akurasi model hingga 80%+.
- **📊 Real-Time Quality Grader**: Menilai kejelasan peran, kedalaman konteks, batasan, dan format respon dengan skor persentase (0–100%) dan saran perbaikan langsung.
- **📚 Bank Template Prompt**: Koleksi 30+ template siap pakai untuk berbagai industri.
- **🚀 Live Playground & Simulator**: Simulasi penalaran lokal instan atau pengujian langsung ke model Google Gemini (Gemini 2.5 Flash) menggunakan API Key Anda.
- **📋 One-Click Copy & Export Markdown**: Salin langsung ke ChatGPT/Claude/Gemini atau unduh sebagai file `.md`.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dibangun murni menggunakan standar web modern (Vanilla HTML5, CSS3 Glassmorphism, JavaScript ES6+) tanpa memerlukan proses kompilasi (*zero build step*).

### Opsi 1: Buka Langsung di Browser
Cukup klik ganda (double-click) file `index.html` atau buka melalui browser apa pun:
```
file:///c:/ZeenIQTools/PromptBuilder/index.html
```

### Opsi 2: Jalankan Melalui Local Web Server
Jika ingin menjalankan server lokal (misalnya menggunakan Python atau Node.js):

Menggunakan Node.js:
```bash
npx serve c:\ZeenIQTools\PromptBuilder
```

Atau menggunakan Python:
```bash
python -m http.server 3000 --directory c:\ZeenIQTools\PromptBuilder
```
Lalu buka `http://localhost:3000` di browser Anda.

---

## 📂 Struktur Proyek

```
c:\ZeenIQTools\PromptBuilder\
├── index.html            # Struktur antarmuka web semantik
├── style.css             # Design system modern, tema gelap & glassmorphism
├── app.js                # State management, kompilasi prompt, grader & API runner
├── data/
│   ├── experts.js        # Matrix persona pakar multi-disiplin
│   ├── frameworks.js     # Framework prompt engineering (CO-STAR, CoT, ToT, dll.)
│   └── templates.js      # Bank template prompt siap pakai
└── README.md             # Dokumentasi lengkap
```
