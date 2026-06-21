import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/LegalDocument";
import { legalConfig } from "@/data/legal";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Politique de confidentialite",
  description: `Politique de confidentialite de ${siteConfig.domain}.`,
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Privacy"
      title="Politique de confidentialite"
      description={`Version ${legalConfig.privacyVersion}. Cette politique explique les donnees traitees par ${legalConfig.merchantName} pour exploiter ${siteConfig.domain}, livrer les acces numeriques et assurer le support.`}
      sections={[
        {
          title: "Responsable du traitement",
          body: [
            `${legalConfig.merchantName}, opere par ${legalConfig.entrepreneurName}, agit comme responsable du traitement pour le checkout, les droits d'acces, la livraison numerique, le support et les demandes professionnelles.`,
            `Contact donnees personnelles: ${legalConfig.privacyEmail}.`,
          ],
        },
        {
          title: "Donnees collectees",
          body: [
            "Commandes: identifiant de commande, produit d'acces, montant, devise, statut, fournisseur de paiement, valeur fiat EUR au moment de la transaction, version des CGV et consentement a la livraison immediate.",
            "Livraison: droits d'acces, tokens de livraison haches, evenements de telechargement, identifiants d'actifs et horodatages techniques.",
            "Support et Telegram: identifiant Telegram, username, chat id, messages de ticket VIP Infrastructure Access, demandes de support et invitations VIP si l'utilisateur choisit de lier Telegram.",
            "Contact pro: nom, marque ou organisation, message, source et user-agent technique du formulaire.",
          ],
        },
        {
          title: "Finalites",
          body: [
            "Traiter les paiements, prevenir la fraude, livrer les acces numeriques, fournir le support, gerer les tickets prives, respecter les obligations comptables et ameliorer la securite du service.",
            "Les donnees ne sont pas vendues. Telegram est un canal de support et de concierge; le site reste la source de verite des droits d'acces.",
          ],
        },
        {
          title: "Bases legales",
          body: [
            "Les traitements lies aux commandes, a la livraison et au support reposent principalement sur l'execution du contrat et les obligations legales comptables.",
            "Les traitements de securite, anti-abus et prevention de fraude reposent sur l'interet legitime de l'editeur a proteger la plateforme et ses utilisateurs.",
          ],
        },
        {
          title: "Sous-traitants et stockage",
          body: [
            "Les paiements fiat sont traites par Stripe. Les paiements crypto peuvent etre traites par BTCPay Server ou Solana Pay selon les rails actifs.",
            "Les actifs prives sont stockes dans Cloudflare R2 et servis via des URLs signees de courte duree. Les donnees applicatives sont stockees dans PostgreSQL centralise sur l'infrastructure de l'editeur.",
            "Cloudflare peut fournir des services de securite, proxy, stockage et anti-spam. Telegram traite les messages envoyes au bot selon ses propres conditions lorsque l'utilisateur choisit ce canal.",
          ],
        },
        {
          title: "Conservation",
          body: [
            "Les donnees de commande et de comptabilite sont conservees pendant la duree requise par les obligations legales applicables.",
            "Les tokens de livraison expirent automatiquement selon la duree configuree. Les messages de contact et tickets support sont conserves le temps necessaire au traitement de la demande, puis peuvent etre archives ou supprimes.",
          ],
        },
        {
          title: "Droits",
          body: [
            "Toute personne concernee peut demander l'acces, la rectification, l'effacement, la limitation ou l'opposition lorsque ces droits s'appliquent.",
            `Les demandes doivent etre envoyees a ${legalConfig.privacyEmail}. Une preuve raisonnable d'identite ou de possession de commande peut etre demandee avant toute action sur un compte ou un acces.`,
            "En cas de difficulte persistante, la personne concernee peut contacter l'autorite de controle competente.",
          ],
        },
      ]}
    />
  );
}
