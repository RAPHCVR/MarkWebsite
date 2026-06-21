import type { Metadata } from "next";

import { LegalDocument } from "@/components/site/LegalDocument";
import { legalConfig } from "@/data/legal";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Politique de remboursement",
  description: `Politique de remboursement des acces numeriques ${siteConfig.domain}.`,
};

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      eyebrow="Refunds"
      title="Politique de remboursement"
      description="Les acces numeriques sont livres rapidement et journalises. Cette politique precise les cas ou un remboursement peut etre accepte."
      sections={[
        {
          title: "Principe",
          body: [
            "Une fois l'acces numerique, le lien de livraison prive ou le ticket de support emis, le service numerique est considere comme commence a la demande du client.",
            "Si le client a accepte l'execution immediate et la renonciation au droit de retractation avant paiement, le remboursement n'est pas automatique apres emission de l'acces.",
            "La politique vise les services numeriques de plateforme et la livraison securisee associee a la commande.",
          ],
        },
        {
          title: "Cas eligibles",
          body: [
            "Un remboursement peut etre etudie si le paiement a ete double, si l'acces n'a jamais ete emis, si une erreur technique empeche totalement la livraison, ou si la commande a ete manifestement facturee par erreur.",
            "La demande doit etre envoyee via le formulaire de contact avec la reference de commande, le moyen de paiement et une description concise du probleme.",
          ],
        },
        {
          title: "Crypto",
          body: [
            "Les remboursements crypto, lorsqu'ils sont acceptes, peuvent etre ajustes pour tenir compte des frais reseau et de la valeur fiat EUR journalisee au moment de la transaction.",
            "La plateforme ne demande jamais de phrase seed, de cle privee ou de capture sensible de wallet.",
            "Un remboursement crypto accepte peut etre effectue sur un rail different si cela reduit les frais ou le risque operationnel, apres accord avec le client.",
          ],
        },
        {
          title: "Contact",
          body: [
            `Support remboursements: ${legalConfig.supportContactLabel}.`,
            "Delai cible de premiere reponse: 3 a 5 jours ouvres.",
          ],
        },
      ]}
    />
  );
}
