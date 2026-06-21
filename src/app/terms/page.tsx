import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/LegalDocument";
import { legalConfig } from "@/data/legal";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Conditions generales de vente",
  description: `Conditions generales de vente des acces numeriques ${siteConfig.domain}.`,
};

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="CGV"
      title="Conditions generales de vente"
      description={`Version ${legalConfig.termsVersion}. Ces conditions encadrent les acces numeriques, livraisons privees et tickets de support fournis via ${siteConfig.domain}.`}
      sections={[
        {
          title: "Objet",
          body: [
            "Les offres proposees sont des services numeriques d'acces: Digital Access Pass, Premium Platform Membership, Content Delivery Token et VIP Infrastructure Access.",
            "Chaque achat ouvre un droit d'acces personnel, non exclusif, non transferible et limite aux actifs ou services associes a la commande.",
            "Les libelles commerciaux du site decrivent un acces numerique et une livraison securisee, pas une cession de droits de propriete intellectuelle.",
          ],
        },
        {
          title: "Capacite et usage autorise",
          body: [
            "Le client doit etre juridiquement capable de contracter et utiliser le service dans le respect de la loi applicable.",
            "Le partage public d'un lien de livraison, la revente d'un acces, l'automatisation abusive ou la tentative de contournement des tokens peut entrainer la suspension de l'acces concerne.",
          ],
        },
        {
          title: "Prix et paiement",
          body: [
            "Les prix sont indiques en euros. TVA non applicable, article 293 B du Code general des impots.",
            "Stripe est le processeur principal pour les paiements fiat. Les paiements crypto supportes peuvent inclure USDC via Solana Pay et LTC/BTC via BTCPay, selon les rails actifs au moment de la commande.",
            "Pour les paiements crypto, la plateforme enregistre la valeur fiat EUR applicable au moment de la transaction afin de permettre le suivi comptable.",
            "Les recus et libelles de service doivent rester alignes avec les services techniques fournis par la plateforme.",
          ],
        },
        {
          title: "Livraison numerique",
          body: [
            "Apres confirmation du paiement, la plateforme cree un droit d'acces et genere une page de livraison privee protegee par un token a duree limitee.",
            "Les fichiers ne sont pas stockes dans Git ni dans Telegram. Les actifs prives sont servis depuis Cloudflare R2 via des URLs signees et limitees dans le temps.",
            "Le client doit conserver son lien de livraison de maniere confidentielle. Toute fuite du lien peut entrainer une regeneration ou une suspension du token pour proteger l'acces.",
          ],
        },
        {
          title: "Execution immediate et renonciation au droit de retractation",
          body: [
            "Avant de lancer le checkout, le client accepte expressement les CGV, demande l'execution immediate du service numerique et reconnait perdre son droit de retractation une fois l'acces numerique ou le lien de livraison prive emis.",
            "Cette acceptation est journalisee avec la version des CGV et l'horodatage de consentement lorsque la configuration technique le permet.",
          ],
        },
        {
          title: "VIP Infrastructure Access",
          body: [
            "Les requetes privees sont gerees sous forme de tickets via Marky Concierge. Elles ne donnent pas acces au compte personnel du createur.",
            "Le quota, la duree et le statut du ticket sont suivis par la plateforme. Une demande abusive, illegale, hors perimetre ou incompatible avec les regles de support peut etre refusee.",
          ],
        },
        {
          title: "Support",
          body: [
            `Support principal: ${legalConfig.supportEmail}. Telegram peut etre utilise pour l'assistance, les invitations privees et le suivi de livraison, mais le site reste la source de verite des droits d'acces.`,
            "Le support peut demander une reference de commande, un email de paiement ou une preuve raisonnable de possession du lien de livraison avant toute action sur un acces.",
          ],
        },
        {
          title: "Mediation de la consommation",
          body: [
            legalConfig.consumerMediatorConfigured
              ? `En cas de litige non resolu apres reclamation ecrite au support, le consommateur peut saisir le mediateur reference: ${legalConfig.consumerMediator.name}, ${legalConfig.consumerMediator.website}.`
              : `La vente B2C publique reste verrouillee tant que les coordonnees d'un mediateur de la consommation reference ne sont pas configurees. Liste officielle: ${legalConfig.consumerMediator.referenceListUrl}.`,
          ],
        },
      ]}
    />
  );
}
