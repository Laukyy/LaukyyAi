# Lauky AI

AI assistant pribadi — cerdas, tegas, dan sedikit galak. Dibangun pakai
Next.js 14 (App Router) + TypeScript + Tailwind + Anthropic API.

## Struktur Project

```
lauky-ai/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Backend API, panggil Anthropic, streaming response
│   ├── globals.css           # Style global + styling markdown
│   ├── layout.tsx            # Root layout (dark mode default)
│   └── page.tsx              # Halaman utama chat (state, fetch, localStorage)
├── components/
│   ├── ChatInput.tsx         # Kolom input + tombol kirim
│   ├── ChatMessage.tsx       # Bubble chat + render markdown
│   ├── CodeBlock.tsx         # Code block dengan syntax highlight + tombol copy
│   └── Sidebar.tsx           # Riwayat percakapan + tombol percakapan baru
├── lib/
│   └── systemPrompt.ts       # Persona/system prompt Lauky AI (edit di sini)
├── .env.example               # Template environment variable
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

**Kenapa strukturnya begini?**
- `lib/systemPrompt.ts` dipisah supaya lu bisa ubah karakter Lauky tanpa
  bongkar logic backend.
- `app/api/chat/route.ts` adalah satu-satunya tempat yang tahu API key.
  Browser (frontend) TIDAK PERNAH lihat API key — dia cuma `fetch("/api/chat")`.
- Model AI diambil dari `process.env.LAUKY_MODEL`, jadi kalau nanti mau ganti
  model atau provider lain, tinggal ubah `.env` + sedikit kode di
  `route.ts`, tidak perlu ubah UI.

## 1. Install Dependency

Pastikan sudah install Node.js versi 18 ke atas. Cek dulu:

```bash
node -v
```

Lalu masuk ke folder project dan install:

```bash
cd lauky-ai
npm install
```

## 2. Bikin File .env

Copy dari template:

```bash
cp .env.example .env
```

Buka file `.env`, isi API key Anthropic kamu:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
LAUKY_MODEL=claude-sonnet-4-5-20250929
```

> Dapetin API key dari https://console.anthropic.com/settings/keys
> File `.env` sudah masuk `.gitignore`, jadi aman, tidak ke-commit ke git.

## 3. Jalankan Secara Lokal

```bash
npm run dev
```

Buka browser ke `http://localhost:3000`. Lauky AI siap dipakai.

## 4. Build untuk Production

```bash
npm run build
npm run start
```

Ini akan build versi optimized dan jalanin di port 3000 (atau port yang
di-set lewat env `PORT`).

## 5. Deploy

Paling gampang pakai **Vercel** (pembuat Next.js):

1. Push project ini ke GitHub.
2. Buka https://vercel.com, import repo GitHub kamu.
3. Di bagian "Environment Variables", tambahin:
   - `ANTHROPIC_API_KEY` = API key kamu
   - `LAUKY_MODEL` = `claude-sonnet-4-5-20250929`
4. Klik Deploy. Selesai — API key tetap aman di server Vercel, tidak
   pernah kekirim ke browser user.

Alternatif lain: Railway, Render, atau VPS sendiri (pakai `npm run build`
lalu `npm run start`, taruh env var di sistem/panel hosting).

## Cara Kerja Singkat

1. User ngetik pesan di `ChatInput` → dikirim ke state di `page.tsx`.
2. `page.tsx` fetch ke `/api/chat` (POST) dengan seluruh riwayat pesan.
3. `route.ts` di server manggil Anthropic API pakai API key yang aman,
   sistem prompt dari `lib/systemPrompt.ts` ikut dikirim supaya AI
   berperan sebagai Lauky.
4. Jawaban di-stream balik ke frontend potong-potong (efek ngetik),
   dirender pakai `react-markdown` di `ChatMessage.tsx`.
5. Kalau ada code block, otomatis di-highlight dan dikasih tombol copy
   lewat `CodeBlock.tsx`.
6. Semua percakapan disimpan di `localStorage` browser (bukan database),
   jadi riwayat tetap ada walau refresh — tapi khusus di browser itu saja.

## Fitur yang Sudah Ada (MVP)

- ✅ Chat UI modern, responsive (HP & desktop)
- ✅ Dark mode
- ✅ Streaming response
- ✅ Markdown rendering + code block rapi + tombol copy
- ✅ Riwayat percakapan (localStorage) + tombol percakapan baru + hapus
- ✅ Loading indicator ("Lauky lagi mikir")
- ✅ Error handling di frontend & backend
- ✅ API key aman di server (tidak pernah ke frontend)
- ✅ System prompt modular, gampang diedit

## Ide Pengembangan Selanjutnya

Setelah MVP ini jalan lancar, beberapa hal yang bisa ditambahin:

- **Autentikasi user** (NextAuth/Clerk) supaya tiap orang punya riwayat sendiri di server, bukan cuma localStorage.
- **Database** (PostgreSQL/Supabase) untuk simpan riwayat percakapan permanen lintas device.
- **Upload file/gambar** ke chat (Anthropic API sudah support image & PDF).
- **Web search / tools** supaya Lauky bisa jawab pertanyaan info terkini.
- **Rate limiting** per user biar API key tidak jebol dipakai orang iseng.
- **Voice input/output**.
- **Multi-model switcher** di UI (misal pilih Sonnet vs Haiku dari dropdown).
- **Export percakapan** ke Markdown/PDF.
- **PWA** biar bisa "install" kayak aplikasi native di HP.

Kalau mau, gua bisa lanjutin bikin salah satu dari fitur di atas — tinggal bilang mau yang mana duluan.
