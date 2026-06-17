import {
  siBitcoin,
  siGmail,
  siInstagram,
  siLitecoin,
  siOnlyfans,
  siStripe,
  siTelegram,
  siTiktok,
  siX,
  type SimpleIcon,
} from "simple-icons";

export const brandIcons = {
  instagram: siInstagram,
  tiktok: siTiktok,
  telegram: siTelegram,
  x: siX,
  gmail: siGmail,
  onlyfans: siOnlyfans,
  stripe: siStripe,
  bitcoin: siBitcoin,
  litecoin: siLitecoin,
} as const satisfies Record<string, SimpleIcon>;

export type BrandIconKey = keyof typeof brandIcons;
