import { createWorker } from "tesseract.js";
import path from "path";

// Chemin vers les fichiers de langue téléchargés localement
const TESSDATA_PATH = path.join(process.cwd(), "tessdata");

/**
 * Extrait le texte d'une image via OCR (Tesseract.js)
 * Utilise les fichiers de langue locaux pour éviter les téléchargements réseau
 */
export async function extractTextFromImage(imagePath: string): Promise<string> {
  const worker = await createWorker("fra+eng", 1, {
    langPath: TESSDATA_PATH,
    // Désactiver le téléchargement automatique — utiliser les fichiers locaux
    cacheMethod: "none",
    logger: (m: any) => {
      if (m.status === "recognizing text") {
        process.stdout.write(`\r[OCR] ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  try {
    const { data } = await worker.recognize(imagePath);
    process.stdout.write("\n");
    return data.text;
  } finally {
    await worker.terminate();
  }
}

/**
 * Calcule un score de similarité entre deux chaînes (0-100)
 * Algorithme : Jaro-Winkler simplifié + correspondance de tokens
 */
export function computeNameConfidence(extractedText: string, userName: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // supprimer les accents
      .replace(/[^a-z\s]/g, "")
      .trim();

  const textNorm = normalize(extractedText);
  const nameNorm = normalize(userName);

  // Découper le nom en tokens (prénom, nom)
  const nameTokens = nameNorm.split(/\s+/).filter((t) => t.length > 1);

  if (nameTokens.length === 0) return 0;

  let totalScore = 0;
  let found = 0;

  for (const token of nameTokens) {
    if (token.length < 2) continue;

    // Recherche exacte
    if (textNorm.includes(token)) {
      totalScore += 100;
      found++;
      continue;
    }

    // Recherche partielle (au moins 80% du token trouvé)
    const minLen = Math.floor(token.length * 0.8);
    const partial = token.slice(0, minLen);
    if (textNorm.includes(partial)) {
      totalScore += 70;
      found++;
      continue;
    }

    // Recherche avec distance de Levenshtein ≤ 2
    const words = textNorm.split(/\s+/);
    for (const word of words) {
      if (Math.abs(word.length - token.length) <= 2) {
        const dist = levenshtein(word, token);
        if (dist <= 2) {
          totalScore += Math.max(0, 60 - dist * 15);
          found++;
          break;
        }
      }
    }
  }

  if (found === 0) return 0;
  return Math.round(totalScore / nameTokens.length);
}

/** Distance de Levenshtein */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Seuil d'approbation automatique */
export const AUTO_APPROVE_THRESHOLD = 75; // score ≥ 75 → auto-approuvé
