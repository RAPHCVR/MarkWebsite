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

export const legalConfig = {
  merchantName: "Raphael Tech Solutions",
  entrepreneurName: "Raphael Chauvier",
  legalForm: "Entrepreneur individuel - Micro-entreprise",
  siren: "105765424",
  siret: "10576542400012",
  apeCode: "6201Z",
  activity:
    "Programmation informatique, developpement de sites web, conseil en systemes informatiques et mise a disposition d'infrastructures logicielles (API, SaaS).",
  vatStatus: "TVA non applicable, article 293 B du Code general des impots",
  registeredAddress: "27 Rue Marcel Miquel, 92130 Issy-les-Moulineaux, France",
  supportContactLabel: "formulaire de contact securise du site",
  privacyContactLabel: "formulaire de contact securise du site",
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
  { label: "Mentions legales", href: "/legal" },
  { label: "CGV", href: "/terms" },
  { label: "Remboursements", href: "/refund-policy" },
  { label: "Confidentialite", href: "/privacy" },
] as const;
