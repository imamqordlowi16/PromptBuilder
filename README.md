# ⚡ PromptCraft Studio — AI Prompt Builder & Multi-Domain Expert Architect

Aplikasi canggih untuk rekayasa prompt (*Prompt Engineering*) berbasis web dengan kapabilitas **Pakar di Semua Bidang** (*Multi-Domain System Persona*), framework prompt teruji standar global, sistem penilai kualitas prompt (*Prompt Grader*), testing playground terintegrasi, serta siap di-deploy langsung ke **Render** atau cloud hosting lainnya.

---

## 🌐 Panduan Deploy ke Render (Akses Online Publik)

Aplikasi ini sudah dilengkapi dengan `render.yaml`, `server.js`, dan `package.json` siap produksi sehingga dapat di-deploy ke **Render** secara gratis dan instan.

### Langkah 1: Buat Repository di GitHub
1. Buka [GitHub](https://github.com/) dan buat repository baru (misalnya: `PromptCraft-Studio`).
2. Hubungkan folder lokal Anda dan push kode ke GitHub dengan perintah berikut di terminal:
   ```bash
   git remote add origin https://github.com/<username-anda>/PromptCraft-Studio.git
   git branch -M main
   git push -u origin main
   ```

### Langkah 2: Deploy di Render (render.com)
1. Buka dashboard [Render.com](https://dashboard.render.com/) (buat akun gratis jika belum punya).
2. Klik tombol **New +** di pojok kanan atas, lalu pilih **Web Service** (atau **Blueprint**):
   - **Opsi A (Via Web Service)**:
     - Pilih **Build and deploy from a Git repository**.
     - Sambungkan repository GitHub yang telah Anda buat tadi.
     - Isikan pengaturan berikut:
       - **Name**: `promptcraft-studio` (atau nama pilihan Anda)
       - **Environment**: `Node`
       - **Region**: Bebas (misal: *Singapore* untuk akses tercepat dari Indonesia)
       - **Branch**: `main`
       - **Build Command**: *(kosongkan atau biarkan kosong)*
       - **Start Command**: `npm start` (atau `node server.js`)
       - **Instance Type**: `Free`
     - Klik **Create Web Service**.
   - **Opsi B (Via Render Blueprint)**:
     - Pilih **New +** -> **Blueprint**.
     - Sambungkan repository GitHub Anda. Render akan otomatis membaca file `render.yaml` dan mengonfigurasi segalanya secara otomatis!

### Langkah 3: Akses Aplikasi
Dalam 1–2 menit, Render akan mempublikasikan aplikasi Anda dengan URL HTTPS publik aktif, contoh:
`https://promptcraft-studio.onrender.com`

Aplikasi kini dapat diakses oleh siapa saja dari mana saja melalui HP, laptop, atau tablet!

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
- **🎯 Few-Shot Learning**: Pasangan contoh input/output ideal untuk mengunci akurasi model hingga 80%+.
- **📊 Real-Time Quality Grader**: Menilai kejelasan peran, kedalaman konteks, batasan, dan format respon dengan skor persentase (0–100%) dan saran perbaikan langsung.
- **📚 Bank Template Prompt**: Koleksi 30+ template siap pakai untuk berbagai industri.
- **🚀 Live Playground & Simulator**: Simulasi penalaran lokal instan atau pengujian langsung ke model Google Gemini (Gemini 2.5 Flash) menggunakan API Key Anda.
- **📋 One-Click Copy & Export Markdown**: Salin langsung ke ChatGPT/Claude/Gemini atau unduh sebagai file `.md`.

---

## 🖥️ Menjalankan Secara Lokal

```bash
# Menggunakan Node.js
npm start

# Atau menggunakan Python
python -m http.server 8085
```
Buka browser di `http://localhost:10000` (Node) atau `http://localhost:8085` (Python).

---

## 📂 Struktur Proyek

```
c:\ZeenIQTools\PromptBuilder\
├── index.html            # Antarmuka web utama
├── style.css             # Tema modern glassmorphism & responsive design
├── app.js                # Logika aplikasi & playground runner
├── server.js             # Server HTTP Node.js production-ready untuk Render
├── package.json          # Node manifest & start scripts
├── render.yaml           # Konfigurasi Render Blueprint
├── .gitignore            # Git ignore file
├── data/
│   ├── experts.js        # Persona pakar di semua bidang
│   ├── frameworks.js     # Framework prompt engineering
│   └── templates.js      # Bank preset prompt siap pakai
└── README.md             # Panduan lengkap & deployment
```
