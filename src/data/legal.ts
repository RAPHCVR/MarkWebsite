const rawContactPhoneLabel = process.env.LEGAL_CONTACT_PHONE?.trim() || "";

function phoneHrefFromLabel(label: string) {
  const compact = label.replace(/[^\d+]/g, "");

  if (compact.startsWith("+")) {
    return compact;
  }

  if (compact.startsWith("00")) {
    return `+${compact.slice(2)}`;
  }

  if (compact.startsWith("0")) {
    return `+33${compact.slice(1)}`;
  }

  return compact;
}

function phoneDisplayFromHref(href: string) {
  if (!href) {
    return "";
  }

  if (href.startsWith("+33") && href.length === 12) {
    return `+33 ${href.slice(3, 4)} ${href.slice(4, 6)} ${href.slice(6, 8)} ${href.slice(8, 10)} ${href.slice(10, 12)}`;
  }

  return href.replace(/(\+\d{1,3})(\d+)/, (_match, country: string, rest: string) =>
    `${country} ${rest.replace(/(\d{2})(?=\d)/g, "$1 ").trim()}`,
  );
}

const contactPhoneHref = phoneHrefFromLabel(rawContactPhoneLabel);
const contactPhoneLabel = phoneDisplayFromHref(contactPhoneHref);

export const legalConfig = {
  merchantName: "Raphael Tech Solutions",
  entrepreneurName: "Raphael Chauvier",
  legalForm: "Entrepreneur individuel - Micro-entreprise",
  siren: "105765424",
  siret: "10576542400012",
  apeCode: "6201Z",
  activity:
    "Programmation informatique, développement de sites web et conseil en systèmes informatiques.",
  vatStatus: "TVA non applicable, article 293 B du Code général des impôts",
  registeredAddress: "27 Rue Marcel Miquel, 92130 Issy-les-Moulineaux, France",
  supportContactLabel: "formulaire de contact du site",
  privacyContactLabel: "formulaire de contact du site",
  supportEmailLocalPart: "support",
  supportEmailDomain: "markshnaknaks.com",
  contactPhoneLabel,
  contactPhoneHref,
  contactPath: "/#contact",
  termsVersion: "2026-06-22",
  privacyVersion: "2026-06-22",
  creatorName: "Marky",
  publicationDirector: "Raphael Chauvier",
  hosting:
    "Hosted by the publisher with Cloudflare security and storage services.",
  commercialVocabulary: [
    "Starter Access",
    "Premium Drop",
    "Backstage Pass",
    "VIP Request Pass",
  ],
  b2cSalesAllowed: true,
} as const;

export const legalLinks = [
  { label: "Mentions légales", href: "/legal" },
  { label: "CGV", href: "/terms" },
  { label: "Remboursements", href: "/refund-policy" },
  { label: "Confidentialité", href: "/privacy" },
] as const;
