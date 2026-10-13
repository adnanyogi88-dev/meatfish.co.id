# Meatfish.co.id — penyelesaian pemulihan SEO, 13 Oktober 2026

Halaman kosong berasal dari URL Meatfish.id yang ikut terbawa ke situs co.id. Inventaris WordPress terautentikasi menunjukkan 853 artikel berstatus publish. Sebanyak 670 URL kosong co.id cocok persis dengan slug artikel terbit tersebut; isi artikel tidak disalin kembali ke co.id.

## Perubahan

- 670 URL artikel lama mengarah ke artikel asal dengan slug sama di Meatfish.id.
- Arsip penulis lama mengarah ke daftar panduan co.id; alamat sitemap HTML lama mengarah ke peta situs baru. Total 672 pengalihan.
- Pengalihan menggunakan meta refresh 0 detik, canonical ke halaman tujuan, tautan cadangan, dan pengecualian dari sitemap. GitHub Pages tetap memberi respons HTTP 200 untuk berkas pengalihan; ini bukan redirect HTTP 301. Google mendokumentasikan meta refresh instan sebagai pengalihan permanen: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Tautan Markdown yang menunjuk URL lama tersebut langsung menggunakan halaman tujuan, menghindari halaman kosong dan satu tahap pengalihan.
- Peta situs HTML berisi layanan, kategori aktif, dan seluruh panduan yang telah terbit. Halaman 404 menyediakan jalur ke beranda dan panduan.
- Halaman kemitraan memiliki perbandingan Minimarket, Medium, dan Premium dengan acuan dukungan produk serta jarak antartoko. Harga investasi dan ketentuan akhir tetap melalui penawaran tim.
- Tombol kemitraan, tiga paket, dan tiga kategori pemasok memakai tujuan kontak yang dipublikasikan pada halaman resmi brand.
- Tautan wa.link mempertahankan pesan bawaan layanan. Parameter text tambahan tidak lagi ditempelkan karena tidak didukung wa.link. Event whatsapp_click dan catalog_click tetap menyediakan path halaman, judul, tujuan CTA, dan label tombol.

## Sumber

- Ekspor Meatfish WordPress 29 Juni 2026: 816 post dan 9 page; konten halaman perusahaan/kemitraan kosong dalam ekspor. Ekspor 2 Juli 2026 hanya berisi 966 attachment.
- Inventaris live WordPress 13 Oktober 2026: hanya slug artikel berstatus publish yang dipakai sebagai tujuan artikel lama.
- Kontak dan acuan paket: https://meatfish.id/gabung-kemitraan/
- Kontak kategori pemasok: https://meatfish.id/daftar-supplier-meatfish/

## Validasi

- Build produksi berhasil; 1.649 berkas index.html dan halaman 404 dihasilkan.
- Pemeriksaan SEO berhasil: 315 URL sitemap, 14 elemen gambar homepage, tidak ada Invalid Date, H1 ganda, URL sitemap yang noindex, tautan internal yang tidak tersedia, atau tautan dari halaman sitemap menuju halaman noindex.
- Seluruh 672 pengalihan diperiksa untuk target host, canonical, noindex, meta refresh, tautan cadangan, dan pengecualian dari sitemap.
- Tujuh tujuan kontak khusus diperiksa pada HTML hasil build.
- Event whatsapp_click dan catalog_click diuji melalui DOM hasil build: masing-masing satu event, tujuan CTA dan path halaman sesuai, serta URL wa.link tetap utuh.
- Sebelas sampel tujuan artikel asal memberi respons HTTP 200. Seluruh 670 tujuan artikel dicocokkan dengan slug berstatus publish pada inventaris WordPress; tidak semuanya dipanggil melalui HTTP satu per satu.
- Pengujian visual browser lokal tidak tersedia karena unduhan browser gagal. Perbandingan tabel dibatasi dalam wadah scroll horizontal untuk viewport kecil; pemeriksaan visual situs live dilakukan sesudah deployment.

## Data yang masih diperlukan

1. Nama badan usaha, alamat perusahaan, harga investasi, MOQ, pembayaran, dan ketentuan retur/pengiriman resmi. Informasi tersebut tidak dibuat dari asumsi.
2. Data sesudah deployment untuk menilai dampak trafik dan interaksi. Data GSC sebelum deployment dipakai sebagai baseline; belum membuktikan peningkatan akibat perubahan hari ini.

## Aktivasi analytics

Pada 13 Oktober 2026, properti Meatfish.co.id dan web stream https://meatfish.co.id dibuat melalui Admin GA4. Zona waktu Jakarta dan mata uang rupiah ditetapkan. Measurement ID G-8VKQ0404HZ diverifikasi dari petunjuk pemasangan stream tersebut.

ID publik disimpan di src/data/analytics.json agar build dapat memuat Google tag tanpa mengharuskan pengisian repository variable. PUBLIC_GA4_ID dapat mengganti ID itu; PUBLIC_GTM_ID tetap diprioritaskan bila diisi untuk menghindari tag ganda. Halaman pengalihan lama tidak memuat tracker sehingga page_view dari pengalihan retail tidak masuk sebagai kunjungan halaman perusahaan.

Google tag mengirim page_view secara otomatis. Klik CTA mengirim whatsapp_click dan catalog_click melalui gtag dengan parameter cta_purpose, source_page_path, source_page_title, dan button_text. Gunakan ?ga_debug=1 untuk pengujian DebugView. Event klik merupakan interaksi CTA, bukan bukti lead atau transaksi selesai. Koneksi pelaporan GA4 melalui Windsor terpisah dari pemasangan tag website.

## Pemulihan

Perubahan disiapkan di branch seo/complete-recovery-20261013 dengan parent e159f34740f176301f1616c33b65535414a2259e. Revert commit merge bila pemulihan diperlukan; riwayat dan backup sebelum tahap pertama tetap tersedia.

## Tindak lanjut dari GSC

- Empat artikel aktif diprioritaskan: penyimpanan lele, udang, ikan, dan supplier frozen food di Bekasi. Slug dan tanggal publikasi asli tetap dipertahankan.
- Judul, deskripsi, jawaban awal, dan tautan menuju katalog serta pasokan B2B diperjelas. Informasi masa simpan mengacu pada FoodSafety.gov dan FDA. Klaim jaminan harga, stok, serta masa simpan produk tanpa dasar dihapus.
- Tanggal pembaruan nyata ditambahkan pada keempat artikel, schema Article, dan sitemap artikel. Tanggal terbit tidak diganti menjadi tanggal pembaruan.
- Data baseline, halaman, query, perangkat, dan sitemap disimpan dalam laporan terpisah. Data analytics privat tidak dimasukkan ke repository publik.
- Sitemap co.id sudah terdaftar di GSC dan diumumkan dalam robots.txt. Status pembacaan Google yang tersedia masih berasal dari sebelum deployment ini. Windsor tidak menyediakan action submit sitemap atau URL Inspection; tindakan tersebut belum dilakukan melalui konektor.
- Measurement ID co.id sudah diverifikasi melalui Admin GA4 dan dikonfigurasi pada website. Penerimaan data produksi diperiksa setelah deployment melalui properti yang sama.

Rujukan isi: https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts dan https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely
