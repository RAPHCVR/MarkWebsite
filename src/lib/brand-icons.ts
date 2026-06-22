import {
  siBitcoin,
  siInstagram,
  siLitecoin,
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
  stripe: siStripe,
  bitcoin: siBitcoin,
  litecoin: siLitecoin,
  circle: siCircle,
  polygon: siPolygon,
  solana: siSolana,
  tether: siTether,
  ton: siTon,
} as const satisfies Record<string, SimpleIcon>;

export type BrandIconKey = keyof typeof brandIcons | "mail";
