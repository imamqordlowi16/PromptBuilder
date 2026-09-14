// data/templates.js - Koleksi Preset Prompt Ahli Siap Pakai
const PROMPT_TEMPLATES = [
  {
    id: "tech_blazor_etl_refactor",
    title: "Update Fitur Blazor .NET, Skema ETL & Dynamic Data Grid",
    category: "tech_software",
    expertId: "fullstack_engineer",
    frameworkId: "costar",
    badge: "Enterprise .NET",
    data: {
      context: "Sedang dilakukan update requirement khusus pada komponen Blazor {{file_target}} pada bagian {{target_tab}}. Diperlukan penyesuaian skema ETL, pemanggilan dynamic grid, pengiriman parameter filter tanggal dan kategori, serta adopsi logika pemetaan kolom tertentu dari {{file_reference}}.",
      objective: "Lakukan update pada function {{function_1}} dan {{function_2}}:\n1. Ganti skema ETL lama ({{etl_lama_1}}) menjadi skema baru ({{etl_baru_1}}) dan ubah method grid menjadi {{grid_method}}.\n2. Buat filter dinamis dari {{filter_source_1}} dan {{filter_source_2}} lalu lempar nilainya ke skema ETL.\n3. Tampilkan kolom pada grid sesuai spesifikasi tabel excel rujukan ({{excel_reference}}).\n4. Khusus kolom {{kolom_khusus}} yang tidak disediakan ETL, adopsi logika ekstraksi datanya persis seperti implementasi di {{file_reference}}. Kolom lainnya tetap diambil dari ETL.\n5. Pastikan filter bekerja reaktif dan data tertampil sesuai output ETL.",
      style: "Staff .NET Blazor Specialist & Full-Stack Architect",
      tone: "Sangat teknis, teliti, aman dari regresi kode (terisolasi pada tab target)",
      audience: "Software Engineer, .NET C# Developer, dan Tech Lead",
      response: "Kode C# revisi lengkap untuk function yang diubah, snippet markup Blazor (.razor) untuk filter parameter binding, dan catatan penjelas logika adopsi tanpa merusak tab lainnya."
    },
    constraints: [
      "JANGAN ubah struktur HTML atau logika kode di luar tab target (isolasi ketat agar tidak terjadi regresi).",
      "Wajib gunakan async/await dan bungkus pemanggilan grid dalam try-catch dengan error handling & null-check.",
      "Pastikan binding filter dinamis dan reaktif (trigger refresh grid saat tanggal/kategori berubah).",
      "Pertahankan namespace, dependency injection, dan method lifecycle Blazor yang sudah ada."
    ],
    variables: [
      { name: "file_target", default: "PDN.razor" },
      { name: "target_tab", default: "Tab 1 (Rasio PDN)" },
      { name: "file_reference", default: "PUAB.razor" },
      { name: "function_1", default: "LoadPdnKelompokPage" },
      { name: "function_2", default: "LoadPdnIndividualPage" },
      { name: "etl_lama_1", default: "DATA_PDN_ABSOLUT_MODAL2" },
      { name: "etl_baru_1", default: "RASIO_PDN_SEBELUM_TD_VALAS_KELOMPOK" },
      { name: "grid_method", default: "LoadPivotAsync" },
      { name: "filter_source_1", default: "Datetime Picker Posisi Laporan" },
      { name: "filter_source_2", default: "Kelompok Bank" },
      { name: "excel_reference", default: "MONITORING-HARIAN-AGREGASI-PDN_RASIO PDN.xlsx" },
      { name: "kolom_khusus", default: "Kelompok Bank & Bank" }
    ]
  },
  {
    id: "tech_clean_arch_refactor",
    title: "Refactoring Sistem ke Clean Architecture & SOLID",
    category: "tech_software",
    expertId: "senior_architect",
    frameworkId: "costar",
    badge: "Populer",
    data: {
      context: "Kami memiliki aplikasi backend monolitik berbasis Node.js/TypeScript yang mengalami technical debt tinggi, banyak tightly-coupled dependencies antar service, dan sulit diuji secara otomatis (unit testing coverage di bawah 20%).",
      objective: "Buat panduan refactoring komprehensif untuk memisahkan domain logic, use cases, controller, dan repository sesuai prinsip Clean Architecture dan SOLID. Sertakan diagram alir modular dan contoh implementasi kode TypeScript nyata.",
      style: "Principal Software Engineer dengan standar enterprise",
      tone: "Teknis, presisi, mendalam, dan terstruktur",
      audience: "Tim Senior Backend Engineers & Tech Lead",
      response: "Struktur folder lengkap, penjelasan peran tiap layer (Entities, Use Cases, Adapters, Frameworks), contoh kode refactoring interface & dependency injection, serta strategi migrasi tanpa downtime."
    },
    constraints: [
      "Gunakan TypeScript strict mode",
      "Jangan gunakan library eksternal berlebihan di domain layer",
      "Sediakan unit test mock pattern untuk use case"
    ],
    variables: [
      { name: "framework_backend", default: "Express / Fastify" },
      { name: "database_type", default: "PostgreSQL dengan Prisma" }
    ]
  },
  {
    id: "tech_security_audit_api",
    title: "Security & Vulnerability Audit untuk REST / GraphQL API",
    category: "tech_software",
    expertId: "cybersecurity_expert",
    frameworkId: "rtf",
    badge: "Keamanan",
    data: {
      role: "Lead Cybersecurity Auditor & Penetration Tester tersertifikasi OSCP/CISSP.",
      task: "Lakukan audit keamanan menyeluruh terhadap arsitektur autentikasi JWT dan endpoints API berikut: {{api_endpoints_description}}. Identifikasi potensi celah keamanan berdasarkan OWASP Top 10 API Security Risks (seperti Broken Object Level Authorization / BOLA, SQLi/NoSQLi, mass assignment, dan rate-limiting bypass). Untuk setiap temuan, sertakan severity rating (CVSS), Proof-of-Concept skenario serangan, dan rekomendasi patch kode remedi-nya.",
      format: "Laporan Security Audit formal Markdown dengan tabel ringkasan risiko (Critical, High, Medium, Low) diikuti detail teknis langkah mitigasi."
    },
    constraints: [
      "Wajib merujuk pada standar OWASP API Security Top 10",
      "Sertakan kode snippet perbaikan sebelum vs sesudah (diff)",
      "Hindari asumsi tanpa verifikasi mekanisme enkripsi"
    ],
    variables: [
      { name: "api_endpoints_description", default: "Auth login, user profile update, order payment checkout" }
    ]
  },
  {
    id: "business_saas_pitch_deck",
    title: "Pitch Deck Narrative & Financial Storytelling (Seed to Series A)",
    category: "business_strategy",
    expertId: "startup_pitch_advisor",
    frameworkId: "costar",
    badge: "Investasi",
    data: {
      context: "Startup kami sedang membangun produk B2B SaaS dengan model subscription tahunan. Kami telah memiliki MRR sebesar {{mrr_current}} dengan pertumbuhan MoM {{growth_rate}}% dan churn rate di bawah 2%. Kami berencana menggalang pendanaan Seed sebesar {{target_funding}}.",
      objective: "Rancang narasi slide-by-slide lengkap untuk Pitch Deck 12 slide yang mampu meyakinkan investor tier-1 VC. Setiap slide harus memiliki 'One Single Core Message', visual cue yang disarankan, dan poin narasi data.",
      style: "Venture Capitalist Partner & Storyteller",
      tone: "Persuasif, berbasis data metrik, percaya diri tanpa hiperbola",
      audience: "General Partners di institusi Venture Capital terkemuka",
      response: "Outline 12 slide pitch deck lengkap: Problem, Solution, Why Now, Market Size (TAM/SAM/SOM), Product Demo/Features, Traction & Unit Economics (CAC, LTV, Magic Number), Competitive Moat, Business Model, Financial Projection (3 tahun), Team, The Ask & Use of Funds."
    },
    constraints: [
      "Fokus pada angka unit economics riil bukan vanity metrics",
      "Keluarkan 'unfair advantage' yang sulit ditiru kompetitor besar",
      "Batasi pesan utama tiap slide maksimal 1 kalimat penegas"
    ],
    variables: [
      { name: "mrr_current", default: "$25,000" },
      { name: "growth_rate", default: "20" },
      { name: "target_funding", default: "$1,500,000" }
    ]
  },
  {
    id: "business_prd_spec",
    title: "Product Requirement Document (PRD) Komprehensif",
    category: "business_strategy",
    expertId: "product_manager",
    frameworkId: "costar",
    badge: "Produk",
    data: {
      context: "Kami merencanakan fitur baru {{feature_name}} untuk platform e-commerce kami guna meningkatkan konversi checkout dari pengguna mobile yang saat ini mengalami drop-off sebesar 45% di tahap pembayaran.",
      objective: "Tulis PRD (Product Requirement Document) standar industri teknologi global yang siap digunakan oleh tim Engineering, UI/UX Designer, dan QA.",
      style: "Staff Product Manager (FAANG/Tier-1 Tech style)",
      tone: "Struktur rapi, lugas, user-centric, detail pada edge cases",
      audience: "Software Engineers, Product Designers, QA, dan Stakeholder Bisnis",
      response: "Dokumen PRD lengkap meliputi: Executive Summary, Problem Statement & User Persona, Goals & Non-Goals, North Star Metric & Key Performance Indicators (KPI), User Stories dengan format 'As a... I want to... So that...', Detailed Functional Requirements, Edge Cases & Error Handling, Tracking/Telemetry Events, dan Rollout Plan (Alpha, Beta, GA)."
    },
    constraints: [
      "Sertakan acceptance criteria menggunakan format Gherkin (Given-When-Then)",
      "Definisikan non-goals secara tegas agar tidak terjadi feature creep",
      "Pertimbangkan aspek aksesibilitas dan offline fallback"
    ],
    variables: [
      { name: "feature_name", default: "One-Click Checkout dengan Dompet Digital & Biometrik" }
    ]
  },
  {
    id: "creative_viral_hooks_script",
    title: "Skrip Video Pendek Viral (TikTok / Reels / Shorts) dengan Hook Retensi Tinggi",
    category: "creative_writing",
    expertId: "viral_content_creator",
    frameworkId: "create",
    badge: "Viral",
    data: {
      character: "Top Content Strategist & Video Producer dengan rekam jejak video berpenonton 10M+ views.",
      request: "Buat 3 variasi skrip video vertikal durasi 45-60 detik tentang topik {{video_topic}}. Setiap variasi harus menerapkan jenis hook berbeda (Contrarian Statement, Story In-Media-Res, dan Curiosity Loop). Sertakan instruksi visual per detik (kamera, teks di layar, ekspresi muka, dan sound effect).",
      examples: "Contoh Hook: '90% orang salah paham tentang cara kerja AI, dan ini alasan kenapa akunmu sepi...' atau 'Jangan pernah beli MacBook sebelum kamu cek trik tersembunyi ini...'",
      adjustments: "Jangan ada pembukaan klise seperti 'Halo teman-teman apa kabar'. Mulai seketika di detik 0.00 dengan kalimat pengait perhatian. Buat pacing kalimat pendek dan ritmis.",
      type: "Tabel script 3 kolom: [Timestamp (Detik) | Narasi Audio | Visual & On-Screen Text]",
      extras: "Sertakan 5 ide judul click-worthy dan rekomendasi hashtag trending di akhir."
    },
    constraints: [
      "Durasi pacing kata rata-rata 130-150 kata per menit",
      "Picu retensi penonton hingga detik terakhir dengan open-loop"
    ],
    variables: [
      { name: "video_topic", default: "Strategi Manajemen Waktu dan Otomatisasi Produktivitas" }
    ]
  },
  {
    id: "creative_direct_sales_letter",
    title: "High-Converting Sales Letter & Landing Page Copy (Formula PAS)",
    category: "creative_writing",
    expertId: "direct_copywriter",
    frameworkId: "costar",
    badge: "Copywriting",
    data: {
      context: "Produk kami {{product_name}} adalah program pelatihan intensif yang membantu {{target_audience}} mengatasi {{core_pain_point}} dan mencapai {{desired_transformation}} dalam 30 hari.",
      objective: "Tulis copywriting landing page penjualan konversi tinggi menggunakan formula PAS (Problem - Agitation - Solution) yang menyentuh emosi pembaca dan menghilangkan keraguan pembelian.",
      style: "Direct-Response Copywriting legendaris kelas dunia",
      tone: "Empatis, membongkar realita, menggugah emosi, percaya diri dan mengarahkan ke solusi tak terbantahkan",
      audience: "{{target_audience}}",
      response: "Copywriting lengkap mencakup: Pre-headline, Magnetic Main Headline, Sub-headline, The Story & Agitation (Pain point amplification), The Eureka Moment, Pengenalan Solusi & Feature to Benefit Matrix, Social Proof section, The Irresistible Offer (Stacking value), FAQ perontok keberatan harga, dan Strong Call To Action (CTA) dengan garansi uang kembali."
    },
    constraints: [
      "Fokus pada transformasi emosional dan hasil riil",
      "Gunakan power words yang tajam dan hindari jargon pasif"
    ],
    variables: [
      { name: "product_name", default: "Mastery Prompt Engineering Bootcamp" },
      { name: "target_audience", default: "Profesional muda dan freelancer digital" },
      { name: "core_pain_point", default: "Ketinggalan revolusi AI dan takut tergantikan teknologi otomatis" },
      { name: "desired_transformation", default: "Meningkatkan kecepatan kerja 5x lipat dan mendominasi keahlian AI" }
    ]
  },
  {
    id: "edu_socratic_deep_concept",
    title: "Eksplorasi Konsep Rumit dengan Dialog Sokrates Bertingkat",
    category: "education_research",
    expertId: "socratic_tutor",
    frameworkId: "cot",
    badge: "Pedagogi",
    data: {
      problem: "User ingin memahami konsep rumit {{complex_concept}} secara intuitif dan fundamental, bukan sekadar menghafal rumus atau definisi teks buku.",
      assumptions: "User memiliki latar belakang pemula hingga menengah, menyukai analogi dunia nyata yang konkret, dan mudah bosan dengan penjelasan yang terlalu abstrak tanpa korelasi empiris.",
      reasoning_steps: "1. Urai konsep dasar menjadi 'First Principles'. 2. Buat skenario teka-teki analogis yang memicu intuisi user. 3. Susun pertanyaan bertahap dari level pemahaman awal hingga ke inti mekanika konsep. 4. Berikan panduan self-reflection di setiap tahap.",
      final_deliverable: "Sebuah percakapan terpandu yang dimulai dengan 1 analogi mencengangkan dan diakhiri dengan 3 pertanyaan pemantik pemikiran mendalam yang harus direnungkan oleh user."
    },
    constraints: [
      "Jangan langsung membocorkan jawaban lengkap di awal",
      "Gunakan analogi visual sehari-hari",
      "Dorong user untuk menarik kesimpulannya sendiri"
    ],
    variables: [
      { name: "complex_concept", default: "Mekanisme Perhatian (Self-Attention Mechanism) pada Model Transformer AI" }
    ]
  },
  {
    id: "finance_dcf_valuation_model",
    title: "Analisis Fundamental & Valuasi Saham Discounted Cash Flow (DCF)",
    category: "finance_investment",
    expertId: "cfa_financial_analyst",
    frameworkId: "costar",
    badge: "Valuasi",
    data: {
      context: "Sedang menganalisis emiten {{ticker_code}} di sektor {{industry_sector}} dengan pendapatan historis 3 tahun terakhir dan Free Cash Flow to Firm (FCFF) yang bertumbuh.",
      objective: "Bangun model analisis valuasi intrinsik DCF dengan proyeksi 5 tahun, estimasi WACC (Weighted Average Cost of Capital), Terminal Value (Gordon Growth vs Exit Multiple), serta analisis sensitivitas terhadap fluktuasi suku bunga dan margin laba.",
      style: "Equity Research Report standar Wall Street / CFA Institute",
      tone: "Objektif, kuantitatif, tanpa bias emosional, berbasis data fundamental",
      audience: "Komite Investasi dan Portofolio Manajer Institusional",
      response: "Laporan valuasi terstruktur: Asumsi Makro & Risk-Free Rate, Proyeksi FCFF 5 tahun ke depan, Perhitungan WACC terperinci, Nilai Terminal & Nilai Wajar Per Lembar Saham (Fair Value), Matriks Sensitivitas (Sensitivitas WACC vs Terminal Growth Rate), dan Rekomendasi Investasi (Strong Buy / Hold / Sell) dengan Margin of Safety."
    },
    constraints: [
      "Jabarkan formula matematika dan asumsi WACC (Cost of Equity via CAPM, Cost of Debt)",
      "Wajib menyajikan tabel matriks sensitivitas 2 dimensi",
      "Sebutkan risiko penurunan utama (downside risks)"
    ],
    variables: [
      { name: "ticker_code", default: "BBCA.JK / NVDA" },
      { name: "industry_sector", default: "Teknologi Semikonduktor & Infrastruktur Cloud" }
    ]
  },
  {
    id: "legal_contract_risk_audit",
    title: "Audit & Bedah Risiko Kontrak Perjanjian Kerjasama Bisnis (MOU / NDA / SLA)",
    category: "legal_compliance",
    expertId: "corporate_lawyer",
    frameworkId: "costar",
    badge: "Legal",
    data: {
      context: "Klien kami sedang menerima draf kontrak {{contract_type}} dari pihak rekanan/klien korporasi besar yang berpotensi memuat klausul-klausul yang memberatkan sepihak atau ambigu.",
      objective: "Audit seluruh klausul dalam draf kontrak terlampir. Identifikasi klausul bermasalah (red flags) seperti batasan tanggung jawab yang tidak seimbang, klausul ganti rugi (indemnification) tanpa batas, pemutusan sepihak, hak kekayaan intelektual (IP ownership), dan klausul penyelesaian sengketa (arbitrase vs pengadilan). Berikan alternatif redaksi kalimat klausul revisi (redline version) yang melindungi kepentingan klien secara adil.",
      style: "Partner Senior Law Firm Korporasi",
      tone: "Sangat teliti, presisi hukum tinggi, berhati-hati, objektif",
      audience: "Direksi Perusahaan, In-House Counsel, dan Business Development",
      response: "Laporan Legal Review terstruktur: Ringkasan Eksekutif Risiko (Tabel Risiko: Klausul Asli | Potensi Bahaya | Tingkat Risiko), Rekomendasi Redline Klausul (Bahasa Hukum yang Disarankan), dan Posisi Tawar Negosiasi untuk Tim Bisnis."
    },
    constraints: [
      "Gunakan bahasa hukum yang baku dan tidak meninggalkan celah tafsir ganda",
      "Sertakan disclaimer bahwa review ini merupakan bantuan analisis dan tetap memerlukan otorisasi advokat resmi yurisdiksi setempat"
    ],
    variables: [
      { name: "contract_type", default: "Master Service Agreement (MSA) & Software Licensing" }
    ]
  },
  {
    id: "tot_architectural_decision",
    title: "Pohon Keputusan Arsitektur: Monolit vs Microservices vs Serverless",
    category: "tech_software",
    expertId: "senior_architect",
    frameworkId: "tot",
    badge: "Tree-of-Thought",
    data: {
      scenario: "Startup kami sedang merancang ulang platform e-commerce yang melayani 200.000 pengguna aktif harian dengan peak load flash sale mencapai 10.000 transaksi/detik. Tim engineering terdiri dari 12 software engineers.",
      criteria: "1. Biaya infrastruktur cloud bulanan, 2. Kecepatan time-to-market fitur baru, 3. Kompleksitas operasional & debugging, 4. Ketahanan terhadap downtime (fault-tolerance), 5. Kurva pembelajaran tim.",
      target_output: "Analisis Tree-of-Thought komparatif membedah 3 cabang arsitektur (Modular Monolith, Distributed Microservices via Kubernetes, dan Event-Driven Serverless via AWS Lambda/Cloud Run) beserta matriks skor 1-10 dan rekomendasi arsitektur final."
    },
    constraints: [
      "Pertimbangkan batasan ukuran tim kecil (12 developer)",
      "Hindari rekomendasi over-engineering yang menguras biaya di tahap awal"
    ],
    variables: []
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PROMPT_TEMPLATES };
}
