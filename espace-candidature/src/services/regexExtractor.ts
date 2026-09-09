import type { DocumentType, DetectedFields } from '../types/ocr';
import { DOCUMENT_TYPE_DEFINITIONS } from '../config/documentTypes';

/**
 * Nettoie et normalise le texte extrait (retours à la ligne consécutifs, espaces multiples)
 */
export function cleanExtractedText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Extraction indicative de champs clés à partir de regex
 */
export function extractFieldsFromText(text: string): DetectedFields {
  const result: DetectedFields = {};
  if (!text) return result;

  const normalized = text;

  // 1. Détection Identifiant légal : ICE marocain (15 chiffres commençant par 00) ou SIRET (14 chiffres)
  const idMatch = normalized.match(/\b(00\d{13}|\d{3}\s?\d{3}\s?\d{3}\s?\d{5})\b/);
  if (idMatch) {
    result.siret = idMatch[1].replace(/\s+/g, '');
  }

  // 2. Détection IBAN / RIB (Maroc MA ou France FR)
  const ibanMatch = normalized.match(/\b((?:MA|FR)\s?[0-9]{2}(?:\s?[0-9A-Z]{4}){4,6}\s?[0-9A-Z]{1,4})\b/i);
  if (ibanMatch) {
    result.iban = ibanMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  // 3. Détection Montant : uniquement si un mot-clé de total financier explicite est présent
  // Évite d'extraire des chiffres tronqués ou d'inventer des montants sur des documents sans total unique
  const explicitAmountPatterns = [
    // Total TTC (devis, facture)
    /(?:total\s*ttc|montant\s*ttc)[^:0-9\n\r]{0,30}[\s:]*([0-9][0-9\s.,]*[0-9]|[0-9]+)\s*(?:MAD|DH|dirhams?|€|EUR)?/i,
    // Coût global / Total investissement / Total des besoins
    /(?:co[uû]t\s*global|co[uû]t\s*total|total\s*des\s*besoins)[^:0-9\n\r]{0,40}[\s:]*([0-9][0-9\s.,]*[0-9]|[0-9]+)\s*(?:MAD|DH|dirhams?|€|EUR)?/i,
    // Subvention sollicitée / accordée
    /(?:subvention\s*(?:sollicit[eé]e|demand[eé]e|accord[eé]e)|montant\s*de\s*la\s*subvention)[^:0-9\n\r]{0,30}[\s:]*([0-9][0-9\s.,]*[0-9]|[0-9]+)\s*(?:MAD|DH|dirhams?|€|EUR)?/i,
    // Capital social
    /(?:capital\s*social)[^:0-9\n\r]{0,30}[\s:]*([0-9][0-9\s.,]*[0-9]|[0-9]+)\s*(?:MAD|DH|dirhams?|€|EUR)?/i,
    // Montant du crédit / Montant total / Total général / Total HT
    /(?:montant\s*du\s*cr[eé]dit|montant\s*total|total\s*g[eé]n[eé]ral|total\s*ht)[^:0-9\n\r]{0,30}[\s:]*([0-9][0-9\s.,]*[0-9]|[0-9]+)\s*(?:MAD|DH|dirhams?|€|EUR)?/i,
    // Cotisations CNSS
    /(?:cotisation(?:s)?\s*(?:cnss|pay[eé]es?)?)[^:0-9\n\r]{0,30}[\s:]*([0-9][0-9\s.,]*[0-9]|[0-9]+)\s*(?:MAD|DH|dirhams?|€|EUR)?/i,
    // Chiffre d'affaires annuel total / Résultat net
    /(?:chiffre\s*d['\s]affaires\s*net\s*ht|r[eé]sultat\s*net\s*comptable)[^:0-9\n\r]{0,30}[\s:]*([0-9][0-9\s.,]*[0-9]|[0-9]+)\s*(?:MAD|DH|dirhams?|€|EUR)?/i
  ];

  for (const pattern of explicitAmountPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const parts = match[1].trim().split(/[.,]/);
      const intPart = parseInt(parts[0].replace(/\s/g, ''), 10);
      if (!isNaN(intPart) && intPart > 0) {
        const formattedInt = intPart.toLocaleString('fr-FR');
        const decPart = parts.length > 1 && parts[1].length <= 2 ? ',' + parts[1] : '';
        result.montant = `${formattedInt}${decPart} MAD`;
        break;
      }
    }
  }

  // 4. Détection Date (formats JJ/MM/AAAA ou JJ-MM-AAAA ou texte "15 janvier 2026")
  const dateNumMatch = normalized.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-.](0?[1-9]|1[012])[\/\-.](20\d\d|19\d\d)\b/);
  if (dateNumMatch) {
    result.date = dateNumMatch[0];
  } else {
    const dateTextMatch = normalized.match(/\b(0?[1-9]|[12][0-9]|3[01])\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s+(20\d\d)\b/i);
    if (dateTextMatch) {
      result.date = dateTextMatch[0];
    }
  }

  return result;
}

/**
 * Heuristique de suggestion du type de document selon les mots-clés rencontrés
 */
export function suggestDocumentType(text: string, fileName?: string): DocumentType {
  const lowerText = (text + ' ' + (fileName || '')).toLowerCase();

  let bestType: DocumentType = 'autre';
  let maxScore = 0;

  for (const def of DOCUMENT_TYPE_DEFINITIONS) {
    if (def.type === 'autre' || def.keywords.length === 0) continue;

    let score = 0;
    for (const kw of def.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        // Mots clés plus longs et précis ont un poids supérieur
        score += kw.length > 5 ? 2 : 1;
      }
    }

    // Bonus si le nom de fichier contient le type
    if (fileName && fileName.toLowerCase().includes(def.type)) {
      score += 3;
    }

    if (score > maxScore && score >= 2) {
      maxScore = score;
      bestType = def.type;
    }
  }

  return bestType;
}
