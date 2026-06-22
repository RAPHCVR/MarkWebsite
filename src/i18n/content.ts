import { galleryItems, type GalleryItem } from "@/data/gallery";
import { products, type Product } from "@/data/products";
import { socials, type SocialLink } from "@/data/socials";
import type { Dictionary } from "@/i18n/dictionaries";

export function getLocalizedProducts(dictionary: Dictionary): Product[] {
  return products.map((product) => {
    const productText =
      dictionary.products.items[product.slug as keyof typeof dictionary.products.items];

    return {
      ...product,
      ...productText,
      features: [...productText.features],
    };
  });
}

export function getLocalizedSocials(dictionary: Dictionary): SocialLink[] {
  return socials.map((social) => ({
    ...social,
    ...dictionary.socials.items[social.id],
  }));
}

export function getLocalizedGallery(dictionary: Dictionary): GalleryItem[] {
  return galleryItems.map((item) => ({
    ...item,
    ...dictionary.lookbook.items[item.id],
  }));
}
