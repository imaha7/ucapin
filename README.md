# Ucapin

Platform undangan digital dengan template responsif, editor live preview, RSVP, dan API NestJS berbasis Prisma.

## Menjalankan aplikasi

1. Pastikan PostgreSQL pada `DATABASE_URL` aktif. File `apps/api/.env` berisi konfigurasi server dan tidak boleh dimasukkan ke Git.
2. Salin `apps/web/.env.local.example` menjadi `apps/web/.env.local`.
3. Jalankan `npm install`, `npm run db:generate`, `npm run db:migrate`, lalu `npm run db:seed`.
4. Jalankan `npm run dev` untuk web di `http://localhost:3000` dan API di `http://localhost:4000`.

Seed mengisi katalog template dan aturan harga. Akun admin opsional dibuat hanya jika `ADMIN_EMAIL` serta `ADMIN_PASSWORD` (minimal 10 karakter) diatur sebelum seed; jangan gunakan kredensial contoh pada produksi.

## Deploy ke Vercel

- Atur `DATABASE_URL` di Environment Variables untuk API dan jalankan build tanpa migrasi database. `postinstall` dan build API menjalankan Prisma Client generation dari workspace API. Root `package.json` mengizinkan lifecycle script hanya untuk versi Prisma yang terkunci di lockfile.
- Terapkan migrasi produksi secara terpisah dengan `npm run db:deploy` setelah `DATABASE_URL` tersedia. Perintah ini menggunakan `prisma migrate deploy`; jangan gunakan `db:migrate` (`migrate dev`) pada deployment.
- Jika Vercel membuat proyek terpisah untuk web dan API, pastikan proyek API membangun workspace `@ucapin/api` dan tetap menjalankan `postinstall` root agar client Prisma dihasilkan dari `apps/api/prisma/schema.prisma`.

## Login, publikasi, dan pembayaran

- Daftar/masuk melalui `/login`; undangan yang disimpan setelah masuk muncul di `/dashboard`.
- Draft dapat memakai pratinjau privat. Pembayaran QRIS/transfer membuka checkout Midtrans Snap.
- Publikasi berbayar hanya diaktifkan oleh notifikasi Midtrans dengan signature yang valid. URL tamu memakai `https://domain-kamu/<slug>`; RSVP tersimpan pada API.
- Atur `MIDTRANS_SERVER_KEY` dan biarkan `MIDTRANS_IS_PRODUCTION=false` untuk sandbox. Untuk uji lokal, expose API melalui HTTPS tunnel dan daftarkan URL notifikasi Midtrans sebagai `https://alamat-api-publik/api/payments/webhook`. Jangan pernah memasukkan Server Key ke frontend atau repository.
- Sebelum produksi, ganti `JWT_SECRET` dengan nilai acak minimal 32 karakter, set `WEB_ORIGIN` ke domain frontend, gunakan Server Key produksi, dan gunakan HTTPS.

## Stack

- Web: Next.js App Router, TypeScript, HeroUI (penerus NextUI), Tailwind CSS.
- API: NestJS, Prisma ORM, PostgreSQL.

## API inti

Semua endpoint memakai prefix `/api`:

- `POST /auth/register`, `POST /auth/login`
- `GET /templates`, `GET /templates/:slug`
- `GET /invitations/slug/:slug/availability`
- `POST /invitations`, `GET /invitations/mine`, `GET /invitations/:id`, `PATCH /invitations/:id`, `DELETE /invitations/:id`, `POST /invitations/:id/publish` (Bearer token)
- `GET /invitations/public/:slug`, `POST /invitations/public/:slug/rsvp`
- `POST /payments/:invitationId/checkout`, `GET /payments/:invitationId/status` (Bearer token), `POST /payments/webhook` (signature-verified)
- `POST /pricing/quote`; pengaturan harga dan template hanya untuk role `ADMIN`

Menghapus undangan menonaktifkan slug, menghapus RSVP/ucapan, dan mengarsipkan catatan transaksi. Undangan dengan pembayaran yang masih pending harus menunggu transaksi selesai atau kedaluwarsa sebelum dihapus.
