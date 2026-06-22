export type GalleryItem = {
  id: "signature" | "catboy" | "outfit" | "backstage" | "mirror" | "chaos";
  title: string;
  category: string;
  description: string;
  size: "wide" | "tall" | "square";
  tone: "blush" | "lilac" | "cream" | "hot";
};

export const galleryItems: GalleryItem[] = [
  {
    id: "signature",
    title: "Signature look",
    category: "soft set",
    description: "Pastel details, gentle styling and clean previews.",
    size: "wide",
    tone: "blush",
  },
  {
    id: "catboy",
    title: "Catboy",
    category: "signature",
    description: "Cat ears, blush accents and playful details.",
    size: "tall",
    tone: "hot",
  },
  {
    id: "outfit",
    title: "Soft outfit",
    category: "lookbook",
    description: "Creamy textures, blush accents and clean styling.",
    size: "square",
    tone: "cream",
  },
  {
    id: "backstage",
    title: "Backstage",
    category: "bts",
    description: "Quiet prep moments before a drop goes live.",
    size: "square",
    tone: "lilac",
  },
  {
    id: "mirror",
    title: "Mirror shots",
    category: "daily",
    description: "Fast outfit checks with a clean preview finish.",
    size: "wide",
    tone: "blush",
  },
  {
    id: "chaos",
    title: "Cute chaos",
    category: "playful",
    description: "Tiny hearts, sparkles and expressive public ideas.",
    size: "square",
    tone: "hot",
  },
];
