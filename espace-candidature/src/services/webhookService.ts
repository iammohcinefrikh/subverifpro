import type { WebhookDossierPayload, WebhookComplementPayload, WebhookResponse } from '../types/webhook';

// URL par défaut si non spécifiée dans .env
export const DEFAULT_WEBHOOK_URL = 'https://stg-orch-api.abafusion.ai/webhook/webhook-v93p8wtjgrud6dksfbtxdn5m/condidat';

export function getWebhookUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('SUBVERIF_CUSTOM_WEBHOOK_URL');
    if (customUrl && customUrl.trim().length > 0) {
      return customUrl.trim();
    }
  }
  return import.meta.env.VITE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
}

export function setCustomWebhookUrl(url: string | null): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim().length > 0) {
      localStorage.setItem('SUBVERIF_CUSTOM_WEBHOOK_URL', url.trim());
    } else {
      localStorage.removeItem('SUBVERIF_CUSTOM_WEBHOOK_URL');
    }
  }
}

export async function sendDossierToWebhook(
  payload: WebhookDossierPayload,
  signal?: AbortSignal,
  customUrl?: string
): Promise<WebhookResponse> {
  const targetUrl = customUrl || getWebhookUrl();

  // En local Vite dev, si l'URL cible pointe vers stg-orch-api.abafusion.ai, on utilise le proxy local pour éliminer les erreurs CORS navigateur
  let effectiveUrl = targetUrl;
  if (import.meta.env.DEV && targetUrl.startsWith('https://stg-orch-api.abafusion.ai')) {
    effectiveUrl = targetUrl.replace('https://stg-orch-api.abafusion.ai', '/api/webhook-proxy');
  }

  try {
    const response = await fetch(effectiveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: signal
    });

    let data: unknown = null;
    let rawText = '';
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // Ignorer
      }
    } else {
      try {
        rawText = await response.text();
      } catch {
        // Ignorer
      }
    }

    if (!response.ok) {
      // Extraire le message retourné par le serveur externe si disponible
      let serverError = '';
      if (data && typeof data === 'object' && 'error' in data) {
        serverError = String((data as { error: unknown }).error);
      } else if (rawText) {
        serverError = rawText.slice(0, 120);
      }

      const detailMsg = serverError
        ? `Le serveur distant a répondu : "${serverError}"`
        : `Le serveur distant a renvoyé une erreur HTTP ${response.status} (${response.statusText || 'Erreur'})`;

      return {
        success: false,
        status: response.status,
        message: detailMsg,
        data: data || rawText
      };
    }

    return {
      success: true,
      status: response.status,
      message: 'Dossier transmis avec succès au système de vérification.',
      data
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        status: 0,
        message: 'L\'envoi du dossier a été annulé.'
      };
    }

    const errorMsg = err instanceof Error ? err.message : 'Erreur réseau inconnue';
    return {
      success: false,
      status: 0,
      message: `Impossible de contacter le webhook externe : ${errorMsg}. Vérifiez votre connexion ou l'URL configurée.`
    };
  }
}

/**
 * Envoie un ensemble de pièces justificatives complémentaires pour un dossier existant.
 * Choix d'architecture : payload dédié minimal ('complement_pieces') évitant de retransmettre
 * tout le dossier initial et ciblant expressément la régularisation de pièces.
 */
export async function sendComplementToWebhook(
  payload: WebhookComplementPayload,
  signal?: AbortSignal,
  customUrl?: string
): Promise<WebhookResponse> {
  const targetUrl = customUrl || getWebhookUrl();

  let effectiveUrl = targetUrl;
  if (import.meta.env.DEV && targetUrl.startsWith('https://stg-orch-api.abafusion.ai')) {
    effectiveUrl = targetUrl.replace('https://stg-orch-api.abafusion.ai', '/api/webhook-proxy');
  }

  try {
    const response = await fetch(effectiveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: signal
    });

    let data: unknown = null;
    let rawText = '';
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        // Ignorer
      }
    } else {
      try {
        rawText = await response.text();
      } catch {
        // Ignorer
      }
    }

    if (!response.ok) {
      let serverError = '';
      if (data && typeof data === 'object' && 'error' in data) {
        serverError = String((data as { error: unknown }).error);
      } else if (rawText) {
        serverError = rawText.slice(0, 120);
      }

      const detailMsg = serverError
        ? `Le serveur distant a répondu : "${serverError}"`
        : `Erreur HTTP ${response.status} lors de l'envoi des compléments`;

      return {
        success: false,
        status: response.status,
        message: detailMsg,
        data: data || rawText
      };
    }

    return {
      success: true,
      status: response.status,
      message: 'Pièces complémentaires transmises avec succès à l\'instructeur.',
      data
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return {
        success: false,
        status: 0,
        message: 'L\'envoi des compléments a été annulé.'
      };
    }

    const errorMsg = err instanceof Error ? err.message : 'Erreur réseau inconnue';
    return {
      success: false,
      status: 0,
      message: `Impossible de contacter le webhook : ${errorMsg}.`
    };
  }
}

