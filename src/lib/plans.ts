export type Plan = "gratuit" | "starter" | "pro" | "elite";

export type Feature = {
  label: string;
  gratuit: boolean;
  starter: boolean;
  pro: boolean;
  elite: boolean;
};

export const FEATURES: Feature[] = [
  { label: "Profil public",                    gratuit: true,  starter: true,  pro: true,  elite: true  },
  { label: "Réservations en ligne",            gratuit: true,  starter: true,  pro: true,  elite: true  },
  { label: "Messages directs",                 gratuit: true,  starter: true,  pro: true,  elite: true  },
  { label: "5 créneaux de disponibilité",      gratuit: true,  starter: false, pro: false, elite: false },
  { label: "20 créneaux de disponibilité",     gratuit: false, starter: true,  pro: false, elite: false },
  { label: "Disponibilités illimitées",        gratuit: false, starter: false, pro: true,  elite: true  },
  { label: "Photos & vidéos sur la vitrine",   gratuit: false, starter: true,  pro: true,  elite: true  },
  { label: "Témoignages clients",              gratuit: false, starter: true,  pro: true,  elite: true  },
  { label: "Packs de séances (3 max)",         gratuit: false, starter: true,  pro: false, elite: false },
  { label: "Packs de séances illimités",       gratuit: false, starter: false, pro: true,  elite: true  },
  { label: "Statistiques de base",             gratuit: false, starter: true,  pro: true,  elite: true  },
  { label: "Groupes de discussion",            gratuit: false, starter: false, pro: true,  elite: true  },
  { label: "Fil d'actualité / publications",   gratuit: false, starter: false, pro: true,  elite: true  },
  { label: "Export calendrier (iCal)",         gratuit: false, starter: false, pro: true,  elite: true  },
  { label: "Documents clients",                gratuit: false, starter: false, pro: true,  elite: true  },
  { label: "Rappels email automatiques J-1",   gratuit: false, starter: false, pro: false, elite: true  },
  { label: "Mise en avant dans la recherche",  gratuit: false, starter: false, pro: false, elite: true  },
  { label: "Badge Elite visible",              gratuit: false, starter: false, pro: false, elite: true  },
  { label: "Statistiques avancées",            gratuit: false, starter: false, pro: false, elite: true  },
  { label: "Support prioritaire",              gratuit: false, starter: false, pro: false, elite: true  },
];

export const PLANS = {
  gratuit: {
    nom: "Gratuit",
    prix: 0,
    description: "Pour démarrer et tester la plateforme sans engagement.",
    couleur: "#6b7280",
    gradient: "linear-gradient(135deg, #e5e7eb, #f3f4f6)",
    couleurTexte: "#374151",
    limites: { disponibilites: 5, packs: 0 },
    features: [
      "Profil public basique",
      "5 disponibilités",
      "Réservations illimitées",
      "Messages directs",
    ],
  },
  starter: {
    nom: "Starter",
    prix: 17,
    description: "Pour les coachs qui débutent et veulent une vitrine complète.",
    priceId: process.env.STRIPE_PRICE_STARTER!,
    couleur: "#C9A96E",
    gradient: "linear-gradient(135deg, #C9A96E, #E8D5A3)",
    couleurTexte: "#0B1120",
    limites: { disponibilites: 20, packs: 3 },
    features: [
      "Tout le gratuit",
      "20 disponibilités",
      "Vitrine (photos, vidéos, témoignages)",
      "Packs de séances (3 max)",
      "Stats de base",
    ],
  },
  pro: {
    nom: "Pro",
    prix: 47,
    description: "Pour les coachs actifs qui veulent gérer leur activité en autonomie.",
    priceId: process.env.STRIPE_PRICE_PRO!,
    couleur: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    couleurTexte: "#fff",
    limites: { disponibilites: Infinity, packs: Infinity },
    features: [
      "Tout Starter",
      "Disponibilités illimitées",
      "Packs illimités",
      "Groupes de discussion",
      "Fil d'actualité / publications",
      "Export iCal",
      "Documents clients",
    ],
  },
  elite: {
    nom: "Elite",
    prix: 97,
    description: "Pour les coachs professionnels qui veulent se démarquer et scaler.",
    priceId: process.env.STRIPE_PRICE_ELITE!,
    couleur: "#0B1120",
    gradient: "linear-gradient(135deg, #0B1120, #1a2540)",
    couleurTexte: "#C9A96E",
    limites: { disponibilites: Infinity, packs: Infinity },
    features: [
      "Tout Pro",
      "Rappels email automatiques J-1",
      "Mise en avant dans la recherche",
      "Badge Elite visible",
      "Stats avancées",
      "Support prioritaire",
    ],
  },
} as const;

export function canAccess(plan: Plan, feature: "vitrine" | "packs" | "groupes" | "publications" | "ical" | "documents" | "rappels" | "mise_en_avant"): boolean {
  const acces: Record<typeof feature, Plan[]> = {
    vitrine:       ["starter", "pro", "elite"],
    packs:         ["starter", "pro", "elite"],
    groupes:       ["pro", "elite"],
    publications:  ["pro", "elite"],
    ical:          ["pro", "elite"],
    documents:     ["pro", "elite"],
    rappels:       ["elite"],
    mise_en_avant: ["elite"],
  };
  return acces[feature].includes(plan);
}

export function maxDisponibilites(plan: Plan): number {
  return PLANS[plan].limites.disponibilites;
}

export function maxPacks(plan: Plan): number {
  return PLANS[plan].limites.packs;
}
