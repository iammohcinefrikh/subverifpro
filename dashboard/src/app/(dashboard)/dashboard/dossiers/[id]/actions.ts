"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import type { ApplicationStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface StatusActionResult {
  ok: boolean
  error?: string
}

/**
 * Statuses a transition may start from. Guards against stale or forged calls,
 * so the buttons shown by the UI are also enforced server-side.
 */
const ALLOWED_SOURCE_STATUSES: Record<string, string[]> = {
  PENDING: ["CONFORME", "INCOMPLETE"],
  ACCEPTED: ["PENDING"],
  REJECTED: ["PENDING"],
}

async function applyStatusChange(
  applicationId: string,
  nextStatus: ApplicationStatus,
  eventType: string,
  eventLabel: string
): Promise<StatusActionResult> {
  try {
    const current = await prisma.application.findUnique({
      where: { applicationId },
      select: { status: true },
    })

    if (!current) {
      return { ok: false, error: "Dossier introuvable." }
    }

    const allowedSources = ALLOWED_SOURCE_STATUSES[nextStatus] ?? []
    if (!allowedSources.includes((current.status ?? "").toUpperCase())) {
      return {
        ok: false,
        error: "Cette action n'est pas disponible pour le statut actuel du dossier.",
      }
    }

    // Resolve the instructor for the audit trail; a session lookup failure must
    // not prevent the status change itself.
    let user: { id: string; name: string } | null = null
    try {
      const session = await auth.api.getSession({ headers: await headers() })
      user = session?.user ?? null
    } catch (sessionError) {
      console.error("Could not resolve the current user for the dossier event:", sessionError)
    }

    await prisma.application.update({
      where: { applicationId },
      data: { status: nextStatus, updatedAt: new Date() },
    })

    // Best-effort audit trail: a failure here must not undo the status change.
    try {
      await prisma.dossierEvent.create({
        data: {
          applicationId,
          userId: user?.id ?? null,
          eventType,
          description: `${eventLabel} par ${user?.name ?? "un instructeur"}`,
        },
      })
    } catch (eventError) {
      console.error(`Could not record the "${eventType}" event for ${applicationId}:`, eventError)
    }

    revalidatePath(`/dashboard/dossiers/${applicationId}`)
    revalidatePath("/dashboard/dossiers")
    revalidatePath("/dashboard")

    return { ok: true }
  } catch (error) {
    console.error(`Error applying "${eventType}" to application ${applicationId}:`, error)
    return { ok: false, error: "Une erreur est survenue lors de la mise à jour du dossier." }
  }
}

/** Instructor takes ownership of the dossier and starts its instruction. */
export async function takeChargeDossier(applicationId: string): Promise<StatusActionResult> {
  return applyStatusChange(applicationId, "PENDING", "PRISE_EN_CHARGE", "Dossier pris en charge")
}

export async function acceptDossier(applicationId: string): Promise<StatusActionResult> {
  return applyStatusChange(applicationId, "ACCEPTED", "ACCEPTATION", "Dossier accepté")
}

export async function rejectDossier(applicationId: string): Promise<StatusActionResult> {
  return applyStatusChange(applicationId, "REJECTED", "REJET", "Dossier rejeté")
}