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
    description: "Pastel styling, clean details.",
    size: "wide",
    tone: "blush",
  },
  {
    id: "catboy",
    title: "Catboy",
    category: "signature",
    description: "Cat ears, blush, playful mood.",
    size: "tall",
    tone: "hot",
  },
  {
    id: "outfit",
    title: "Soft outfit",
    category: "lookbook",
    description: "Cream tones, pink accents.",
    size: "square",
    tone: "cream",
  },
  {
    id: "backstage",
    title: "Backstage",
    category: "bts",
    description: "Setup details.",
    size: "square",
    tone: "lilac",
  },
  {
    id: "mirror",
    title: "Mirror shots",
    category: "daily",
    description: "Quick outfit checks.",
    size: "wide",
    tone: "blush",
  },
  {
    id: "chaos",
    title: "Cute chaos",
    category: "playful",
    description: "Hearts, bows, tiny details.",
    size: "square",
    tone: "hot",
  },
];
