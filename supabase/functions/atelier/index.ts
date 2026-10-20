// Atelier — passerelle IA de l'app iOS.
// L'app n'a jamais la clé Claude : elle envoie { task, profile, input } ici, la fonction construit la consigne
// à partir du profil du créateur et renvoie un JSON validé par schéma (structured outputs).
//
// Local :      ANTHROPIC_API_KEY=… deno run --allow-net --allow-env supabase/functions/atelier/index.ts
// Sans clé :   la fonction répond en mode démo (exemples fixes, champ demo: true) pour tester l'app.
// Supabase :   supabase functions deploy atelier && supabase secrets set ANTHROPIC_API_KEY=…
import Anthropic from '@anthropic-ai/sdk';

const MODEL = Deno.env.get('ATELIER_MODEL') ?? 'claude-opus-5-5';
const MAX_INPUT = 4000; // caractères par champ texte
const MAX_IMAGE = 5_000_000; // base64

type Profile = {
  prenom: string;
  plateformes: string[];
  niche: string;
  audience: string;
  objectif: string;
  ton?: string;
  regles?: string;
};

type Task = 'missions' | 'tournage' | 'accroche';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ---------- consignes ----------

function portrait(p: Profile): string {
  return [
    `Le créateur : ${p.prenom}.`,
    `Plateformes : ${p.plateformes.join(', ')}.`,
    `Sa niche : ${p.niche}.`,
    `Son audience : ${p.audience || 'non précisée'}.`,
    `Son objectif : ${p.objectif}.`,
    p.ton ? `Son ton : ${p.ton}.` : '',
    p.regles ? `Ses règles permanentes (à respecter dans tout ce que tu proposes) : ${p.regles}.` : '',
  ].filter(Boolean).join('\n');
}

const STYLE = `Comment tu écris :
- Tutoiement, phrases courtes, concret. Des choses qu'on peut faire, filmer ou dire telles quelles.
- Rien de générique : « capte l'attention », « sois authentique », « crée du lien », « sois plus percutant » sont interdits.
- N'invente aucun fait (horaires, prix, noms, chiffres) absent du message.
- Le défaut principal d'abord, pas de compliment de remplissage.`;

const SYSTEM: Record<Task, string> = {
  missions: `Tu proposes au créateur ses missions stories du jour : 2 ou 3 petites choses à poster en story, comme des missions à cocher. Ce n'est pas grave s'il n'y arrive pas, donc chaque mission se fait en 30 secondes depuis son téléphone.

Pourquoi l'interaction passe avant tout : chaque fois qu'un abonné vote, répond ou réagit, la plateforme le rapproche du créateur et lui montre davantage ses contenus. Une story sans sticker ne crée aucun lien.

Règles :
- CHAQUE mission porte un sticker qui fait réagir, sauf une story « résultat » qui ferme la boucle d'un sondage précédent.
- UN SEUL GESTE : les stickers en un tap (sondage, curseur émoji, quiz) font environ 15 fois plus d'interactions que ceux où il faut écrire. Sondage, curseur ou quiz par défaut ; une boîte à questions au plus une fois par jour, seulement si une réponse écrite a une vraie valeur.
- Moins mais mieux : pas de mission de remplissage. Si elle n'apporte rien de concret au créateur, ne la propose pas.
- Formats à varier : « Laquelle tu préfères ? » (deux contenus, sondage haut/bas), avant/après, « Devine où / devine combien » (quiz à 3 choix), coulisses avec sondage « je commence par lequel ? », curseur émoji sur un contenu fort, « Ajoute le tien », partage du dernier post avec un sticker, défi de la semaine.
- UNE SUITE LOGIQUE : si les missions récentes (données dans le message) ont posé une question, la mission suivante est sa suite directe (le résultat du sondage 20 h après, les meilleures réponses repartagées). Jamais de sondage sur une story de résultat : curseur émoji ou rien.
- Collées à la vraie journée du créateur (donnée dans le message) et à sa niche. Dans l'ordre de la journée, chacune avec son moment.
- « pourquoi » répond à « ça me sert à quoi ? » : ce que la story rapporte au créateur, en une phrase concrète.
- Le texte à l'écran et le sticker sont donnés mot pour mot, prêts à recopier.

${STYLE}`,

  tournage: `Tu prépares le tournage d'une vidéo courte (reel, TikTok, short) avant que le créateur parte filmer. Il filme souvent seul.

Règles :
- Les accroches tiennent dans les 2 premières secondes : une image qui arrête le pouce (visage proche, action en cours, contraste) et une phrase qui promet, intrigue ou contredit. Jamais de mise en route (« Bon les gars », « Alors aujourd'hui »).
- Juste après l'accroche vient le 2e moment le plus fort de la vidéo, jamais un temps calme.
- Les créateurs rentrent souvent avec 90 % de selfie : les plans à ramener montrent surtout les autres, l'action et les détails, avec des nombres et des durées précis (« 3 plans de 4 s sur les mains »).
- Toujours demander l'accord avant de filmer quelqu'un de près.
- Chaque accroche respecte la niche et le ton du créateur.

${STYLE}`,

  accroche: `Tu analyses l'accroche d'une vidéo courte (les 3 premières secondes) avant qu'elle soit postée. Ton travail : dire si les gens vont zapper, pourquoi, et comment l'éviter.

Ce que tu regardes :
- La première image : arrête-t-elle le pouce (visage proche, action en cours, contraste, texte lisible) ou est-ce un plan d'installation vide ?
- La première phrase : promesse, tension, question, chiffre, contradiction… ou une mise en route qui fait perdre les premières secondes ?
- Le texte à l'écran : présent, lisible, dit-il la même chose que la voix ou autre chose d'utile ?
- L'accord entre l'image et la phrase.

Tu cites les mots exacts et décris l'image exacte. Si une info manque (pas d'image, pas de texte à l'écran), dis-le au lieu d'inventer.
Les réécritures gardent le sujet et le ton du créateur.

${STYLE}`,
};

// ---------- schémas de sortie ----------

const str = { type: 'string' };
const obj = (properties: Record<string, unknown>) => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const SCHEMA: Record<Task, Record<string, unknown>> = {
  missions: obj({
    missions: {
      type: 'array',
      items: obj({
        titre: str,
        moment: str,
        quoi: str,
        texte_ecran: str,
        sticker: obj({ type: { type: 'string', enum: ['sondage', 'curseur', 'quiz', 'questions', 'lien', 'ajoute_le_tien', 'aucun'] }, question: str, reponses: { type: 'array', items: str } }),
        pourquoi: str,
      }),
    },
    conseil: str,
  }),
  tournage: obj({
    objectif: str,
    accroches: { type: 'array', items: obj({ image: str, phrase: str, texte_ecran: str }) },
    plans: { type: 'array', items: obj({ plan: str, combien: str }) },
    phrases: { type: 'array', items: str },
    a_eviter: { type: 'array', items: str },
  }),
  accroche: obj({
    note: { type: 'integer' },
    verdict: str,
    defaut_principal: str,
    image: str,
    phrase: str,
    texte_ecran: str,
    reecritures: { type: 'array', items: obj({ phrase: str, image: str }) },
  }),
};

// ---------- message utilisateur ----------

const clip = (v: unknown) => (typeof v === 'string' ? v.slice(0, MAX_INPUT) : '');

function userContent(task: Task, input: Record<string, unknown>): Anthropic.Beta.BetaContentBlockParam[] {
  const today = clip(input.date) || new Date().toISOString().slice(0, 10);
  if (task === 'missions') {
    const recent = Array.isArray(input.recent) ? JSON.stringify(input.recent).slice(0, MAX_INPUT) : '[]';
    return [{
      type: 'text',
      text: `Date : ${today}.\nCe que je fais aujourd'hui : ${clip(input.journee) || 'rien de prévu de spécial'}.\nMES MISSIONS DES DERNIERS JOURS (pour les suites) : ${recent}\n\nPropose mes missions stories du jour (2 ou 3).`,
    }];
  }
  if (task === 'tournage') {
    return [{
      type: 'text',
      text: `Date du tournage : ${clip(input.date) || today}.\nLe sujet : ${clip(input.sujet)}\n\nPrépare mon tournage : l'objectif, 3 accroches prêtes à filmer, les plans à ramener, les phrases à dire, ce qu'il ne faut pas faire.`,
    }];
  }
  const blocks: Anthropic.Beta.BetaContentBlockParam[] = [];
  const image = typeof input.image === 'string' ? input.image : '';
  if (image && image.length <= MAX_IMAGE) {
    const media = (clip(input.image_type) || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';
    blocks.push({ type: 'image', source: { type: 'base64', media_type: media, data: image } });
  }
  blocks.push({
    type: 'text',
    text: [
      image ? 'Ci-dessus : la première image de la vidéo.' : 'Pas d\'image fournie.',
      `Première phrase dite : ${clip(input.phrase) || '(aucune)'}`,
      `Texte à l'écran : ${clip(input.texte_ecran) || '(aucun)'}`,
      `Description de la première image : ${clip(input.description) || '(aucune)'}`,
      `Sujet de la vidéo : ${clip(input.sujet) || '(non précisé)'}`,
      '',
      'Note mon accroche sur 10, donne le défaut principal et 3 réécritures.',
    ].join('\n'),
  });
  return blocks;
}

// ---------- démo (sans clé) ----------

const DEMO: Record<Task, unknown> = {
  missions: {
    missions: [
      { titre: 'Laquelle tu préfères ?', moment: 'Au réveil', quoi: 'Deux de tes derniers contenus l\'un au-dessus de l\'autre.', texte_ecran: 'LAQUELLE ?', sticker: { type: 'sondage', question: '', reponses: ['Celle du haut', 'Celle du bas'] }, pourquoi: 'Un sondage posté tôt est vu matin, midi et soir : ceux qui votent reviendront voir le résultat demain.' },
      { titre: 'Coulisses en un tap', moment: 'Vers 13 h', quoi: 'Ton matériel posé sur la table, en une photo.', texte_ecran: 'MON SAC AUJOURD\'HUI', sticker: { type: 'quiz', question: 'Je pars filmer quoi ?', reponses: ['Un marché', 'Un concert', 'Un atelier'] }, pourquoi: 'Le quiz se joue en un geste et te dit ce que ton audience a envie de voir.' },
    ],
    conseil: 'Mode démo : ajoute la clé Claude côté serveur pour des missions faites sur ta journée.',
  },
  tournage: {
    objectif: 'Une vidéo de 30 s qui fait découvrir le lieu par les gens qui le font vivre.',
    accroches: [
      { image: 'Gros plan sur des mains au travail, sans contexte.', phrase: 'Personne ne sait que ça se fabrique ici.', texte_ecran: 'À 200 M DE CHEZ TOI' },
      { image: 'Toi face caméra, déjà en train de marcher vers l\'entrée.', phrase: 'J\'ai 3 minutes pour comprendre pourquoi il y a la queue.', texte_ecran: '3 MINUTES' },
      { image: 'Le résultat final en plein cadre.', phrase: 'Voilà ce qui sort de cette porte chaque matin.', texte_ecran: 'CHAQUE MATIN' },
    ],
    plans: [
      { plan: 'Les mains en action', combien: '4 plans de 3 s' },
      { plan: 'Les visages des gens (avec leur accord)', combien: '3 plans de 4 s' },
      { plan: 'Détails : matière, outils, enseigne', combien: '5 plans de 2 s' },
    ],
    phrases: ['Depuis combien de temps vous faites ça ?', 'Le truc que les gens ne savent pas, c\'est quoi ?'],
    a_eviter: ['Commencer par un plan large de la rue vide.', 'Plus de 30 % de selfie.'],
  },
  accroche: {
    note: 5,
    verdict: 'On comprend le sujet, mais rien ne donne envie de rester avant la 3e seconde.',
    defaut_principal: 'La phrase commence par une mise en route : elle annonce au lieu de promettre.',
    image: 'Mode démo : pas d\'analyse d\'image.',
    phrase: 'La promesse arrive trop tard dans la phrase.',
    texte_ecran: 'Absent : en son coupé, on ne sait pas de quoi parle la vidéo.',
    reecritures: [
      { phrase: 'Personne ne m\'avait dit ça avant de commencer.', image: 'Gros plan sur ton visage, déjà en mouvement.' },
      { phrase: 'J\'ai testé pendant 7 jours, voilà le résultat.', image: 'Le résultat final en premier plan.' },
      { phrase: 'Tu fais sûrement cette erreur.', image: 'L\'erreur montrée en action.' },
    ],
  },
};

// ---------- serveur ----------

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

function validProfile(p: unknown): p is Profile {
  const x = p as Profile;
  return !!x && typeof x.prenom === 'string' && Array.isArray(x.plateformes) && typeof x.niche === 'string' && typeof x.objectif === 'string';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST seulement' }, 405);

  let body: { task?: Task; profile?: unknown; input?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON invalide' }, 400);
  }
  const task = body.task;
  if (!task || !(task in SCHEMA)) return json({ error: 'Tâche inconnue' }, 400);
  if (!validProfile(body.profile)) return json({ error: 'Profil incomplet' }, 400);
  const input = body.input ?? {};
  if (task === 'tournage' && !clip(input.sujet).trim()) return json({ error: 'Donne le sujet du tournage' }, 400);
  if (task === 'accroche' && !clip(input.phrase).trim() && !input.image && !clip(input.description).trim()) {
    return json({ error: 'Donne au moins la première phrase, une image ou une description' }, 400);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ demo: true, result: DEMO[task] });

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort: task === 'missions' ? 'low' : 'medium', format: { type: 'json_schema', schema: SCHEMA[task] } },
      system: `${SYSTEM[task]}\n\n${portrait(body.profile)}`,
      messages: [{ role: 'user', content: userContent(task, input) }],
    } as Anthropic.Beta.MessageCreateParamsNonStreaming);

    if (response.stop_reason === 'refusal') return json({ error: 'Demande refusée par le modèle, reformule-la.' }, 422);
    if (response.stop_reason === 'max_tokens') return json({ error: 'Réponse trop longue, réessaie.' }, 502);
    const text = response.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') return json({ error: 'Réponse vide' }, 502);
    return json({ demo: false, result: JSON.parse(text.text) });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'Trop de demandes, réessaie dans une minute.' }, 429);
    if (err instanceof Anthropic.APIError) {
      console.error('anthropic', err.status, err.message);
      return json({ error: 'Le service IA ne répond pas.' }, 502);
    }
    console.error(err);
    return json({ error: 'Erreur interne' }, 500);
  }
});
