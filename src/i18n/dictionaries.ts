import type { Locale } from "@/i18n/config";

export const dictionaries = {
  en: {
    languageName: "English",
    metadata: {
      title: "Marky - Your Kitten Master",
      description:
        "Marky's public platform for digital access passes, social links, private delivery and collab requests.",
      shortDescription: "Digital access, social links, private delivery and collabs.",
      ogLocale: "en_US",
    },
    nav: {
      home: "Home",
      passes: "Passes",
      socials: "Socials",
      lookbook: "Lookbook",
      collab: "Collab",
      joinVip: "Join VIP",
      vipShort: "VIP",
      language: "Language",
    },
    hero: {
      handleBadge: "Public preview",
      channelBadge: "Private channel planned",
      eyebrow: "Digital access passes",
      titlePrefix: "Your",
      titleHighlight: "Kitten Master",
      subtitle: "Soft drops, secure delivery & cute chaos.",
      viewPasses: "View access passes",
      follow: "Follow Marky",
      publicPreview: "public preview",
      openingSoon: "Access opening soon",
      profilePoints: ["Public creator previews", "Digital access passes", "Business inbox open"],
      productCta: "Preview access",
    },
    socials: {
      eyebrow: "Social hub",
      title: "Follow the cute chaos.",
      description: "Official links for updates, chat, support and business requests.",
      soon: "Soon",
      items: {
        instagram: {
          label: "Instagram",
          description: "Public updates, looks and creator previews.",
          cta: "Open Instagram",
        },
        tiktok: {
          label: "TikTok",
          description: "Short updates, look checks and creator moments.",
          cta: "Watch clips",
        },
        telegramChannel: {
          label: "Telegram Channel",
          description: "Main channel for platform updates and announcements.",
          cta: "Join channel",
        },
        telegramChat: {
          label: "Telegram Chat",
          description: "Chat, support, requests and delivery follow-up.",
          cta: "Open chat",
        },
        x: {
          label: "X / Twitter",
          description: "Quick updates, reposts and launch notes.",
          cta: "Follow on X",
        },
        collabs: {
          label: "Collabs",
          description: "Campaigns, shoots, promos and business requests.",
          cta: "Open form",
        },
        privateChannel: {
          label: "Private Channel",
          description: "Future private channel access linked to site entitlements.",
          cta: "View passes",
        },
      },
    },
    products: {
      eyebrow: "Access preview",
      title: "Digital access passes",
      description: "Private delivery, support follow-up and ticketed VIP requests.",
      badges: ["Access lineup", "Private delivery", "Concierge support"],
      stats: [
        ["4 passes", "First lineup"],
        ["Delivery", "Site token or Telegram follow-up"],
        ["Operator", "Raphael Tech Solutions"],
      ],
      providerLabels: {
        stripe: "access pass",
        crypto: "crypto option",
        telegram: "VIP channel",
        soon: "preview",
      },
      cta: {
        previewSoon: "Preview soon",
        previewAccess: "Preview access",
        stripe: "Get access with Stripe",
        crypto: "Pay with crypto",
        telegram: "Join VIP",
        btcLtc: "Pay with BTC/LTC",
        litecoin: "Pay with Litecoin",
        bitcoin: "Pay with Bitcoin",
        usdc: "Pay with USDC",
        requestPrivatePass: "Request private pass",
      },
      consent:
        "I accept the CGV, immediate digital delivery and loss of withdrawal right once access is issued.",
      termsLabel: "CGV",
      accessPanel: {
        title: "Access",
        body:
          "Start with a digital access pass, then use Telegram for VIP support, ticketed requests and delivery follow-up.",
        rows: [
          ["Delivery", "Private site token or Telegram follow-up."],
          ["Support", "Order help and private request tickets."],
          ["Checkout", "Stripe first; crypto only on verified rails."],
        ],
      },
      cards: {
        stripe: {
          title: "Card checkout",
          live: "Stripe Payment Links are live for card checkout.",
          ready: "Stripe Payment Links are ready for checkout.",
          note: "Secure payment page",
        },
        crypto: {
          title: "Crypto rails",
          body: "USDC uses Solana Pay. BTCPay handles LTC and BTC on verified wallets.",
        },
        telegram: {
          title: "Telegram VIP",
          body: "Announcements, support, private invite links and delivery follow-up.",
          note: "Updates and private invites",
        },
      },
      railStatus: {
        ready: "Ready",
        installed: "Installed",
        planned: "Planned",
        research: "Later",
        disabled: "Off",
      },
      items: {
        "cosplay-starter-pack": {
          title: "Digital Access Pass",
          description: "Personal creator platform access with private site delivery.",
          features: ["Personal access right", "Private delivery token", "Support follow-up"],
        },
        "soft-catboy-drop": {
          title: "Premium Platform Membership",
          description: "Membership-style access, updates and Telegram follow-up.",
          features: ["Premium access", "Telegram concierge", "Platform updates"],
        },
        "behind-the-scenes": {
          title: "Content Delivery Token",
          description: "Time-limited delivery token for the next private release.",
          features: ["Launch date to confirm", "Private delivery", "Site access"],
        },
        "vip-bundle": {
          title: "VIP Infrastructure Access",
          description: "Ticketed private requests handled through Marky Concierge.",
          features: ["VIP access", "Ticketed requests", "Concierge support"],
        },
      },
    },
    lookbook: {
      eyebrow: "Lookbook",
      title: "Soft cosplay universe, public preview.",
      description: "Pastel cosplay, catboy details and backstage previews.",
      mascotEyebrow: "Signature mascot",
      mascotTitle: "Official chibi sketch for Marky's soft mascot.",
      items: {
        signature: {
          title: "Signature look",
          category: "soft set",
          description: "Pastel details, gentle styling and clean previews.",
        },
        catboy: {
          title: "Catboy",
          category: "signature",
          description: "Cat ears, blush accents and playful details.",
        },
        outfit: {
          title: "Soft outfit",
          category: "lookbook",
          description: "Creamy textures, blush accents and clean styling.",
        },
        backstage: {
          title: "Backstage",
          category: "bts",
          description: "Quiet prep moments before a drop goes live.",
        },
        mirror: {
          title: "Mirror shots",
          category: "daily",
          description: "Fast outfit checks with a clean preview finish.",
        },
        chaos: {
          title: "Cute chaos",
          category: "playful",
          description: "Tiny hearts, sparkles and expressive public ideas.",
        },
      },
    },
    contact: {
      eyebrow: "Collabs",
      title: "Collabs & business",
      description: "Campaigns, promos, platform partnerships and creator briefs.",
      cardTitle: "Send the brief.",
      cardBody: "Include the brand, timeline, usage rights and safest reply channel.",
      cardCta: "Open secure form",
      formEyebrow: "Contact form",
      formTitle: "Let's work together",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Reply email",
      emailPlaceholder: "Your reply email",
      brand: "Brand",
      brandPlaceholder: "Brand or agency",
      message: "Message",
      messagePlaceholder: "Tell me about your campaign, partnership or platform idea...",
      submit: "Send request",
      note: "Stored in the site inbox and relayed to the private admin chat when configured. Turnstile filters automated spam when enabled.",
      privacyNote: "Used only to reply to this request and keep a support record. See the privacy policy for details.",
      status: {
        sent: "Request sent. The team will reply through the email you provided.",
        missing: "Add a valid reply email and message, then send again.",
        verify: "Security verification failed. Complete the Turnstile check and send again.",
        limited: "Too many attempts from this connection. Wait a minute, then try again.",
      },
      aria: "Collaboration contact form",
    },
    footer: {
      slogan: "Your Kitten Master",
      preview: "Public preview site. Private channel planned later.",
      copyright: "Copyright 2026 Marky. Merchant of Record: Raphael Tech Solutions.",
      socialNav: "Footer social links",
      legalNav: "Legal links",
    },
    legalNav: {
      legal: "Legal notice",
      terms: "Terms",
      refund: "Refunds",
      privacy: "Privacy",
    },
    legal: {
      back: "Back to site",
      merchantTitle: "Merchant of Record",
      authoritative:
        "Convenience translation. The French version is the authoritative legal version for Raphael Tech Solutions.",
      fields: {
        merchant: "Merchant",
        entrepreneur: "Entrepreneur",
        siren: "SIREN",
        siret: "SIRET",
        ape: "APE",
        vat: "VAT",
        address: "Address",
        hosting: "Hosting",
      },
      contactCard: {
        title: "Legal contact",
        form: "Secure contact form",
        email: "Email",
        revealEmail: "Reveal email",
        phone: "Phone",
        routing: "Email routing",
      },
      contactRouting:
        "Domain email is routed through Cloudflare Email Routing to the verified Marky inbox.",
      pages: {
        legal: {
          eyebrow: "Legal",
          title: "Legal notice",
          description:
            "markshnaknaks.com is operated by Raphael Tech Solutions, technical provider and Merchant of Record for Marky digital services.",
          sections: [
            {
              title: "Publisher",
              body: [
                "Raphael Tech Solutions, trade name of Raphael Chauvier, individual entrepreneur registered under SIREN 105765424.",
                "Business address: 27 Rue Marcel Miquel, 92130 Issy-les-Moulineaux, France.",
                "Declared activity: software programming, website development, IT consulting and software infrastructure services.",
                "Publication director: Raphael Chauvier.",
              ],
            },
            {
              title: "Platform role",
              body: [
                "Raphael Tech Solutions provides software infrastructure, checkout, access rights management, private delivery and technical support.",
                "Marky is the creator presented on the public interface. Web payments are processed by the platform as Merchant of Record.",
              ],
            },
            {
              title: "Contact",
              body: [
                "Support, legal, refund and business requests: secure contact form on the site or the legal email revealed on this page.",
                "Order requests must include the order reference or delivery link without sharing sensitive data in a public group.",
              ],
            },
            {
              title: "Hosting and storage",
              body: [
                "Application self-hosted on the publisher's Kubernetes infrastructure; Cloudflare provides DNS, proxy/security and private R2 object storage.",
                "Private assets are stored in a private Cloudflare R2 bucket and served through short-lived signed URLs after access verification.",
                "Telegram is used as a support and concierge channel. It is not the primary asset store and does not replace website checkout.",
              ],
            },
            {
              title: "Amicable resolution",
              body: [
                "Any complaint must first be sent to support with the order reference and relevant details.",
                "The consumer mediator is not configured at this stage. Official list: https://www.economie.gouv.fr/mediation-conso/liste-mediateurs-references.",
              ],
            },
          ],
        },
        terms: {
          eyebrow: "Terms",
          title: "Terms of sale",
          description:
            "Version 2026-06-21. These terms cover digital access, private delivery and support tickets supplied through markshnaknaks.com.",
          sections: [
            {
              title: "Scope",
              body: [
                "Offers are digital access services: Digital Access Pass, Premium Platform Membership, Content Delivery Token and VIP Infrastructure Access.",
                "Each purchase grants a personal, non-exclusive, non-transferable access right limited to the assets or services attached to the order.",
                "Commercial wording describes digital access and secure delivery, not a transfer of intellectual property rights.",
              ],
            },
            {
              title: "Capacity and permitted use",
              body: [
                "The customer must be legally able to contract and use the service in compliance with applicable law.",
                "Public sharing of delivery links, resale of access, abusive automation or token circumvention may lead to suspension.",
              ],
            },
            {
              title: "Price and payment",
              body: [
                "Prices are shown in euros. VAT not applicable, article 293 B of the French General Tax Code.",
                "Stripe is the main processor for fiat payments. Supported crypto payments may include USDC via Solana Pay and LTC/BTC via BTCPay depending on active rails.",
                "For crypto payments, the platform records the EUR fiat value at transaction time for accounting follow-up.",
              ],
            },
            {
              title: "Digital delivery",
              body: [
                "After payment confirmation, the platform creates an entitlement and generates a private delivery page protected by a time-limited token.",
                "Files are not stored in Git or Telegram. Private assets are served from Cloudflare R2 using signed short-lived URLs.",
              ],
            },
            {
              title: "Immediate performance and withdrawal waiver",
              body: [
                "Before checkout, the customer expressly accepts these terms, requests immediate digital performance and acknowledges losing the withdrawal right once access or a private delivery link is issued.",
              ],
            },
            {
              title: "VIP Infrastructure Access",
              body: [
                "Private requests are handled as tickets through Marky Concierge. They do not give access to the creator's personal account.",
                "Quota, duration and ticket status are tracked by the platform. Abusive, illegal or out-of-scope requests may be refused.",
              ],
            },
            {
              title: "Support",
              body: [
                "Main support: secure contact form on the site or the legal email revealed on the legal notice. Telegram may be used for assistance, private invites and delivery follow-up.",
                "Support may request an order reference, payment email or reasonable proof of delivery-link possession before acting on an access right.",
              ],
            },
            {
              title: "Consumer mediation",
              body: [
                "No consumer mediator is configured at this stage. Official referenced mediators list: https://www.economie.gouv.fr/mediation-conso/liste-mediateurs-references.",
              ],
            },
            {
              title: "Governing law",
              body: [
                "These terms are governed by French law, without depriving consumers of any mandatory protection granted by the law of their country of residence where applicable.",
              ],
            },
          ],
        },
        refund: {
          eyebrow: "Refunds",
          title: "Refund policy",
          description:
            "Digital access is delivered quickly and logged. This policy describes when a refund can be reviewed.",
          sections: [
            {
              title: "Principle",
              body: [
                "Once digital access, a private delivery link or a support ticket is issued, the digital service is considered started at the customer's request.",
                "If the customer accepted immediate performance and withdrawal waiver before payment, refund is not automatic after access issuance.",
              ],
            },
            {
              title: "Eligible cases",
              body: [
                "A refund may be reviewed if a payment was duplicated, access was never issued, a technical error fully blocks delivery, or the order was clearly charged by mistake.",
                "The request must be sent through the contact form with the order reference, payment method and a concise description.",
              ],
            },
            {
              title: "Crypto",
              body: [
                "Accepted crypto refunds may be adjusted for network fees and the EUR fiat value recorded at transaction time.",
                "The platform never asks for seed phrases, private keys or sensitive wallet screenshots.",
              ],
            },
            {
              title: "Contact",
              body: ["Refund support: secure contact form on the site or legal email revealed on the legal notice.", "Target first-response time: 3 to 5 business days."],
            },
          ],
        },
        privacy: {
          eyebrow: "Privacy",
          title: "Privacy policy",
          description:
            "Version 2026-06-21. This policy explains the data processed by Raphael Tech Solutions to operate markshnaknaks.com, deliver digital access and provide support.",
          sections: [
            {
              title: "Controller",
              body: [
                "Raphael Tech Solutions, operated by Raphael Chauvier, acts as controller for checkout, access rights, digital delivery, support and business requests.",
                "Personal data contact: secure contact form on the site.",
              ],
            },
            {
              title: "Collected data",
              body: [
                "Orders: order id, access product, amount, currency, status, payment provider, EUR fiat value at transaction time, terms version and immediate-delivery consent.",
                "Delivery: entitlements, hashed delivery tokens, download events, asset identifiers and technical timestamps.",
                "Support and Telegram: Telegram id, username, chat id, VIP Infrastructure Access ticket messages, support requests and VIP invites when the user links Telegram.",
                "Business contact: name, brand or organization, message, source and technical user-agent.",
              ],
            },
            {
              title: "Purposes",
              body: [
                "Process payments, prevent abuse, deliver digital access, provide support, manage private tickets, satisfy accounting obligations and improve service security.",
                "Data is not sold. Telegram is a support and concierge channel; the site remains the source of truth for access rights.",
              ],
            },
            {
              title: "Legal bases",
              body: [
                "Order, delivery and support processing mainly rely on contract performance and legal accounting obligations.",
                "Security, anti-abuse and fraud-prevention processing rely on the publisher's legitimate interest in protecting the platform and users.",
              ],
            },
            {
              title: "Processors and storage",
              body: [
                "Fiat payments are processed by Stripe. Crypto payments may be processed by BTCPay Server or Solana Pay depending on active rails.",
                "Private assets are stored in Cloudflare R2 and served through short-lived signed URLs. Application data is stored in centralized PostgreSQL on the publisher's infrastructure.",
                "Cloudflare may process technical security logs, proxy events and Turnstile verification data when those protections are active.",
              ],
            },
            {
              title: "Language preference and anti-spam",
              body: [
                "The site may store a strictly functional language preference cookie named marky_locale so users keep their chosen language.",
                "The public contact form uses a honeypot, PostgreSQL-backed rate limiting and, when enabled, Cloudflare Turnstile to reduce automated spam.",
                "The site does not use IP geolocation for advertising profiling. Cloudflare country information is only a fallback for first-visit language routing when no explicit language or browser preference is available.",
              ],
            },
            {
              title: "Retention and rights",
              body: [
                "Order and accounting data is retained for the period required by applicable legal obligations.",
                "Data subjects may request access, rectification, erasure, restriction or objection where those rights apply through the secure contact form.",
                "If difficulties persist, the data subject may contact the competent supervisory authority, including the CNIL in France.",
              ],
            },
          ],
        },
      },
    },
  },
  fr: {
    languageName: "Français",
    metadata: {
      title: "Marky - Your Kitten Master",
      description:
        "Plateforme publique de Marky pour les accès numériques, les liens sociaux, la livraison privée et les demandes pro.",
      shortDescription: "Accès numériques, liens sociaux, livraison privée et collabs.",
      ogLocale: "fr_FR",
    },
    nav: {
      home: "Accueil",
      passes: "Accès",
      socials: "Réseaux",
      lookbook: "Lookbook",
      collab: "Collab",
      joinVip: "Rejoindre VIP",
      vipShort: "VIP",
      language: "Langue",
    },
    hero: {
      handleBadge: "Aperçu public",
      channelBadge: "Canal privé prévu",
      eyebrow: "Passes d'accès numériques",
      titlePrefix: "Your",
      titleHighlight: "Kitten Master",
      subtitle: "Soft drops, livraison sécurisée & cute chaos.",
      viewPasses: "Voir les accès",
      follow: "Suivre Marky",
      publicPreview: "aperçu public",
      openingSoon: "Accès bientôt ouvert",
      profilePoints: ["Previews créateur publiques", "Passes d'accès numériques", "Inbox pro ouverte"],
      productCta: "Voir l'accès",
    },
    socials: {
      eyebrow: "Social hub",
      title: "Suis le cute chaos.",
      description: "Liens officiels pour updates, chat, support et demandes business.",
      soon: "Bientôt",
      items: {
        instagram: { label: "Instagram", description: "Updates publiques, looks et previews créateur.", cta: "Ouvrir Instagram" },
        tiktok: { label: "TikTok", description: "Formats courts, checks de looks et moments créateur.", cta: "Voir les clips" },
        telegramChannel: { label: "Telegram Channel", description: "Canal principal pour updates et annonces plateforme.", cta: "Rejoindre" },
        telegramChat: { label: "Telegram Chat", description: "Chat, support, demandes et suivi de livraison.", cta: "Ouvrir le chat" },
        x: { label: "X / Twitter", description: "Updates rapides, reposts et notes de lancement.", cta: "Suivre sur X" },
        collabs: { label: "Collabs", description: "Campagnes, shootings, promos et demandes pro.", cta: "Ouvrir le formulaire" },
        privateChannel: { label: "Canal privé", description: "Futur accès canal privé lié aux droits du site.", cta: "Voir les accès" },
      },
    },
    products: {
      eyebrow: "Aperçu des accès",
      title: "Passes d'accès numériques",
      description: "Livraison privée, support de suivi et requêtes VIP ticketisées.",
      badges: ["Lineup accès", "Livraison privée", "Support concierge"],
      stats: [["4 passes", "Premier lineup"], ["Livraison", "Token site ou suivi Telegram"], ["Opérateur", "Raphael Tech Solutions"]],
      providerLabels: { stripe: "pass d'accès", crypto: "option crypto", telegram: "canal VIP", soon: "preview" },
      cta: {
        previewSoon: "Preview bientôt",
        previewAccess: "Voir l'accès",
        stripe: "Accès avec Stripe",
        crypto: "Payer en crypto",
        telegram: "Rejoindre VIP",
        btcLtc: "Payer BTC/LTC",
        litecoin: "Payer Litecoin",
        bitcoin: "Payer Bitcoin",
        usdc: "Payer USDC",
        requestPrivatePass: "Demander un pass privé",
      },
      consent:
        "J'accepte les CGV, l'exécution immédiate de la livraison numérique et la perte du droit de rétractation une fois l'accès émis.",
      termsLabel: "CGV",
      accessPanel: {
        title: "Accès",
        body: "Commence par un pass numérique, puis utilise Telegram pour le support VIP, les requêtes ticketisées et le suivi de livraison.",
        rows: [["Livraison", "Token privé site ou suivi Telegram."], ["Support", "Aide commande et tickets de requête privée."], ["Checkout", "Stripe d'abord; crypto uniquement sur rails vérifiés."]],
      },
      cards: {
        stripe: { title: "Paiement carte", live: "Stripe Payment Links est actif pour le paiement carte.", ready: "Stripe Payment Links est prêt pour le paiement.", note: "Page de paiement sécurisée" },
        crypto: { title: "Rails crypto", body: "USDC utilise Solana Pay. BTCPay gère LTC et BTC sur wallets vérifiés." },
        telegram: { title: "Telegram VIP", body: "Annonces, support, liens d'invitation privés et suivi de livraison.", note: "Updates et invitations privées" },
      },
      railStatus: { ready: "Prêt", installed: "Installé", planned: "Prévu", research: "Plus tard", disabled: "Off" },
      items: {
        "cosplay-starter-pack": { title: "Digital Access Pass", description: "Accès personnel à la plateforme avec livraison privée sur le site.", features: ["Droit d'accès personnel", "Token de livraison privé", "Support de suivi"] },
        "soft-catboy-drop": { title: "Premium Platform Membership", description: "Accès type membership, updates et suivi Telegram.", features: ["Accès premium", "Concierge Telegram", "Updates plateforme"] },
        "behind-the-scenes": { title: "Content Delivery Token", description: "Token de livraison limité dans le temps pour la prochaine release privée.", features: ["Date de lancement à confirmer", "Livraison privée", "Accès site"] },
        "vip-bundle": { title: "VIP Infrastructure Access", description: "Requêtes privées ticketisées gérées via Marky Concierge.", features: ["Accès VIP", "Requêtes ticketisées", "Support concierge"] },
      },
    },
    lookbook: {
      eyebrow: "Lookbook",
      title: "Univers soft cosplay, aperçu public.",
      description: "Cosplay pastel, détails catboy et previews backstage.",
      mascotEyebrow: "Mascotte signature",
      mascotTitle: "Sketch chibi officiel pour la mascotte soft de Marky.",
      items: {
        signature: { title: "Signature look", category: "soft set", description: "Détails pastel, styling doux et previews clean." },
        catboy: { title: "Catboy", category: "signature", description: "Oreilles cat, accents blush et détails playful." },
        outfit: { title: "Soft outfit", category: "lookbook", description: "Textures cream, accents blush et styling clean." },
        backstage: { title: "Backstage", category: "bts", description: "Moments calmes de préparation avant une release." },
        mirror: { title: "Mirror shots", category: "daily", description: "Checks de tenue rapides avec finition preview clean." },
        chaos: { title: "Cute chaos", category: "playful", description: "Petits cœurs, sparkles et idées publiques expressives." },
      },
    },
    contact: {
      eyebrow: "Collabs",
      title: "Collabs & business",
      description: "Campagnes, promos, partenariats plateforme et briefs créateur.",
      cardTitle: "Envoie le brief.",
      cardBody: "Ajoute la marque, le timing, les droits d'usage et le canal de réponse le plus sûr.",
      cardCta: "Ouvrir le formulaire sécurisé",
      formEyebrow: "Formulaire contact",
      formTitle: "Travaillons ensemble",
      name: "Nom",
      namePlaceholder: "Ton nom",
      email: "Email de réponse",
      emailPlaceholder: "Ton email de réponse",
      brand: "Marque",
      brandPlaceholder: "Marque ou agence",
      message: "Message",
      messagePlaceholder: "Présente ta campagne, ton partenariat ou ton idée plateforme...",
      submit: "Envoyer la demande",
      note: "Stocké dans l'inbox du site et relayé au chat admin privé quand il est configuré. Turnstile filtre le spam automatisé quand il est actif.",
      privacyNote: "Utilisé uniquement pour répondre à cette demande et conserver une trace support. Détails dans la politique de confidentialité.",
      status: {
        sent: "Demande envoyée. L'équipe répondra via l'email indiqué.",
        missing: "Ajoute un email de réponse valide et un message, puis renvoie la demande.",
        verify: "La vérification de sécurité a échoué. Termine le contrôle Turnstile puis renvoie la demande.",
        limited: "Trop de tentatives depuis cette connexion. Attends une minute, puis réessaie.",
      },
      aria: "Formulaire de contact collaboration",
    },
    footer: {
      slogan: "Your Kitten Master",
      preview: "Site d'aperçu public. Canal privé prévu plus tard.",
      copyright: "Copyright 2026 Marky. Merchant of Record : Raphael Tech Solutions.",
      socialNav: "Liens sociaux footer",
      legalNav: "Liens légaux",
    },
    legalNav: { legal: "Mentions légales", terms: "CGV", refund: "Remboursements", privacy: "Confidentialité" },
    legal: {
      back: "Retour au site",
      merchantTitle: "Merchant of Record",
      authoritative: "Version juridique de référence.",
      fields: { merchant: "Merchant", entrepreneur: "Entrepreneur", siren: "SIREN", siret: "SIRET", ape: "APE", vat: "TVA", address: "Adresse", hosting: "Hébergement" },
      contactCard: {
        title: "Contact légal",
        form: "Formulaire sécurisé",
        email: "Email",
        revealEmail: "Révéler l'email",
        phone: "Téléphone",
        routing: "Routage email",
      },
      contactRouting:
        "Les emails du domaine sont routés par Cloudflare Email Routing vers l'inbox Marky vérifiée.",
      pages: {
        legal: {
          eyebrow: "Legal",
          title: "Mentions légales",
          description:
            "markshnaknaks.com est opéré par Raphael Tech Solutions, prestataire technique et Merchant of Record des services numériques Marky.",
          sections: [
            {
              title: "Éditeur du site",
              body: [
                "Raphael Tech Solutions, nom commercial de Raphael Chauvier, entrepreneur individuel immatriculé sous le SIREN 105765424.",
                "Adresse de l'entreprise: 27 Rue Marcel Miquel, 92130 Issy-les-Moulineaux, France.",
                "Activité déclarée: programmation informatique, développement de sites web, conseil en systèmes informatiques et mise à disposition d'infrastructures logicielles.",
                "Directeur de la publication: Raphael Chauvier.",
              ],
            },
            {
              title: "Rôle de la plateforme",
              body: [
                "Raphael Tech Solutions fournit l'infrastructure logicielle, le checkout, la gestion des droits d'accès, la livraison privée et le support technique.",
                "Marky est le créateur présenté sur l'interface publique. Les paiements web sont traités par la plateforme, qui agit comme Merchant of Record.",
              ],
            },
            {
              title: "Contact",
              body: [
                "Support, demandes légales, remboursements et demandes professionnelles: formulaire de contact sécurisé du site ou email légal révélé sur cette page.",
                "Les demandes liées aux commandes doivent inclure la référence de commande ou le lien de livraison, sans partager de données sensibles dans un groupe public.",
              ],
            },
            {
              title: "Hébergement et stockage",
              body: [
                "Application self-hosted sur l'infrastructure Kubernetes de l'éditeur; Cloudflare fournit DNS, proxy/sécurité et stockage objet privé R2.",
                "Les actifs privés sont stockés dans un bucket Cloudflare R2 privé et servis via des URLs signées de courte durée après vérification du droit d'accès.",
                "Telegram est utilisé comme canal de support et de concierge. Il n'est pas le stockage principal des actifs et ne remplace pas le checkout du site.",
              ],
            },
            {
              title: "Règlement amiable",
              body: [
                "Toute réclamation doit d'abord être adressée au support avec la référence de commande et les éléments utiles à l'analyse.",
                "Médiateur de la consommation non renseigné à ce stade. Liste officielle: https://www.economie.gouv.fr/mediation-conso/liste-mediateurs-references.",
              ],
            },
          ],
        },
        terms: {
          eyebrow: "CGV",
          title: "Conditions générales de vente",
          description:
            "Version 2026-06-21. Ces conditions encadrent les accès numériques, livraisons privées et tickets de support fournis via markshnaknaks.com.",
          sections: [
            { title: "Objet", body: ["Les offres proposées sont des services numériques d'accès: Digital Access Pass, Premium Platform Membership, Content Delivery Token et VIP Infrastructure Access.", "Chaque achat ouvre un droit d'accès personnel, non exclusif, non transférible et limité aux actifs ou services associés à la commande.", "Les libellés commerciaux du site décrivent un accès numérique et une livraison sécurisée, pas une cession de droits de propriété intellectuelle."] },
            { title: "Capacité et usage autorisé", body: ["Le client doit être juridiquement capable de contracter et utiliser le service dans le respect de la loi applicable.", "Le partage public d'un lien de livraison, la revente d'un accès, l'automatisation abusive ou la tentative de contournement des tokens peut entraîner la suspension de l'accès concerné."] },
            { title: "Prix et paiement", body: ["Les prix sont indiqués en euros. TVA non applicable, article 293 B du Code général des impôts.", "Stripe est le processeur principal pour les paiements fiat. Les paiements crypto supportés peuvent inclure USDC via Solana Pay et LTC/BTC via BTCPay, selon les rails actifs au moment de la commande.", "Pour les paiements crypto, la plateforme enregistre la valeur fiat EUR applicable au moment de la transaction afin de permettre le suivi comptable."] },
            { title: "Livraison numérique", body: ["Après confirmation du paiement, la plateforme crée un droit d'accès et génère une page de livraison privée protégée par un token à durée limitée.", "Les fichiers ne sont pas stockés dans Git ni dans Telegram. Les actifs privés sont servis depuis Cloudflare R2 via des URLs signées et limitées dans le temps."] },
            { title: "Exécution immédiate et renonciation au droit de rétractation", body: ["Avant de lancer le checkout, le client accepte expressément les CGV, demande l'exécution immédiate du service numérique et reconnaît perdre son droit de rétractation une fois l'accès numérique ou le lien de livraison privé émis."] },
            { title: "VIP Infrastructure Access", body: ["Les requêtes privées sont gérées sous forme de tickets via Marky Concierge. Elles ne donnent pas accès au compte personnel du créateur.", "Le quota, la durée et le statut du ticket sont suivis par la plateforme. Une demande abusive, illégale, hors périmètre ou incompatible avec les règles de support peut être refusée."] },
            { title: "Support", body: ["Support principal: formulaire de contact sécurisé du site ou email légal révélé dans les mentions légales. Telegram peut être utilisé pour l'assistance, les invitations privées et le suivi de livraison.", "Le support peut demander une référence de commande, un email de paiement ou une preuve raisonnable de possession du lien de livraison avant toute action sur un accès."] },
            { title: "Médiation de la consommation", body: ["Aucun médiateur de la consommation n'est renseigné à ce stade. Liste officielle des médiateurs référencés: https://www.economie.gouv.fr/mediation-conso/liste-mediateurs-references."] },
            { title: "Droit applicable", body: ["Les présentes CGV sont régies par le droit français, sans priver le consommateur des protections impératives éventuellement prévues par la loi de son pays de résidence."] },
          ],
        },
        refund: {
          eyebrow: "Remboursements",
          title: "Politique de remboursement",
          description:
            "Les accès numériques sont livrés rapidement et journalisés. Cette politique précise les cas où un remboursement peut être accepté.",
          sections: [
            { title: "Principe", body: ["Une fois l'accès numérique, le lien de livraison privé ou le ticket de support émis, le service numérique est considéré comme commencé à la demande du client.", "Si le client a accepté l'exécution immédiate et la renonciation au droit de rétractation avant paiement, le remboursement n'est pas automatique après émission de l'accès."] },
            { title: "Cas éligibles", body: ["Un remboursement peut être étudié si le paiement a été doublé, si l'accès n'a jamais été émis, si une erreur technique empêche totalement la livraison, ou si la commande a été manifestement facturée par erreur.", "La demande doit être envoyée via le formulaire de contact avec la référence de commande, le moyen de paiement et une description concise du problème."] },
            { title: "Crypto", body: ["Les remboursements crypto, lorsqu'ils sont acceptés, peuvent être ajustés pour tenir compte des frais réseau et de la valeur fiat EUR journalisée au moment de la transaction.", "La plateforme ne demande jamais de phrase seed, de clé privée ou de capture sensible de wallet."] },
            { title: "Contact", body: ["Support remboursements: formulaire de contact sécurisé du site ou email légal révélé dans les mentions légales.", "Délai cible de première réponse: 3 à 5 jours ouvrés."] },
          ],
        },
        privacy: {
          eyebrow: "Confidentialité",
          title: "Politique de confidentialité",
          description:
            "Version 2026-06-21. Cette politique explique les données traitées par Raphael Tech Solutions pour exploiter markshnaknaks.com, livrer les accès numériques et assurer le support.",
          sections: [
            { title: "Responsable du traitement", body: ["Raphael Tech Solutions, opéré par Raphael Chauvier, agit comme responsable du traitement pour le checkout, les droits d'accès, la livraison numérique, le support et les demandes professionnelles.", "Contact données personnelles: formulaire de contact sécurisé du site."] },
            { title: "Données collectées", body: ["Commandes: identifiant de commande, produit d'accès, montant, devise, statut, fournisseur de paiement, valeur fiat EUR au moment de la transaction, version des CGV et consentement à la livraison immédiate.", "Livraison: droits d'accès, tokens de livraison hachés, événements de téléchargement, identifiants d'actifs et horodatages techniques.", "Support et Telegram: identifiant Telegram, username, chat id, messages de ticket VIP Infrastructure Access, demandes de support et invitations VIP si l'utilisateur choisit de lier Telegram.", "Contact pro: nom, marque ou organisation, message, source et user-agent technique du formulaire."] },
            { title: "Finalités", body: ["Traiter les paiements, prévenir la fraude, livrer les accès numériques, fournir le support, gérer les tickets privés, respecter les obligations comptables et améliorer la sécurité du service.", "Les données ne sont pas vendues. Telegram est un canal de support et de concierge; le site reste la source de vérité des droits d'accès."] },
            { title: "Bases légales", body: ["Les traitements liés aux commandes, à la livraison et au support reposent principalement sur l'exécution du contrat et les obligations légales comptables.", "Les traitements de sécurité, anti-abus et prévention de fraude reposent sur l'intérêt légitime de l'éditeur à protéger la plateforme et ses utilisateurs."] },
            { title: "Sous-traitants et stockage", body: ["Les paiements fiat sont traités par Stripe. Les paiements crypto peuvent être traités par BTCPay Server ou Solana Pay selon les rails actifs.", "Les actifs privés sont stockés dans Cloudflare R2 et servis via des URLs signées de courte durée. Les données applicatives sont stockées dans PostgreSQL centralisé sur l'infrastructure de l'éditeur.", "Cloudflare peut traiter des journaux techniques de sécurité, des événements proxy et les vérifications Turnstile lorsque ces protections sont actives."] },
            { title: "Préférence de langue et anti-spam", body: ["Le site peut enregistrer un cookie strictement fonctionnel de préférence linguistique nommé marky_locale afin de conserver la langue choisie.", "Le formulaire public utilise un honeypot, une limitation de débit appuyée par PostgreSQL et, lorsqu'il est activé, Cloudflare Turnstile pour réduire le spam automatisé.", "Le site n'utilise pas la géolocalisation IP pour du profilage publicitaire. Le pays Cloudflare sert seulement de secours pour choisir la langue à la première visite quand aucune langue explicite ou préférence navigateur n'est disponible."] },
            { title: "Conservation et droits", body: ["Les données de commande et de comptabilité sont conservées pendant la durée requise par les obligations légales applicables.", "Toute personne concernée peut demander l'accès, la rectification, l'effacement, la limitation ou l'opposition lorsque ces droits s'appliquent via le formulaire de contact sécurisé.", "En cas de difficulté persistante, la personne concernée peut contacter l'autorité de contrôle compétente, notamment la CNIL en France."] },
          ],
        },
      },
    },
  },
  ru: {
    languageName: "Русский",
    metadata: {
      title: "Marky - Your Kitten Master",
      description:
        "Публичная платформа Marky для цифровых доступов, соцсетей, приватной доставки и деловых запросов.",
      shortDescription: "Цифровой доступ, соцсети, приватная доставка и коллабы.",
      ogLocale: "ru_RU",
    },
    nav: {
      home: "Главная",
      passes: "Доступы",
      socials: "Соцсети",
      lookbook: "Lookbook",
      collab: "Коллаб",
      joinVip: "Вступить в VIP",
      vipShort: "VIP",
      language: "Язык",
    },
    hero: {
      handleBadge: "Публичный предпросмотр",
      channelBadge: "Приватный канал скоро",
      eyebrow: "Цифровые доступы",
      titlePrefix: "Your",
      titleHighlight: "Kitten Master",
      subtitle: "Мягкие дропы, безопасная доставка и милый хаос.",
      viewPasses: "Смотреть доступы",
      follow: "Подписаться",
      publicPreview: "публичный предпросмотр",
      openingSoon: "Доступ скоро откроется",
      profilePoints: ["Публичные предпросмотры", "Цифровые доступы", "Бизнес-инбокс открыт"],
      productCta: "Смотреть доступ",
    },
    socials: {
      eyebrow: "Social hub",
      title: "Следи за cute chaos.",
      description: "Официальные ссылки для апдейтов, чата, поддержки и деловых запросов.",
      soon: "Скоро",
      items: {
        instagram: { label: "Instagram", description: "Публичные апдейты, образы и предпросмотры.", cta: "Открыть Instagram" },
        tiktok: { label: "TikTok", description: "Короткие клипы, проверки образов и моменты создателя.", cta: "Смотреть клипы" },
        telegramChannel: { label: "Telegram Channel", description: "Главный канал для апдейтов и анонсов платформы.", cta: "Вступить" },
        telegramChat: { label: "Telegram Chat", description: "Чат, поддержка, запросы и сопровождение доставки.", cta: "Открыть чат" },
        x: { label: "X / Twitter", description: "Быстрые апдейты, репосты и заметки о запуске.", cta: "Подписаться в X" },
        collabs: { label: "Collabs", description: "Кампании, съемки, промо и деловые запросы.", cta: "Открыть форму" },
        privateChannel: { label: "Приватный канал", description: "Будущий приватный канал, связанный с доступами сайта.", cta: "Смотреть доступы" },
      },
    },
    products: {
      eyebrow: "Предпросмотр доступа",
      title: "Цифровые доступы",
      description: "Приватная доставка, сопровождение поддержки и VIP-запросы через тикеты.",
      badges: ["Линейка доступов", "Приватная доставка", "Консьерж-поддержка"],
      stats: [["4 доступа", "Первая линейка"], ["Доставка", "Токен сайта или сопровождение Telegram"], ["Оператор", "Raphael Tech Solutions"]],
      providerLabels: { stripe: "access pass", crypto: "крипто-опция", telegram: "VIP-канал", soon: "предпросмотр" },
      cta: {
        previewSoon: "Скоро",
        previewAccess: "Смотреть доступ",
        stripe: "Доступ через Stripe",
        crypto: "Оплатить крипто",
        telegram: "Вступить в VIP",
        btcLtc: "Оплатить BTC/LTC",
        litecoin: "Оплатить Litecoin",
        bitcoin: "Оплатить Bitcoin",
        usdc: "Оплатить USDC",
        requestPrivatePass: "Запросить приватный pass",
      },
      consent:
        "Я принимаю условия, немедленную цифровую доставку и потерю права отказа после выдачи доступа.",
      termsLabel: "Условия",
      accessPanel: {
        title: "Доступ",
        body: "Начни с цифрового доступа, затем используй Telegram для VIP-поддержки, тикет-запросов и сопровождения доставки.",
        rows: [["Доставка", "Приватный токен сайта или сопровождение Telegram."], ["Поддержка", "Помощь по заказу и тикеты приватных запросов."], ["Checkout", "Сначала Stripe; крипто только на проверенных rails."]],
      },
      cards: {
        stripe: { title: "Оплата картой", live: "Stripe Payment Links активен для оплаты картой.", ready: "Stripe Payment Links готов к оплате.", note: "Защищенная страница оплаты" },
        crypto: { title: "Crypto rails", body: "USDC использует Solana Pay. BTCPay обрабатывает LTC и BTC на проверенных wallets." },
        telegram: { title: "Telegram VIP", body: "Анонсы, поддержка, приватные invite links и сопровождение доставки.", note: "Апдейты и приватные invites" },
      },
      railStatus: { ready: "Готово", installed: "Установлено", planned: "План", research: "Позже", disabled: "Off" },
      items: {
        "cosplay-starter-pack": { title: "Digital Access Pass", description: "Персональный доступ к creator platform с приватной доставкой на сайте.", features: ["Персональное право доступа", "Приватный delivery token", "Сопровождение поддержки"] },
        "soft-catboy-drop": { title: "Premium Platform Membership", description: "Доступ по модели membership, обновления и сопровождение Telegram.", features: ["Premium access", "Telegram concierge", "Обновления платформы"] },
        "behind-the-scenes": { title: "Content Delivery Token", description: "Ограниченный по времени delivery token для следующего приватного релиза.", features: ["Дата запуска уточняется", "Приватная доставка", "Доступ на сайте"] },
        "vip-bundle": { title: "VIP Infrastructure Access", description: "Приватные запросы через тикеты в Marky Concierge.", features: ["VIP access", "Тикет-запросы", "Concierge support"] },
      },
    },
    lookbook: {
      eyebrow: "Lookbook",
      title: "Soft cosplay universe, публичный предпросмотр.",
      description: "Пастельный cosplay, catboy-детали и backstage previews.",
      mascotEyebrow: "Фирменный маскот",
      mascotTitle: "Официальный chibi sketch для soft mascot Marky.",
      items: {
        signature: { title: "Signature look", category: "soft set", description: "Пастельные детали, мягкий styling и clean previews." },
        catboy: { title: "Catboy", category: "signature", description: "Cat ears, blush-акценты и playful details." },
        outfit: { title: "Soft outfit", category: "lookbook", description: "Creamy textures, blush-акценты и clean styling." },
        backstage: { title: "Backstage", category: "bts", description: "Спокойные моменты подготовки перед release." },
        mirror: { title: "Mirror shots", category: "daily", description: "Быстрые outfit checks с clean preview finish." },
        chaos: { title: "Cute chaos", category: "playful", description: "Tiny hearts, sparkles и публичные идеи." },
      },
    },
    contact: {
      eyebrow: "Collabs",
      title: "Коллаборации и бизнес",
      description: "Кампании, промо, platform partnerships и creator briefs.",
      cardTitle: "Отправь brief.",
      cardBody: "Добавь бренд, сроки, права использования и самый безопасный канал ответа.",
      cardCta: "Открыть защищенную форму",
      formEyebrow: "Форма связи",
      formTitle: "Давай работать вместе",
      name: "Имя",
      namePlaceholder: "Твое имя",
      email: "Email для ответа",
      emailPlaceholder: "Email для ответа",
      brand: "Бренд",
      brandPlaceholder: "Бренд или агентство",
      message: "Сообщение",
      messagePlaceholder: "Расскажи о кампании, партнерстве или идее платформы...",
      submit: "Отправить запрос",
      note: "Сохраняется в inbox сайта и пересылается в приватный admin chat, если он настроен. Turnstile фильтрует автоматический спам, когда включен.",
      privacyNote: "Используется только для ответа на запрос и хранения записи поддержки. Подробности в privacy policy.",
      status: {
        sent: "Запрос отправлен. Команда ответит на указанный email.",
        missing: "Укажи корректный email для ответа и сообщение, затем отправь снова.",
        verify: "Проверка безопасности не прошла. Заверши Turnstile и отправь снова.",
        limited: "Слишком много попыток с этого подключения. Подожди минуту и попробуй снова.",
      },
      aria: "Форма для деловых запросов",
    },
    footer: {
      slogan: "Your Kitten Master",
      preview: "Публичный preview site. Приватный канал планируется позже.",
      copyright: "Copyright 2026 Marky. Merchant of Record: Raphael Tech Solutions.",
      socialNav: "Социальные ссылки в футере",
      legalNav: "Юридические ссылки",
    },
    legalNav: { legal: "Юридическая информация", terms: "Условия", refund: "Возвраты", privacy: "Конфиденциальность" },
    legal: {
      back: "Назад на сайт",
      merchantTitle: "Merchant of Record",
      authoritative:
        "Перевод для удобства. Французская версия является юридически основной для Raphael Tech Solutions.",
      fields: { merchant: "Merchant", entrepreneur: "Entrepreneur", siren: "SIREN", siret: "SIRET", ape: "APE", vat: "VAT", address: "Адрес", hosting: "Хостинг" },
      contactCard: {
        title: "Юридический контакт",
        form: "Защищенная форма",
        email: "Email",
        revealEmail: "Показать email",
        phone: "Телефон",
        routing: "Email routing",
      },
      contactRouting:
        "Почта домена маршрутизируется через Cloudflare Email Routing в подтвержденный inbox Marky.",
      pages: {
        legal: {
          eyebrow: "Legal",
          title: "Юридическая информация",
          description:
            "markshnaknaks.com управляется Raphael Tech Solutions как технической платформой и Merchant of Record для цифровых сервисов Marky.",
          sections: [
            { title: "Издатель", body: ["Raphael Tech Solutions, торговое наименование Raphael Chauvier, индивидуальный предприниматель, зарегистрированный под SIREN 105765424.", "Адрес: 27 Rue Marcel Miquel, 92130 Issy-les-Moulineaux, France.", "Заявленная деятельность: software programming, website development, IT consulting and software infrastructure services.", "Директор публикации: Raphael Chauvier."] },
            { title: "Роль платформы", body: ["Raphael Tech Solutions предоставляет программную инфраструктуру, checkout, управление правами доступа, приватную доставку и техническую поддержку.", "Marky является создателем, представленным в публичном интерфейсе. Веб-платежи обрабатываются платформой как Merchant of Record."] },
            { title: "Контакт", body: ["Поддержка, юридические запросы, возвраты и деловые запросы: защищенная форма связи на сайте или юридический email, раскрываемый на этой странице.", "Запросы по заказам должны включать ссылку доставки или номер заказа без передачи чувствительных данных в публичной группе."] },
            { title: "Хостинг и хранение", body: ["Приложение self-hosted на Kubernetes-инфраструктуре издателя; Cloudflare предоставляет DNS, proxy/security и приватное объектное хранилище R2.", "Приватные assets хранятся в приватном bucket Cloudflare R2 и выдаются через short-lived signed URLs после проверки доступа.", "Telegram используется как канал поддержки и concierge. Он не является основным хранилищем assets и не заменяет checkout сайта."] },
            { title: "Досудебное урегулирование", body: ["Любая жалоба сначала направляется в поддержку с номером заказа и релевантными деталями.", "Потребительский медиатор на данном этапе не настроен. Официальный список: https://www.economie.gouv.fr/mediation-conso/liste-mediateurs-references."] },
          ],
        },
        terms: {
          eyebrow: "Условия",
          title: "Условия продажи",
          description:
            "Перевод французских условий для удобства. Условия регулируют цифровой доступ, приватную доставку и support tickets через markshnaknaks.com.",
          sections: [
            { title: "Предмет", body: ["Предложения являются цифровыми сервисами доступа: Digital Access Pass, Premium Platform Membership, Content Delivery Token и VIP Infrastructure Access.", "Каждая покупка дает персональное, неисключительное и непередаваемое право доступа, ограниченное assets или сервисами, связанными с заказом.", "Коммерческие формулировки сайта описывают цифровой доступ и безопасную доставку, а не передачу прав интеллектуальной собственности."] },
            { title: "Правоспособность и разрешенное использование", body: ["Клиент должен иметь право заключать договор и использовать сервис в соответствии с применимым законом.", "Публичная публикация ссылок доставки, перепродажа доступа, abusive automation или обход токенов могут привести к приостановке доступа."] },
            { title: "Цена и оплата", body: ["Цены указаны в евро. VAT not applicable, article 293 B of the French General Tax Code.", "Stripe является основным процессором fiat-платежей. Поддерживаемые crypto-платежи могут включать USDC через Solana Pay и LTC/BTC через BTCPay, в зависимости от активных rails.", "Для crypto-платежей платформа фиксирует EUR fiat value на момент транзакции для бухгалтерского учета."] },
            { title: "Цифровая доставка", body: ["После подтверждения оплаты платформа создает entitlement и приватную страницу доставки, защищенную time-limited token.", "Файлы не хранятся в Git или Telegram. Приватные assets выдаются из Cloudflare R2 через short-lived signed URLs."] },
            { title: "Немедленное исполнение и отказ от withdrawal right", body: ["Перед checkout клиент явно принимает условия, запрашивает немедленное цифровое исполнение и признает потерю withdrawal right после выдачи доступа или приватной ссылки доставки."] },
            { title: "VIP Infrastructure Access", body: ["Приватные запросы обрабатываются как tickets через Marky Concierge. Они не дают доступ к личному аккаунту создателя.", "Quota, duration и статус ticket отслеживаются платформой. Abusive, незаконные или out-of-scope запросы могут быть отклонены."] },
            { title: "Поддержка", body: ["Основная поддержка: защищенная форма связи на сайте или юридический email в legal notice. Telegram может использоваться для помощи, приватных invites и сопровождения доставки.", "Поддержка может запросить номер заказа, payment email или разумное доказательство владения ссылкой доставки перед изменением права доступа."] },
            { title: "Потребительская медиация", body: ["Потребительский медиатор на данном этапе не настроен. Официальный список referenced mediators: https://www.economie.gouv.fr/mediation-conso/liste-mediateurs-references."] },
            { title: "Применимое право", body: ["Эти условия регулируются французским правом, не лишая потребителя обязательных защит, которые могут предоставляться законом страны его проживания."] },
          ],
        },
        refund: {
          eyebrow: "Возвраты",
          title: "Политика возвратов",
          description:
            "Перевод для удобства. Цифровой доступ доставляется быстро и логируется. Эта политика описывает случаи, когда возврат может быть рассмотрен.",
          sections: [
            { title: "Принцип", body: ["После выдачи цифрового доступа, приватной ссылки доставки или support ticket цифровой сервис считается начатым по запросу клиента.", "Если клиент принял немедленное исполнение и waiver перед оплатой, возврат не является автоматическим после выдачи доступа."] },
            { title: "Допустимые случаи", body: ["Возврат может быть рассмотрен, если оплата была продублирована, доступ не был выдан, техническая ошибка полностью блокирует доставку или заказ был явно списан по ошибке.", "Запрос должен быть отправлен через форму связи с номером заказа, способом оплаты и кратким описанием проблемы."] },
            { title: "Crypto", body: ["Принятые crypto refunds могут корректироваться с учетом network fees и EUR fiat value, зафиксированной на момент транзакции.", "Платформа никогда не запрашивает seed phrase, private keys или чувствительные скриншоты wallet."] },
            { title: "Контакт", body: ["Поддержка по возвратам: защищенная форма связи на сайте или юридический email в legal notice.", "Целевое время первого ответа: 3-5 рабочих дней."] },
          ],
        },
        privacy: {
          eyebrow: "Конфиденциальность",
          title: "Политика конфиденциальности",
          description:
            "Перевод для удобства. Эта политика объясняет данные, обрабатываемые Raphael Tech Solutions для работы markshnaknaks.com, доставки цифрового доступа и поддержки.",
          sections: [
            { title: "Контролер", body: ["Raphael Tech Solutions, operated by Raphael Chauvier, acts as controller for checkout, access rights, digital delivery, support and business requests.", "Контакт по персональным данным: защищенная форма связи на сайте."] },
            { title: "Собираемые данные", body: ["Заказы: order id, access product, amount, currency, status, payment provider, EUR fiat value at transaction time, версия условий и consent на immediate delivery.", "Доставка: entitlements, hashed delivery tokens, download events, asset identifiers и технические timestamps.", "Поддержка и Telegram: Telegram id, username, chat id, сообщения ticket VIP Infrastructure Access, support requests и VIP invites, если пользователь связывает Telegram.", "Деловой контакт: имя, бренд или организация, сообщение, source и технический user-agent формы."] },
            { title: "Цели", body: ["Обработка платежей, предотвращение abuse, доставка цифрового доступа, поддержка, управление private tickets, бухгалтерские обязанности и безопасность сервиса.", "Данные не продаются. Telegram является каналом поддержки и concierge; сайт остается source of truth для прав доступа."] },
            { title: "Правовые основания", body: ["Обработка заказов, доставки и поддержки в основном основана на исполнении договора и юридических бухгалтерских обязательствах.", "Security, anti-abuse и fraud-prevention processing основаны на legitimate interest издателя в защите платформы и пользователей."] },
            { title: "Процессоры и хранение", body: ["Fiat-платежи обрабатываются Stripe. Crypto-платежи могут обрабатываться BTCPay Server или Solana Pay в зависимости от активных rails.", "Приватные assets хранятся в Cloudflare R2 и выдаются через short-lived signed URLs. Данные приложения хранятся в centralized PostgreSQL на инфраструктуре издателя.", "Cloudflare может обрабатывать технические security logs, proxy events и Turnstile verification data, когда эти защиты активны."] },
            { title: "Выбор языка и anti-spam", body: ["Сайт может хранить строго функциональный cookie выбора языка marky_locale, чтобы сохранять выбранный язык пользователя.", "Публичная форма связи использует honeypot, PostgreSQL-backed rate limiting и, когда включено, Cloudflare Turnstile для уменьшения automated spam.", "Сайт не использует IP geolocation для рекламного профилирования. Cloudflare country используется только как fallback для языка при первом визите, если нет явного выбора языка или browser preference."] },
            { title: "Хранение и права", body: ["Данные заказов и бухгалтерии хранятся в течение срока, требуемого применимыми юридическими обязательствами.", "Субъекты данных могут запросить доступ, исправление, удаление, ограничение или возражение, когда эти права применимы, через защищенную форму связи.", "Если трудности сохраняются, субъект данных может обратиться в компетентный supervisory authority, including the CNIL in France."] },
          ],
        },
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
