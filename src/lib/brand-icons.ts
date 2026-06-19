import {
  siBitcoin,
  siGmail,
  siInstagram,
  siLitecoin,
  siOnlyfans,
  siCircle,
  siPolygon,
  siSolana,
  siStripe,
  siTelegram,
  siTether,
  siTiktok,
  siTon,
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
  circle: siCircle,
  polygon: siPolygon,
  solana: siSolana,
  tether: siTether,
  ton: siTon,
} as const satisfies Record<string, SimpleIcon>;

export type BrandIconKey = keyof typeof brandIcons;
