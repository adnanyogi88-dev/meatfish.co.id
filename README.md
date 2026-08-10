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
