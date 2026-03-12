# JustMarkdown 🖋️🚀

**JustMarkdown** adalah editor Markdown tingkat lanjut yang modern, estetik, dan berfokus pada produktivitas. Dirancang dengan desain minimalis menggunakan palet warna **Nord**, aplikasi ini memberikan pengalaman menulis yang tenang namun tetap bertenaga secara fitur.

![JustMarkdown Preview](/src/assets/logo.svg)

## ✨ Fitur Utama

- **Real-time Preview:** Lihat perubahan dokumen Anda secara instan saat mengetik.
- **Advanced Markdown Engine:** Mendukung standar GFM, Admonitions, Task Lists, Footnotes, Emojis, dan banyak lagi menggunakan `markdown-it`.
- **Diagram & Math:**
  - **Mermaid.js:** Buat flowchart, diagram sekuen, dan gantt chart langsung di dalam markdown.
  - **KaTeX:** Dukungan rumus matematika dan formula ilmiah yang cepat dan tajam.
- **Syntax Highlighting:** Pewarnaan kode profesional untuk berbagai bahasa pemrograman menggunakan **PrismJS**.
- **Mode Fokus (Zen Mode):** Hilangkan semua gangguan visual dan fokuslah pada tulisan Anda.
- **Personalisasi Tampilan:**
  - **Modular Spacing:** Atur kerapatan konten (Tight, Normal, Loose) tanpa merusak rendering diagram.
  - **Dynamic Themes:** Pilih antara tema **Nord Dark**, **Retro/Sepia**, atau **High Contrast**.
  - **Resizable Editor:** Sesuaikan lebar panel editor dan preview sesuai keinginan.
- **Ekspor & Sinkronisasi:**
  - Salin hasil render ke HTML atau unduh sebagai file `.md` / `.html`.
  - **Auto-save:** Draft tulisan dan preferensi tampilan Anda tersimpan secara otomatis di Local Storage browser.
- **Visual Kbd:** Shortcut keyboard yang terlihat premium menggunakan elemen `<kbd>`.

## 🛠️ Tech Stack

- **Core:** [Preact](https://preactjs.com/) (Fast & Lightweight React alternative)
- **Editor:** [CodeMirror 6](https://codemirror.net/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Markdown Parser:** [markdown-it](https://github.com/markdown-it/markdown-it) + Ecosystem
- **Diagrams:** [Mermaid.js](https://mermaid-js.github.io/mermaid/)
- **Math:** [KaTeX](https://katex.org/)
- **Security:** [DOMPurify](https://github.com/cure53/dompurify)

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repositori:**

   ```bash
   git clone https://github.com/hnderwn/just-markdown.git
   cd just-markdown
   ```

2. **Instal dependensi:**

   ```bash
   npm install
   ```

3. **Jalankan server pengembangan:**

   ```bash
   npm run dev
   ```

4. **Build untuk produksi:**
   ```bash
   npm run build
   ```

## 🧩 Struktur Proyek Modular

JustMarkdown dibangun dengan arsitektur komponen yang bersih:

- `src/components/Header.jsx`: Navigasi dan kontrol toolbar.
- `src/components/Editor.jsx`: Editor CodeMirror kustom.
- `src/components/Preview.jsx`: Container render markdown & diagram.
- `src/components/Footer.jsx`: Statistik dokumen dan info versi.
- `src/utils/markdownParser.js`: Pusat konfigurasi `markdown-it` dan plugin.

---

Dibuat dengan ❤️ untuk para penulis, pengembang, dan pencatat teknis.
