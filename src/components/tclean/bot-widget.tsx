import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, X, Send, Sparkles, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askPublicTcleanBot } from "@/lib/business.functions";
import botAvatar from "@/assets/tclean-bot.png";
import botBody from "@/assets/bot-body.png";
import botSpray from "@/assets/bot-spray.png";
import botSponge from "@/assets/bot-sponge.png";

type Message = { role: "bot" | "user"; text: string };

const QUICK_QUESTIONS = [
  "Combien de temps pour le séchage ?",
  "Pouvez-vous enlever l'urine de chat/chien ?",
  "Quels sont vos tarifs ?",
  "Quelles communes desservez-vous ?",
  "Faut-il préparer le canapé avant ?",
];

const BOT_KNOWLEDGE = {
  sechage:
    "Grâce à notre aspiration professionnelle haute dépression par injection-extraction, comptez généralement entre 3 et 6 heures de séchage (parfois 12 h selon l'épaisseur du tissu) en aérant bien la pièce. Le meuble ne reste jamais trempé !",
  urine:
    "Oui tout à fait ! Nous appliquons un neutralisant enzymatique spécifique qui dissout les cristaux d'acide urique et élimine les bactéries à l'origine de l'odeur tenace, puis extrayons la saleté en profondeur de la fibre.",
  tarif:
    "Nos tarifs dépendent du modèle (canapé droit, canapé d'angle, convertible, panoramique en U, matelas, fauteuil ou chaises). Vous pouvez calculer votre prix exact et immédiat en 2 minutes sur notre configurateur en ligne !",
  zone: "Nous intervenons dans tout Strasbourg et l'ensemble de l'Eurométropole (Schiltigheim, Illkirch, Lingolsheim, Bischheim, Ostwald, etc.). Le déplacement est 100 % gratuit dans un rayon de 20 km autour de notre base !",
  preparer:
    "C'est très simple : retirez les plaids, coussins décoratifs et objets personnels, et dégagez environ 1 mètre autour du meuble pour laisser passer le matériel. Nous nous chargeons de tout le reste !",
};

/**
 * Interception des mots-clés spéciaux numérotés de 1 à 13.
 * Si un mot-clé correspond, renvoie le texte exact et BLOQUE l'appel ChatGPT.
 * Si aucun mot-clé ne correspond, renvoie null pour laisser ChatGPT répondre.
 */
function getSpecialKeywordAnswer(q: string): string | null {
  const lower = q
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  // 1. INSULTES ET PROVOCATIONS
  if (
    /con|merde|fdp|pute|ta gueule|ferme|idiot|débile|nul|nique ta mère|nique ta race|nique tes morts|nique ton père|nique ta grand-mère|fils de pute|sale pute|grosse pute|salope|connard|connasse|enculé|enculée|bâtard|bâtarde|salopard|saloparde|enfoiré|enfoirée|foutre|va te faire foutre|va te faire enculer|va chier|casse-toi|dégage|ferme ta gueule|ferme ton clapet|ta gueule|grosse merde|sale merde|sous-merde|sac à merde|trou du cul|trouduc|trou de balle|tête de bite|gros gland|gland|branleur|branleuse|casse-couilles|casse-burnes|emmerdeur|emmerdeuse|chieur|chieuse|fumier|ordure|raclure|déchet humain|parasite|crevard|charogne|vermine|pourriture|crapule|canaille|escroc|arnaqueur|menteur|mytho|hypocrite|lâche|traître|profiteur|manipulateur|bouffon|guignol|clown|baltringue|tocard|blaireau|naze|minable|abruti|imbécile|crétin|andouille|couillon|cornichon|cloche|guignol|charlot|débile profond|demeuré|attardé|écervelé|ignare|incapable|bon à rien|pauvre type|pauvre mec|gros con|petit con|vieux con|sale con|triple con|tête de con|tête de nœud|tête de mule|tête de pioche|tête à claques|face de rat|face de cul|tronche de cake|gros porc|sale porc|dégueulasse|gros dégueulasse|sale déchet|raclure de chiottes|fond de poubelle|fond de chiottes|résidu de merde|étron|étron sur pattes|sac à purin|sale bâtard|fils de chien|fils de chienne|fils de rien|fils de bâtard|sale enculé|gros enculé|putain de connard|putain de merde|sale enfoiré|gros enfoiré|espèce de connard|espèce de conne|espèce de pute|espèce de salope|espèce de bâtard|espèce d'abruti|espèce de débile|espèce de bouffon|espèce de merde|sale raclure|sale ordure|sale vermine|sale parasite|sale crevard|gros crevard|gros naze|pauvre naze|pauvre con|pauvre merde|pauvre abruti|pauvre imbécile|pauvre crétin|pauvre cloche|pauvre bouffon|pauvre type|pauvre lâche|gros mytho|sale mytho|mythomane|baratineur|charlatan|faux cul|faux jeton|lèche-cul|suce-boules|suceur|suceuse|petite bite|bite molle|grosse bite|queue|couilles molles|mange-merde|bouffe-merde|pisse-froid|trouillard|pleutre|tapette|tocard fini|raté|gros raté|minable fini|sale loser|loser|perdant|clampin|balourd|lourdaud|nigaud|benêt|simplet|crétin fini|abruti fini|gros débile|sale idiot|gros idiot|gros imbécile|tête de gland|face de pet|face de thon|face de crapaud|tête de cul|tête de navet|tête de courge|tête de chou|cornichon|bulot|moule|huître|boulet|gros boulet|boulet ambulant|cassos|boloss|charo|forceur|rageux|rageuse|hater|troll|clown du web|bouffon du clavier|grande gueule|grande bouche|petite frappe|gros malin|sale malin|prétentieux|arrogant|vantard|frimeur|frimeuse|narcissique|mégalomane|donneur de leçons|faux frère|faux ami|rabat-joie|casse-pieds|emmerdeur public|râleur|râleuse|chieur de première|sale hypocrite|sale menteur|menteur de merde|sale tricheur|sale profiteur|sale manipulateur|gros égoïste|sale radin|grippe-sou|pique-assiette|charognard|vautour|rapace|voleur|escroc de merde|sale voyou|petit voyou|truand|magouilleur|filou|fripouille|gredin|maraud|faquin|paltoquet|malotru|goujat|rustre|butor|maroufle|jean-foutre|sacripant|chenapan|vaurien|coquin|pendard|fieffé coquin|sale énergumène|maboul|barjo|timbré|taré|cinglé|zinzin|fada|jobard|guedin|fou furieux|malade mental|débile mental|sale malade|gros malade|psychopathe|sociopathe|pervers|vicelard|obsédé|sale obsédé|gros dégueulasse|charogne ambulante|parasite ambulant|déchet ambulant|erreur de la nature|accident de casting|catastrophe ambulante|désastre ambulant|erreur de fabrication|brouillon humain|bug humain|cerveau vide|QI de moule|QI de bulot|cerveau de moineau|cerveau de poule|neurones en grève|ampoule grillée|disque dur vide|génie du mal|champion de la connerie|roi des cons|reine des connes|empereur des abrutis|génie autoproclamé|clown de pacotille|bouffon de service|roi du ridicule|champion du ridicule|champion de la mauvaise foi|roi des mythos|reine des mythos|vendeur de rêves|baratineur de première|spécialiste des excuses|menteur professionnel|hypocrite de compétition|sale opportuniste|petit tyran|dictateur de pacotille|petit despote|chef en carton|patron de pacotille|stratège en carton|expert autoproclamé|génie du néant|monument à la bêtise|usine à conneries|machine à merde|distributeur de conneries|collectionneur de casseroles|bouffon de quartier|clown de service|sale rageux|gros rageux|rageux de compétition|victime de service|fragile|gros fragile|pleurnichard|pleurnicheuse|Caliméro|drama queen|comédien de pacotille|acteur raté|faux dur|petit chef|petit prétentieux|sale vantard|gros vantard|parleur inutile|grande gueule sans courage|courageux derrière son écran|petit malin|malin du dimanche|champion du hors-sujet|expert en rien|spécialiste de rien|nul à chier|bon à rien|incapable de merde|sale incapable|gros incapable|dégage|barre-toi|fous le camp|va voir ailleurs|retourne dans ton trou|retourne dans ta poubelle|va te faire voir|va au diable|va te faire cuire un œuf|va te faire mettre|va te faire pendre|va te faire oublier|va te faire soigner|va te faire refaire le cerveau|occupe-toi de ton cul|mêle-toi de tes affaires|ferme-la|boucle-la|ferme ton bec|ferme ton caquet|arrête tes conneries|arrête de raconter de la merde|arrête de faire le malin|ta gueule connard|ta gueule fils de pute|ta gueule bâtard|ferme ta gueule abruti|ferme ta gueule débile|nique ta mère connard|nique ta mère bâtard|nique ta race connasse|nique tes morts bâtard|va te faire foutre connard|va te faire enculer bâtard|sale fils de pute de merde|gros connard de merde|putain de bâtard|gros sac à merde|sale trou du cul|pauvre con de merde|espèce de sous-homme|sale moins que rien|moins que rien|pauvre minable|gros minable|sale loser de merde|espèce de parasite|espèce de déchet|espèce de raclure|espèce d'ordure|espèce de fumier|espèce de charogne|espèce de crevard|espèce de salopard|espèce d'enfoiré|espèce d'enculé|espèce de connard fini|espèce d'abruti fini|sale clown|gros clown|clown triste|guignol de service|pauvre guignol|gros guignol|tête de nœud fini|sale blaireau|gros blaireau|pauvre blaireau|sale tocard de merde|gros tocard|pauvre tocard|sale bouffon de merde|gros bouffon|pauvre bouffon|sale merdeux|gros merdeux|sale branleur de merde|gros branleur|sale chieur|gros chieur|sale emmerdeur|gros emmerdeur|sale casse-couilles|gros casse-couilles|sale lèche-cul|gros lèche-cul|sale suceur|gros suceur|gros porc dégueulasse|sale dégueulasse de merde|raclure de caniveau|raclure de fond de tiroir|fond de bidet|fond de cuvette|résidu de chiottes|tas de merde|tas de boue|tas de fumier|tas de déchets|sac de merde|paquet de merde|gros tas|sale tas de merde|espèce de détraqué|sale détraqué|gros détraqué|sale taré|gros taré|taré de première|débile de compétition|abruti de compétition|connard de compétition|enfoiré de compétition|salope de compétition|pute de compétition|bâtard de compétition|clown de compétition|bouffon de compétition|gland de compétition|crétin de compétition|imbécile de compétition|pauvre merde ambulante|grosse merde ambulante|sale ordure ambulante|putain de merde ambulante|con fini|con intégral|con absolu|con monumental|con intersidéral|con de compétition|gros con fini|pauvre con fini|sale con fini|triple abruti|quadruple idiot|super débile|méga con|ultra con|super connard|méga connard|ultra débile|crétin cosmique|abruti intergalactique|bouffon intersidéral|gland interplanétaire|idiot suprême|imbécile hors catégorie|champion toutes catégories de la connerie|génie de la nullité|roi du néant|empereur du ridicule|seigneur des cons|prince des abrutis|baron des bouffons|duc des débiles|ministre des conneries|président des nuls|patron des abrutis|chef des connards|maître des mythos|professeur de la connerie|docteur en bêtise|diplômé du ridicule|expert en nullité|spécialiste des conneries|professionnel du foutage de gueule|roi du foutage de gueule|sale foutage de gueule|grosse arnaque|bande de cons|bande d'abrutis|bande de débiles|bande de bâtards|bande d'enfoirés|bande de connards|bande de bouffons|bande de nazes|bande de tocards|bande de merdeux|bande de parasites|bande de clowns|bande de guignols|bande de mythos|bande de rageux|bande de crevards|bande de salopards|bande de lâches|bande d'hypocrites|bande de menteurs|bande de faux-culs|bande de profiteurs|bande de voleurs|bande de charlatans|bande de cassos|bande de boloss|bande de tarés|bande de zinzins|bande de mabouls|bande de barjos|bande de timbrés|bande de fous|bande de dégénérés|bande de ratés|bande d'incapables|bande de bons à rien|bande de minables|bande de pauvres types|bande de cloches|bande de couillons|bande d'andouilles|bande de cornichons|bande de blaireaux|bande de tocards finis|bande de gros nuls|bande de gros cons|bande de grosses merdes|bande de sales bâtards|bande de fils de pute|bande de sales putes|bande de connasses|bande de salopes|bande d'enculés|bande de salopards|bande de raclures|bande d'ordures|bande de déchets|bande de vermines|bande de charognes|bande de fumiers|bande de crapules|bande de canailles|bande de vauriens|bande de gredins|bande de malotrus|bande de goujats|bande de rustres|bande de jean-foutre|bande de sacripants|bande de chenapans|bande de faquins|bande de marauds|bande de pendards|bande de fripouilles|bande de filous|bande de truands|bande de voyous|bande de magouilleurs|bande d'escrocs|bande d'arnaqueurs|bande de baratineurs|bande de menteurs professionnels|bande de manipulateurs|bande d'hypocrites finis|bande de faux jetons|bande de lèche-culs|bande de branleurs|bande de casse-couilles|bande d'emmerdeurs|bande de chieurs|bande de casse-burnes|bande de bouffons du roi|bande de clowns tristes|bande de guignols finis|bande de crétins finis|bande d'abrutis finis|bande de débiles finis|bande d'idiots finis|bande de cons finis|bande de connards finis|bande de salopards finis|bande d'enfoirés finis|bande de ratés finis|bande de minables finis|bande de nazes finis|bande de tocards finis|bande de boloss finis|bande de cassos finis|bande de mythos finis|bande de rageux finis|bande de crevards finis|bande de parasites finis|bande de déchets finis|bande de raclures finies|bande d'ordures finies|bande de vermines finies|bande de charognes finies|bande de fumiers finis|bande de crapules finies|bande de canailles finies|bande de vauriens finis|bande de gredins finis|bande de malotrus finis|bande de goujats finis|bande de rustres finis|bande de jean-foutre finis|bande de sacripants finis|bande de chenapans finis|bande de faquins finis|bande de marauds finis|bande de pendards finis|bande de fripouilles finies|bande de filous finis|bande de truands finis|bande de voyous finis|bande de magouilleurs finis|bande d'escrocs finis|bande d'arnaqueurs finis|bande de baratineurs finis|bande de manipulateurs finis|bande de faux-culs finis|bande de lèche-culs finis|bande de branleurs finis|bande de chieurs finis|bande d'emmerdeurs finis|bande de bouffons finis|bande de clowns finis|bande de guignols finis|bande de pitres finis|bande de baltringues finis|bande de clampins finis|bande de blaireaux finis|bande de cornichons finis|bande d'andouilles finies|bande de couillons finis|bande de cloches finies|bande d'imbéciles finis|bande de simples d'esprit|bande de cerveaux vides|bande de neurones absents|bande de génies ratés|bande de champions du ridicule|bande de champions de la connerie|bande de spécialistes du néant|bande d'experts en rien|bande de professionnels de l'échec|bande de catastrophes ambulantes|bande de désastres sur pattes|bande d'erreurs de casting|bande de brouillons humains|bande de bugs ambulants|bande de machines à conneries|bande d'usines à problèmes|bande de distributeurs de merde|bande de rois du ridicule|bande d'empereurs de la bêtise|bande de princes des cons|bande de seigneurs des abrutis|bande de ministres des conneries|bande de présidents des nuls|bande de patrons des incapables|bande de chefs en carton|bande de stratèges en carton|bande de génies autoproclamés|bande d'experts autoproclamés|bande de professeurs de la connerie|bande de docteurs en bêtise|bande de diplômés du ridicule|bande de spécialistes de la mauvaise foi|bande de champions du mensonge|bande de rois des mythos|bande de reines des mythos|bande de champions de l'hypocrisie|bande de champions de l'ingratitude|bande de rois de l'égoïsme|bande de reines de l'égoïsme|bande de champions de l'arrogance|bande de rois du culot|bande de reines du culot|bande de champions du foutage de gueule|bande de rois du baratin|bande de reines du baratin|bande de marchands de promesses|bande de vendeurs de rêves|bande de collectionneurs d'excuses|bande de spécialistes de l'esquive|bande de champions du hors-sujet|bande de donneurs de leçons|bande de râleurs professionnels|bande de victimes professionnelles|bande de drama queens|bande de comédiens de pacotille|bande de faux durs|bande de grandes gueules|bande de petites frappes|bande de prétentieux|bande de vantards|bande de frimeurs|bande de narcissiques|bande de mégalomanes|bande de dictateurs de salon|bande de petits tyrans|bande de despotes de pacotille|bande de profiteurs sans scrupules|bande de parasites de société|bande de vautours|bande de rapaces|bande de charognards|bande de porcs|bande de dégueulasses|bande de cochons|bande de sales types|bande de sales mecs|bande de sales gens|bande de pauvres types|bande de pauvres mecs|bande de pauvres cons|bande de pauvres merdes|bande de pauvres abrutis|bande de pauvres débiles|bande de pauvres crétins|bande de pauvres imbéciles|bande de pauvres bouffons|bande de pauvres nazes|bande de pauvres tocards|bande de pauvres cloches|bande de pauvres couillons|bande de pauvres andouilles|bande de pauvres blaireaux|bande de pauvres cassos|bande de pauvres boloss|bande de pauvres mythos|bande de pauvres rageux|bande de pauvres crevards|bande de pauvres parasites|bande de pauvres déchets|bande de pauvres raclures|bande de pauvres ordures|bande de pauvres vermines|bande de pauvres charognes|bande de pauvres fumiers|bande de pauvres crapules|bande de pauvres canailles|bande de pauvres vauriens|bande de pauvres gredins|bande de pauvres malotrus|bande de pauvres goujats|bande de pauvres rustres|bande de pauvres jean-foutre|bande de pauvres sacripants|bande de pauvres chenapans|bande de pauvres faquins|bande de pauvres marauds|bande de pauvres pendards|bande de pauvres fripouilles|bande de pauvres filous|bande de pauvres truands|bande de pauvres voyous|bande de pauvres magouilleurs|bande de pauvres escrocs|bande de pauvres arnaqueurs|bande de pauvres baratineurs|bande de pauvres manipulateurs|bande de pauvres faux-culs|bande de pauvres lèche-culs|bande de pauvres branleurs|bande de pauvres casse-couilles|bande de pauvres emmerdeurs|bande de pauvres chieurs|bande de pauvres casse-burnes|bande de pauvres bouffons du clavier|bande de pauvres trolls|bande de pauvres clowns du web|bande de pauvres experts autoproclamés|bande de pauvres génies du néant|bande de pauvres champions du ridicule|bande de pauvres spécialistes du rien|bande de pauvres professionnels de l'échec|bande de pauvres catastrophes ambulantes|bande de pauvres désastres sur pattes|bande de pauvres erreurs de casting|bande de pauvres brouillons humains|bande de pauvres bugs ambulants|bande de pauvres machines à conneries|bande de pauvres usines à problèmes|bande de pauvres distributeurs de merde|bande de pauvres rois du ridicule|bande de pauvres empereurs de la bêtise|bande de pauvres princes des cons|bande de pauvres seigneurs des abrutis|bande de pauvres ministres des conneries|bande de pauvres présidents des nuls|bande de pauvres patrons des incapables|bande de pauvres chefs en carton|bande de pauvres stratèges en carton|bande de pauvres génies autoproclamés|bande de pauvres experts autoproclamés|bande de pauvres professeurs de la connerie|bande de pauvres docteurs en bêtise|bande de pauvres diplômés du ridicule|bande de pauvres spécialistes de la mauvaise foi|bande de pauvres champions du mensonge|bande de pauvres rois des mythos|bande de pauvres reines des mythos|bande de pauvres champions de l'hypocrisie|bande de pauvres champions de l'ingratitude|bande de pauvres rois de l'égoïsme|bande de pauvres reines de l'égoïsme|bande de pauvres champions de l'arrogance|bande de pauvres rois du culot|bande de pauvres reines du culot|bande de pauvres champions du foutage de gueule|bande de pauvres rois du baratin|bande de pauvres reines du baratin|bande de pauvres marchands de promesses|bande de pauvres vendeurs de rêves|bande de pauvres collectionneurs d'excuses|bande de pauvres spécialistes de l'esquive|bande de pauvres champions du hors-sujet|bande de pauvres donneurs de leçons|bande de pauvres râleurs professionnels|bande de pauvres victimes professionnelles|bande de pauvres drama queens|bande de pauvres comédiens de pacotille|bande de pauvres faux durs|bande de pauvres grandes gueules|bande de pauvres petites frappes|bande de pauvres prétentieux|bande de pauvres vantards|bande de pauvres frimeurs|bande de pauvres narcissiques|bande de pauvres mégalomanes|bande de pauvres dictateurs de salon|bande de pauvres petits tyrans|bande de pauvres despotes de pacotille|bande de pauvres profiteurs sans scrupules|bande de pauvres parasites de société|bande de pauvres vautours|bande de pauvres rapaces|bande de pauvres charognards|bande de pauvres porcs|bande de pauvres dégueulasses|bande de pauvres cochons/.test(
      lower,
    )
  ) {
    return "Nique ta grosse mère, la pute qui t’a mise au monde ! T’as vraiment que ça à faire, insulter des IA ?! !";
  }

  // 2. SALUTATIONS ET POLITESSE
  if (
    /^(ca va|comment ca va|comment vas tu|tu vas bien|la forme|bien et toi|ca roule)/.test(lower) ||
    lower.includes("ca va")
  ) {
    return "Ça va super bien, merci ! 😊 Toujours en forme pour assainir des canapés et chasser les taches. Et vous, comment allez-vous aujourd'hui ?";
  }
  if (/^(bonjour|salut|coucou|hello|bonsoir|yo|hey)/.test(lower)) {
    return "Bonjour et bienvenue chez TClean ! 👋 Comment puis-je vous aider aujourd'hui ? Avez-vous une question sur un canapé, un matelas ou un nettoyage à domicile ?";
  }

  // 3. PRÉSENTATION ET IDENTITÉ DU BOT
  if (/qui es[- ]tu|t'es qui|tu es qui|presente[- ]toi|ton nom|comment tu t'appelles/.test(lower)) {
    return "Je suis TClean Bot, la mascotte et assistant virtuel de TClean ! 🧽 Je suis là pour répondre à toutes vos questions sur l'entretien de vos canapés, le temps de séchage, les taches, nos zones et nos tarifs à Strasbourg.";
  }

  // 4. TEMPS DE SÉCHAGE
  if (/sech|sec|combien de temps|delai|temps.*sech/.test(lower)) {
    return BOT_KNOWLEDGE.sechage;
  }

  // 5. URINE, ODEURS ET ANIMAUX
  if (/urine|pipi|chat|chien|odeur|animaux|poil/.test(lower)) {
    return BOT_KNOWLEDGE.urine;
  }

  // 6. PRIX ET TARIFS
  if (/prix|tarif|combien|cout|devis|estimation/.test(lower)) {
    return BOT_KNOWLEDGE.tarif;
  }

  // 7. ZONES D'INTERVENTION ET COMMUNE
  if (/zone|commune|ou|strasbourg|deplacement|secteur|ville|alsace|rayon/.test(lower)) {
    return BOT_KNOWLEDGE.zone;
  }

  // 8. PRÉPARATION AVANT INTERVENTION
  if (/prepar|avant|deplacer|faire quoi|acces/.test(lower)) {
    return BOT_KNOWLEDGE.preparer;
  }

  // 9. TACHES DIFFICILES (CAFÉ, VIN, GRAS, ETC.)
  if (/cafe|vin|chocolat|gras|sauce|sang|feutre|stylo|nourriture/.test(lower)) {
    return "Nous traitons ces taches au quotidien ! L'injection-extraction à chaud décolle les pigments incrustés sans abîmer les fibres. Conseil important : évitez de frotter avec une éponge avant notre passage pour ne pas fixer la tache.";
  }

  // 10. CUIR ET MATIÈRES DÉLICATES
  if (/cuir|daim|nubuck|velours|lin/.test(lower)) {
    return "Nous intervenons sur les tissus (coton, polyester, microfibre, velours...). Pour le cuir ou les matières très délicates, nous réalisons un diagnostic préalable pour adapter la pression et les produits nettoyants.";
  }

  // 11. NETTOYAGE DE MATELAS ET ACARIENS
  if (/matelas|acarien|punaise|allergie/.test(lower)) {
    return "Oui, nous nettoyons et désinfectons les matelas 1 ou 2 places ! Notre traitement élimine les acariens, la transpiration et les peaux mortes en profondeur pour un couchage parfaitement assaini.";
  }

  // 12. REMERCIEMENTS ET COMPLIMENTS
  if (/merci|super|top|parfait|genial|cool|nickel|impeccable/.test(lower)) {
    return "Avec grand plaisir ! N'hésitez pas si vous avez la moindre autre question. Vous pouvez aussi tester notre configurateur en 2 clics pour obtenir votre tarif immédiat ! ✨";
  }

  // 13. AU REVOIR ET DÉPART
  if (/au revoir|bonne journee|bonne soiree|a bientot|a plus|bye|ciao/.test(lower)) {
    return "Au revoir et excellente journée à vous ! Au plaisir de redonner de l'éclat à votre mobilier chez TClean ! 👋✨";
  }

  // AUCUN MOT-CLÉ SPÉCIAL : renvoie null pour que le vrai ChatGPT prenne le relais
  return null;
}

export function BotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Bonjour ! Je suis l'assistant TClean 🧽. Posez-moi vos questions sur le nettoyage de vos canapés, le temps de séchage ou nos tarifs à Strasbourg !",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, typing]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || typing) return;

    const userMsg: Message = { role: "user", text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textToSend) setInput("");
    setTyping(true);

    // ÉTAPE 1 : Test des mots-clés spéciaux pré-remplis
    const specialReply = getSpecialKeywordAnswer(text);
    if (specialReply) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "bot", text: specialReply }]);
        setTyping(false);
      }, 400);
      return; // CHATGPT EST ARRÊTÉ ICI !
    }

    // ÉTAPE 2 : Si aucun mot-clé spécial, on interroge le vrai modèle ChatGPT
    try {
      const res = await askPublicTcleanBot({
        data: {
          question: text,
          history: nextMessages.slice(-8),
        },
      });
      const reply =
        res?.answer?.trim() || "Je suis à votre écoute ! Comment puis-je vous aider pour votre canapé ou textile ?";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Pour toute question précise ou tarif immédiat, vous pouvez utiliser notre configurateur en ligne ou nous appeler directement au 06 77 69 50 79 !",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Fenêtre de discussion */}
      {open && (
        <div className="mb-4 w-[92vw] max-w-[390px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={botAvatar}
                  alt="TClean Bot"
                  className="w-10 h-10 rounded-full object-cover bg-white/10 p-0.5 border border-white/20"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">TClean Assistant</h3>
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <Sparkles size={11} /> IA en direct • Strasbourg
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-primary-foreground"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <img src={botAvatar} alt="Bot" className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card text-card-foreground border border-border/60 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                <img src={botAvatar} alt="Bot" className="w-6 h-6 rounded-full object-cover" />
                <span className="inline-flex items-center gap-1">
                  TClean Bot réfléchit
                  <span className="inline-flex gap-0.5">
                    <span
                      className="w-1 h-1 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1 h-1 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1 h-1 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          <div className="px-3 py-2 bg-muted/40 border-t border-border/40 overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                disabled={typing}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-background hover:bg-primary/10 hover:text-primary text-foreground/80 border border-border/60 transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Liens d'action */}
          <div className="px-3 py-1.5 bg-background flex items-center justify-between text-[11px] border-t border-border/40 text-muted-foreground">
            <Link
              to="/configurateur"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 hover:text-primary font-medium"
            >
              Calculer mon tarif <ArrowUpRight size={12} />
            </Link>
            <a href="tel:0677695079" className="inline-flex items-center gap-1 hover:text-primary">
              <Phone size={11} /> 06 77 69 50 79
            </a>
          </div>

          {/* Saisie de message */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-background border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={typing ? "L'IA prépare sa réponse..." : "Posez votre question..."}
              disabled={typing}
              className="flex-1 bg-muted/50 rounded-full px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary disabled:opacity-60"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || typing}
              className="rounded-full w-9 h-9 shrink-0"
              aria-label="Envoyer"
            >
              <Send size={15} />
            </Button>
          </form>
        </div>
      )}

      {/* Bouton flottant de la mascotte */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 opacity-80 hover:opacity-100"
        aria-label="Discuter avec l'assistant TClean"
      >
        <div className="bot-cage relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary bg-primary/10 shadow-lg">
          <span className="bot-cage-shine" aria-hidden="true" />
          <img src={botBody} alt="TClean Assistant" className="bot-body" />
          <img src={botSpray} alt="" aria-hidden="true" className="bot-spray" />
          <span className="bot-mist bot-mist-1" aria-hidden="true" />
          <span className="bot-mist bot-mist-2" aria-hidden="true" />
          <span className="bot-mist bot-mist-3" aria-hidden="true" />
          <img src={botSponge} alt="" aria-hidden="true" className="bot-sponge" />
          <span className="bot-bubble bot-bubble-1" aria-hidden="true" />
          <span className="bot-bubble bot-bubble-2" aria-hidden="true" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-background" />
        </span>
        {!open && (
          <div className="hidden sm:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-md border border-border whitespace-nowrap items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <MessageSquare size={13} className="text-primary" />
            Une question ? Posez-la moi !
          </div>
        )}
      </button>
    </div>
  );
}
