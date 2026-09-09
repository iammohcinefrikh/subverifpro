import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { cleanExtractedText, extractFieldsFromText, suggestDocumentType } from './regexExtractor';
import type { DocumentType, DetectedFields } from '../types/ocr';

// Configuration du worker PDF.js (CDN unpkg avec fallback sécurisé)
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Erreur de configuration du worker PDF.js :', e);
  }
}

export interface OcrResult {
  texte: string;
  methode: 'pdf_natif' | 'pdf_scanne_tesseract' | 'image_tesseract' | 'saisie_manuelle';
  type_suggere?: DocumentType;
  champs_detectes: DetectedFields;
  succes: boolean;
  erreur?: string;
}

export type ProgressCallback = (progressPercent: number, statusMessage: string) => void;

/**
 * Lit un fichier File en ArrayBuffer pour pdf.js
 */
function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Impossible de lire le fichier en mémoire.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Convertit un fichier File en chaîne Base64 (Data URL)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Erreur lors de la conversion Base64.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Extrait le texte d'une image avec Tesseract.js (langue française)
 */
export async function extractTextFromImage(
  imageSource: File | Blob | string | HTMLCanvasElement,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.(10, 'Initialisation du moteur OCR Tesseract...');

  const worker = await createWorker('fra', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        const percent = Math.round(m.progress * 100);
        onProgress?.(percent, `Reconnaissance des caractères (${percent}%)...`);
      } else if (m.status) {
        onProgress?.(25, `Chargement du modèle linguistique français...`);
      }
    }
  });

  try {
    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    return ret.data.text || '';
  } catch (err) {
    try {
      await worker.terminate();
    } catch {
      // Ignorer
    }
    throw err;
  }
}

/**
 * Tente d'abord l'extraction native PDF. Si < 20 caractères, bascule sur le rendu Canvas + Tesseract.js
 */
export async function extractTextFromPdf(
  file: File,
  onProgress?: ProgressCallback
): Promise<{ text: string; method: 'pdf_natif' | 'pdf_scanne_tesseract' }> {
  onProgress?.(10, 'Analyse de la structure du PDF...');
  const arrayBuffer = await fileToArrayBuffer(file);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/cmaps/`,
    cMapPacked: true
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullNativeText = '';

  onProgress?.(25, `Lecture du texte natif (${numPages} page(s))...`);

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str || '')
      .filter((s: string) => s.trim().length > 0);

    fullNativeText += pageStrings.join(' ') + '\n';
  }

  const cleanedNative = cleanExtractedText(fullNativeText);

  // Si le texte extrait natif est suffisant (>= 20 caractères), on le retourne directement
  if (cleanedNative.length >= 20) {
    onProgress?.(100, 'Extraction du texte natif terminée.');
    return { text: cleanedNative, method: 'pdf_natif' };
  }

  // Fallback : PDF scanné -> Rendu de chaque page sur canvas puis Tesseract OCR
  onProgress?.(30, `Document PDF scanné détecté. Préparation du rendu graphique...`);

  let aggregatedScannedText = '';
  // Limiter à max 5 pages pour éviter la surcharge mémoire sur le client
  const maxPagesToOcr = Math.min(numPages, 5);

  for (let pageNum = 1; pageNum <= maxPagesToOcr; pageNum++) {
    onProgress?.(
      Math.round(30 + ((pageNum - 1) / maxPagesToOcr) * 60),
      `OCR de la page scannée ${pageNum}/${maxPagesToOcr}...`
    );

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 }); // Bonne résolution pour l'OCR

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Impossible d\'instancier le contexte graphique Canvas');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderContext: any = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    // Passage du canvas dans Tesseract
    const pageOcrText = await extractTextFromImage(canvas, (percent, subMsg) => {
      const globalPercent = Math.round(30 + ((pageNum - 1 + percent / 100) / maxPagesToOcr) * 65);
      onProgress?.(globalPercent, `Page ${pageNum}/${maxPagesToOcr} : ${subMsg}`);
    });

    aggregatedScannedText += `\n--- Page ${pageNum} ---\n` + pageOcrText;
  }

  onProgress?.(100, 'Reconnaissance optique du PDF terminée.');
  return {
    text: cleanExtractedText(aggregatedScannedText),
    method: 'pdf_scanne_tesseract'
  };
}

/**
 * Orchestrateur principal OCR pour n'importe quel fichier (Image ou PDF) avec gestion de timeout
 */
export async function processFileOcr(
  file: File,
  onProgress?: ProgressCallback,
  timeoutMs: number = 75000
): Promise<OcrResult> {
  const ocrPromise = (async (): Promise<OcrResult> => {
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    let rawText = '';
    let method: 'pdf_natif' | 'pdf_scanne_tesseract' | 'image_tesseract' = 'image_tesseract';

    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
      const pdfResult = await extractTextFromPdf(file, onProgress);
      rawText = pdfResult.text;
      method = pdfResult.method;
    } else if (
      mimeType.startsWith('image/') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg')
    ) {
      method = 'image_tesseract';
      rawText = await extractTextFromImage(file, onProgress);
    } else {
      throw new Error(`Format de fichier non pris en charge pour l'OCR : ${file.type || fileName}`);
    }

    const cleaned = cleanExtractedText(rawText);
    const champs = extractFieldsFromText(cleaned);
    const typeSuggere = suggestDocumentType(cleaned, file.name);

    return {
      texte: cleaned,
      methode: method,
      type_suggere: typeSuggere,
      champs_detectes: champs,
      succes: true
    };
  })();

  // Gestion du Timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Délai d'attente OCR dépassé (${Math.round(timeoutMs / 1000)}s). Vous pouvez saisir le texte manuellement.`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([ocrPromise, timeoutPromise]);
  } catch (error) {
    console.error('Erreur OCR lors du traitement du fichier', file.name, error);
    return {
      texte: '',
      methode: 'saisie_manuelle',
      champs_detectes: {},
      succes: false,
      erreur: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'OCR'
    };
  }
}
