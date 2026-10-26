import type { Configuration } from "./configurator";

type Order = { kind: string; customer_name: string; details: { service: string; quantity: number; size: string; condition: string; message: string; configurator?: Configuration | undefined } };

const fallback = (o: Order) => `Bonjour ${o.customer_name}, ici TClean, votre assistant nettoyage 🧽 !
Pour une intervention rapide et efficace :
1. Dégagez l'accès au mobilier (environ 1 m autour) et retirez plaids, coussins décoratifs et objets.
2. Passez un coup d'aspirateur si possible, surtout en cas de poils d'animaux.
3. Prévoyez une prise électrique à proximité et un point d'eau accessible.
4. Ne frottez pas les taches et n'appliquez aucun produit avant notre passage.
5. Aérez la pièce après l'intervention : le séchage prend entre 12 et 24 h, évitez de vous asseoir avant que ce soit sec.
Une question ? Écrivez-nous ici ou appelez le 06 77 69 50 79.`;

/** Preparation and care instructions from built-in rules (no outside service). */
export async function botInstructions(o: Order): Promise<string> {
  return fallback(o);
}

type ChatQuestion = { question: string; customerName: string; context: string };

const botChatFallback = (question: string, customerName: string) => {
  const q = question.toLocaleLowerCase("fr-FR");
  const greeting = `Bonjour ${customerName}, ici TClean 🧽. `;
  if (/séch|sec|combien de temps/.test(q)) return greeting + "Après un nettoyage, comptez généralement 12 à 24 heures de séchage selon le tissu, l’aération et les conditions de la pièce. Aérez bien et attendez que le mobilier soit complètement sec avant de vous asseoir.";
  if (/tache|produit|frotter|odeur|poil/.test(q)) return greeting + "Évitez de frotter la tache ou d’appliquer un produit sans connaître le tissu : cela peut fixer la salissure ou créer une auréole. Indiquez-nous le type de tissu et la nature de la tache, ou joignez une photo pour que l’équipe puisse vous orienter.";
  if (/prépar|avant|intervention|rendez-vous/.test(q)) return greeting + "Avant notre passage, dégagez l’accès au mobilier, retirez les objets et plaids, passez l’aspirateur si possible, éloignez les animaux et prévoyez une prise électrique ainsi qu’un point d’eau accessibles.";
  if (/prix|tarif|coût|combien|disponib|date|horaire|réservation/.test(q)) return greeting + "Je préfère ne pas inventer de prix ni de disponibilité. Envoyez votre demande dans cette conversation : l’équipe TClean pourra vérifier les informations exactes.";
  return greeting + "Je peux vous aider sur la préparation du canapé, les taches, les précautions selon le tissu et le temps de séchage. Pour un tarif ou une disponibilité précise, l’équipe TClean devra confirmer. Vous pouvez aussi joindre une photo.";
};

/** Answers client questions from built-in rules, without inventing prices or slots. */
export async function botChatReply(input: ChatQuestion): Promise<string> {
  return botChatFallback(input.question, input.customerName);
}
