import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/tclean/public-pages";
import { businessQuery, pageHead } from "@/lib/business-query";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(businessQuery),
  head: ({ loaderData }) =>
    pageHead(
      loaderData ?? ({ name: "TClean" } as import("@/lib/business").BusinessConfig),
      "Contact Nettoyage Canapé Strasbourg | TClean 06 77 69 50 79",
      "Contactez TClean au 06 77 69 50 79 pour le nettoyage de votre canapé et mobilier textile à domicile à Strasbourg et environs. Échange direct et devis personnalisé.",
      "/contact",
    ),
  component: ContactPage,
});
