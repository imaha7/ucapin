export type InvitationTemplate = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  price: number;
  accent: string;
};

export const templates: InvitationTemplate[] = [
  {
    id: "savana",
    title: "Savana Senja",
    category: "Rustic",
    description: "Hangat, teduh, dan penuh cerita.",
    image: "photo-1519741497674-611481863552",
    price: 99000,
    accent: "#9d7654",
  },
  {
    id: "seruni",
    title: "Botani Boho",
    category: "Boho",
    description: "Rona hijau lembut dan bunga liar yang hangat.",
    image: "photo-1519225421980-715cb0215aed",
    price: 129000,
    accent: "#718267",
  },
  {
    id: "senandika",
    title: "Senandika",
    category: "Minimalis",
    description: "Sederhana, elegan, selamanya.",
    image: "photo-1511285560929-80b456fea0bc",
    price: 99000,
    accent: "#b59678",
  },
  {
    id: "aksara",
    title: "Aksara Jawa",
    category: "Tradisional",
    description: "Merayakan cinta dan akar budaya.",
    image: "photo-1464366400600-7168b8af9bc3",
    price: 149000,
    accent: "#9c624e",
  },
  {
    id: "purnama",
    title: "Purnama",
    category: "Modern",
    description: "Nuansa modern dengan rona lembut.",
    image: "photo-1465495976277-4387d4b0e4a6",
    price: 129000,
    accent: "#60786c",
  },
  {
    id: "arca",
    title: "Arca Putih",
    category: "Minimalis",
    description: "Ruang yang lapang untuk kisah kalian.",
    image: "photo-1511795409834-ef04bbd61622",
    price: 99000,
    accent: "#9a8974",
  },
];

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
