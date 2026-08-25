type BacklinkChoice = {
  pattern: RegExp;
  intro: string;
  meatfishId: { href: string; label: string };
  meatfishCoId: { href: string; label: string };
};

const choices: BacklinkChoice[] = [
  {
    pattern: /franchise|waralaba|kemitraan/,
    intro: "Untuk membandingkan potensi pasar dan dukungan kemitraan, pelajari juga",
    meatfishId: {
      href: "https://meatfish.id/prospek-bisnis-frozen-food-2026-resmi-dibuka-peluang-besar-bersama-meatfish-di-era-konsumsi-modern/",
      label: "prospek bisnis frozen food Meat & Fish",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/franchise-meat-shop/",
      label: "panduan Franchise Meat Shop",
    },
  },
  {
    pattern: /seafood|udang|cumi|kerang|kepiting|lobster|tiram/,
    intro: "Untuk melengkapi pembahasan seafood dan cara memilih bahan yang baik, baca",
    meatfishId: {
      href: "https://meatfish.id/supplier-frozen-food-berkualitas-solusi-modern-bersama-meatfish/",
      label: "panduan supplier frozen food berkualitas",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/seafood-jenis-manfaat-cara-memilih/",
      label: "panduan memilih seafood berkualitas",
    },
  },
  {
    pattern: /ikan|salmon|dori|lele|kakap|tuna|gurame|bandeng|patin|nila|kerapu/,
    intro: "Sebagai referensi saat memilih ikan dan produk beku, lanjutkan ke",
    meatfishId: {
      href: "https://meatfish.id/daftar-harga-ikan-frozen-terlengkap-2025-panduan-belanja-cerdas-bersama-meatfish/",
      label: "panduan belanja ikan frozen Meat & Fish",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/ikan-frozen-berkualitas-ciri-dan-cara-memilih/",
      label: "ciri ikan frozen berkualitas",
    },
  },
  {
    pattern: /ayam|chicken|ceker/,
    intro: "Untuk referensi bahan ayam dan pengolahan yang lebih praktis, baca",
    meatfishId: {
      href: "https://meatfish.id/cara-membuat-daging-giling-ayam-panduan-lengkap-praktis-dan-higienis/",
      label: "panduan mengolah daging ayam",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/daging-ayam-frozen-panduan-memilih-dan-mengolah/",
      label: "panduan daging ayam frozen",
    },
  },
  {
    pattern: /daging|meat|beef|steak|sapi|kambing|rendang|iga/,
    intro: "Untuk memilih pasokan daging yang sesuai bagi dapur maupun usaha, baca",
    meatfishId: {
      href: "https://meatfish.id/suplier-daging-frozen-untuk-usaha-kuliner-panduan-lengkap-agar-bisnis-semakin-efisien-dan-menguntungkan/",
      label: "panduan supplier daging frozen",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/frozen-meat-jenis-kegunaan-dan-cara-memilih/",
      label: "panduan memilih frozen meat",
    },
  },
  {
    pattern: /supplier|distributor|grosir|agen|reseller|pemasok|bisnis|usaha|restoran|rumah makan|kafe|cafe|hotel|katering|catering/,
    intro: "Untuk menilai pasokan dan peluang usaha kuliner secara lebih lengkap, baca",
    meatfishId: {
      href: "https://meatfish.id/supplier-frozen-food-untuk-warung-makan-solusi-praktis-untung-besar/",
      label: "solusi supplier untuk usaha kuliner",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/peluang-bisnis-frozen-food-dari-rumah/",
      label: "peluang bisnis frozen food dari rumah",
    },
  },
  {
    pattern: /gizi|nutrisi|protein|sehat|kesehatan|anak|keluarga|bekal|sarapan/,
    intro: "Untuk pilihan menu praktis yang tetap memperhatikan kebutuhan keluarga, baca",
    meatfishId: {
      href: "https://meatfish.id/frozen-ikan-untuk-sahur-praktis-sehat-dan-tetap-nikmat-bareng-meatfish/",
      label: "referensi menu ikan frozen praktis",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/ide-menu-frozen-food-praktis-untuk-keluarga/",
      label: "ide menu frozen food untuk keluarga",
    },
  },
  {
    pattern: /frozen|beku|freezer|nugget|bakso|sosis|resep|masak|kuliner|makanan|menu/,
    intro: "Untuk menambah referensi bahan dan pengolahan produk beku, baca",
    meatfishId: {
      href: "https://meatfish.id/supplier-frozen-food-berkualitas-solusi-modern-bersama-meatfish/",
      label: "panduan supplier frozen food berkualitas",
    },
    meatfishCoId: {
      href: "https://meatfish.co.id/panduan-memilih-frozen-food-berkualitas/",
      label: "panduan memilih frozen food berkualitas",
    },
  },
];

const fallback = choices.at(-1)!;
const coIdAlternatives = [
  {
    href: "https://meatfish.co.id/panduan-memilih-frozen-food-berkualitas/",
    label: "panduan memilih frozen food berkualitas",
  },
  {
    href: "https://meatfish.co.id/panduan-memilih-supplier-frozen-food/",
    label: "panduan memilih supplier frozen food",
  },
  {
    href: "https://meatfish.co.id/peluang-bisnis-frozen-food-dari-rumah/",
    label: "peluang bisnis frozen food dari rumah",
  },
];

export function getContextualBacklinks(subject: string, currentSlug: string) {
  const normalizedSubject = subject.toLowerCase();
  const choice = choices.find(({ pattern }) => pattern.test(normalizedSubject)) ?? fallback;
  const currentUrl = `https://meatfish.co.id/${currentSlug}/`;
  const meatfishCoId = [choice.meatfishCoId, ...coIdAlternatives].find(
    ({ href }) => href !== currentUrl,
  )!;

  return {
    intro: choice.intro,
    meatfishId: choice.meatfishId,
    meatfishCoId,
  };
}
