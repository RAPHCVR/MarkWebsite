import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/LegalDocument";
import { legalConfig } from "@/data/legal";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Mentions legales",
  description: `Mentions legales de ${siteConfig.domain}, opere par ${legalConfig.merchantName}.`,
};

export const dynamic = "force-dynamic";

export default function LegalPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Mentions legales"
      description={`${siteConfig.domain} est opere par ${legalConfig.merchantName}, prestataire technique et Merchant of Record des services numeriques Marky.`}
      sections={[
        {
          title: "Editeur du site",
          body: [
            `${legalConfig.merchantName}, nom commercial de ${legalConfig.entrepreneurName}, entrepreneur individuel immatricule sous le SIREN ${legalConfig.siren}.`,
            `Adresse de l'entreprise: ${legalConfig.registeredAddress}.`,
            `Activite declaree: ${legalConfig.activity}`,
            `Directeur de la publication: ${legalConfig.publicationDirector}.`,
          ],
        },
        {
          title: "Role de la plateforme",
          body: [
            `${legalConfig.merchantName} fournit l'infrastructure logicielle, le checkout, la gestion des droits d'acces, la livraison privee et le support technique.`,
            "Marky est le createur presente sur l'interface publique. Les paiements web sont traites par la plateforme, qui agit comme Merchant of Record pour les services numeriques fournis sur le site.",
          ],
        },
        {
          title: "Contact",
          body: [
            `Support et demandes professionnelles: ${legalConfig.supportEmail}.`,
            "Les demandes liees aux commandes doivent inclure la reference de commande ou le lien de livraison, sans partager de donnees sensibles dans un groupe public.",
          ],
        },
        {
          title: "Hebergement et stockage",
          body: [
            legalConfig.hosting,
            "Le site est deploye sur l'infrastructure Kubernetes de l'editeur. Les actifs prives sont stockes dans un bucket Cloudflare R2 prive et servis via des URLs signees de courte duree apres verification du droit d'acces.",
            "Telegram est utilise comme canal de support et de concierge. Il n'est pas le stockage principal des actifs et ne remplace pas le checkout du site.",
          ],
        },
        {
          title: "Reglement amiable",
          body: [
            "Toute reclamation doit d'abord etre adressee au support avec la reference de commande et les elements utiles a l'analyse.",
            legalConfig.consumerMediatorConfigured
              ? `Mediateur de la consommation: ${legalConfig.consumerMediator.name}, ${legalConfig.consumerMediator.website}.`
              : `Mediateur de la consommation non renseigne a ce stade. Liste officielle: ${legalConfig.consumerMediator.referenceListUrl}.`,
          ],
        },
      ]}
    />
  );
}
