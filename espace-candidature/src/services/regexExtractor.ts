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

  // 3. Détection Montant (ex: 180 000 DH ou 600 000 MAD ou 45 000 €)
  const montantMatch = normalized.match(/(?:(?:total|montant|ttc|ht|subvention|somme)[\s:]*)?(\d{1,3}(?:[\s.]\d{3})*(?:[,\.]\d{2})?)\s*(?:DH|MAD|dirhams?|€|EUR|euros?)\b/i)
    || normalized.match(/(\d{1,3}(?:[\s.]\d{3})*(?:[,\.]\d{2})?)\s*(?:DH|MAD|€|EUR)/i);
  if (montantMatch) {
    const rawVal = montantMatch[1].replace(/\s+/g, ' ').trim();
    const currency = /DH|MAD|dirham/i.test(montantMatch[0]) ? 'DH' : '€';
    result.montant = `${rawVal} ${currency}`;
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
