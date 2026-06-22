const consumerMediator = {
  name: process.env.CONSUMER_MEDIATOR_NAME?.trim() || "",
  address: process.env.CONSUMER_MEDIATOR_ADDRESS?.trim() || "",
  website: process.env.CONSUMER_MEDIATOR_WEBSITE?.trim() || "",
  referenceListUrl:
    "https://www.economie.gouv.fr/mediation-conso/liste-mediateurs-references",
};

const consumerMediatorConfigured = Boolean(
  consumerMediator.name && consumerMediator.website,
);

const contactPhoneLabel = process.env.LEGAL_CONTACT_PHONE?.trim() || "";

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

export const legalConfig = {
  merchantName: "Raphael Tech Solutions",
  entrepreneurName: "Raphael Chauvier",
  legalForm: "Entrepreneur individuel - Micro-entreprise",
  siren: "105765424",
  siret: "10576542400012",
  apeCode: "6201Z",
  activity:
    "Programmation informatique, développement de sites web, conseil en systèmes informatiques et mise à disposition d'infrastructures logicielles (API, SaaS).",
  vatStatus: "TVA non applicable, article 293 B du Code général des impôts",
  registeredAddress: "27 Rue Marcel Miquel, 92130 Issy-les-Moulineaux, France",
  supportContactLabel: "formulaire de contact securise du site",
  privacyContactLabel: "formulaire de contact securise du site",
  supportEmailLocalPart: "support",
  supportEmailDomain: "markshnaknaks.com",
  supportEmailRouting:
    "Cloudflare Email Routing catch-all forwards domain mail to the verified Marky inbox.",
  contactPhoneLabel,
  contactPhoneHref: phoneHrefFromLabel(contactPhoneLabel),
  contactPath: "/#contact",
  termsVersion: "2026-06-21",
  privacyVersion: "2026-06-21",
  merchantRole:
    "Raphael Tech Solutions acts as the technical platform operator and Merchant of Record for Marky digital access services.",
  creatorName: "Marky",
  publicationDirector: "Raphael Chauvier",
  hosting:
    "Application self-hosted on the publisher's Kubernetes infrastructure; Cloudflare provides DNS, proxy/security and private R2 object storage.",
  commercialVocabulary: [
    "Digital Access Pass",
    "Premium Platform Membership",
    "Content Delivery Token",
    "VIP Infrastructure Access",
  ],
  consumerMediator,
  consumerMediatorConfigured,
  b2cSalesAllowed: true,
} as const;

export const legalLinks = [
  { label: "Mentions légales", href: "/legal" },
  { label: "CGV", href: "/terms" },
  { label: "Remboursements", href: "/refund-policy" },
  { label: "Confidentialité", href: "/privacy" },
] as const;
