export type GalleryItem = {
  title: string;
  category: string;
  description: string;
  size: "wide" | "tall" | "square";
  tone: "blush" | "lilac" | "cream" | "hot";
};

export const galleryItems: GalleryItem[] = [
  {
    title: "Cosplay",
    category: "soft set",
    description: "Pastel details, gentle posing and clean previews.",
    size: "wide",
    tone: "blush",
  },
  {
    title: "Catboy",
    category: "signature",
    description: "Cat ears, blush accents and playful details.",
    size: "tall",
    tone: "hot",
  },
  {
    title: "Soft outfit",
    category: "lookbook",
    description: "Creamy textures, blush accents and clean styling.",
    size: "square",
    tone: "cream",
  },
  {
    title: "Backstage",
    category: "bts",
    description: "Quiet prep moments before a drop goes live.",
    size: "square",
    tone: "lilac",
  },
  {
    title: "Mirror shots",
    category: "daily",
    description: "Fast outfit checks with a clean preview finish.",
    size: "wide",
    tone: "blush",
  },
  {
    title: "Cute chaos",
    category: "playful",
    description: "Tiny hearts, sparkles and expressive SFW set ideas.",
    size: "square",
    tone: "hot",
  },
];
