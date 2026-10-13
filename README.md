# meatfish.co.id

Website statis Meat & Fish yang dibangun dengan Astro.

## Menjalankan secara lokal

```bash
npm install
npm run prepare
npm run dev
```

## Build produksi

```bash
npm run build
```

Data URL bersumber dari `data sitemaps meatfish.xlsx`, sedangkan artikel sumber
berada di `indofishmart_top_40_markdown.zip`. Perintah `npm run prepare`
menghasilkan route dan konten siap-build dari kedua sumber tersebut.

## Publikasi dan pemeriksaan SEO

- `pubDate` atau `date` menentukan waktu terbit. Tanggal tanpa jam memakai WIB.
- Artikel draft, dinonaktifkan, bertanggal tidak valid, atau terjadwal di masa depan tidak diterbitkan.
- Konten Markdown yang sudah diedit dipertahankan saat import diulang.
- Sitemap hanya memuat artikel yang sudah terbit, halaman bisnis, dan arsip berisi konten. Halaman lama tanpa isi tetap dapat diakses, dengan `noindex, follow`, sampai sumber teks tersedia.
- Daftar panduan dan arsip memakai 12 artikel per halaman.

Sesudah build, jalankan `npm run check:seo` untuk memeriksa tanggal, canonical, sitemap, H1, dan tautan internal.

## Analytics

Atur `PUBLIC_GTM_ID` atau `PUBLIC_GA4_ID` saat build menggunakan ID properti yang benar. Jika keduanya disediakan, GTM digunakan untuk menghindari pemasangan ganda. Tanpa ID, tracker tidak dimuat.

Event yang disiapkan adalah `whatsapp_click` dan `catalog_click`, dengan asal halaman dan tujuan CTA. Klik WhatsApp adalah interaksi, bukan bukti lead atau transaksi. Untuk GTM, hubungkan custom event tersebut ke tag GA4 pada container yang sesuai.

Rincian paket, biaya, nomor WhatsApp khusus layanan, identitas perusahaan, dan foto operasional perlu diisi berdasarkan data resmi pemilik bisnis.
