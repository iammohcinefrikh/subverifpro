"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  acceptDossier,
  rejectDossier,
  takeChargeDossier,
  type StatusActionResult,
} from "@/app/(dashboard)/dashboard/dossiers/[id]/actions"
import { statusButtonClass } from "@/lib/status-tone"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Tick02Icon, UserCheck01Icon } from "@hugeicons/core-free-icons"

type ActionKind = "take-charge" | "accept" | "reject"

interface DossierActionsProps {
  applicationId: string
  reference: string
  status: string
}

/**
 * Status workflow actions for a dossier. Each button is tinted with the colour
 * of the status it produces, matching the status badges and dashboard KPIs:
 * CONFORME / INCOMPLETE -> "Prendre en charge" (PENDING, blue)
 * PENDING               -> "Accepter" (ACCEPTED, emerald) or "Rejeter" (REJECTED, rose)
 * ACCEPTED / REJECTED   -> no action available
 */
export function DossierActions({ applicationId, reference, status }: DossierActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = React.useState<ActionKind | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [confirmReject, setConfirmReject] = React.useState(false)
  const [isRefreshing, startRefresh] = React.useTransition()

  const normalizedStatus = status.toUpperCase()
  const isPending = normalizedStatus === "PENDING"
  const canTakeCharge = normalizedStatus === "CONFORME" || normalizedStatus === "INCOMPLETE"

  if (!isPending && !canTakeCharge) {
    return null
  }

  const disabled = busy !== null || isRefreshing

  const run = async (
    kind: ActionKind,
    action: (id: string) => Promise<StatusActionResult>
  ) => {
    setBusy(kind)
    setError(null)

    try {
      const result = await action(applicationId)

      if (!result.ok) {
        setError(result.error ?? "Une erreur est survenue.")
        setBusy(null)
        return
      }

      setConfirmReject(false)
      setBusy(null)
      // Keep the controls disabled until the refreshed status is rendered.
      startRefresh(() => router.refresh())
    } catch (cause) {
      console.error("Dossier status action failed:", cause)
      setError("Une erreur est survenue lors de la mise à jour du dossier.")
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {isPending ? (
          <>
            <Button
              variant="secondary"
              size="lg"
              className={statusButtonClass("ACCEPTED")}
              disabled={disabled}
              onClick={() => run("accept", acceptDossier)}
            >
              <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2} />
              {busy === "accept" ? "Acceptation..." : "Accepter"}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className={statusButtonClass("REJECTED")}
              disabled={disabled}
              onClick={() => setConfirmReject(true)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
              Rejeter
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            className={statusButtonClass("PENDING")}
            disabled={disabled}
            onClick={() => run("take-charge", takeChargeDossier)}
          >
            <HugeiconsIcon icon={UserCheck01Icon} size={16} strokeWidth={2} />
            {busy === "take-charge" ? "Prise en charge..." : "Prendre en charge"}
          </Button>
        )}
      </div>

      {error && (
        <span
          role="alert"
          className="max-w-64 text-right text-[10px] text-rose-600 dark:text-rose-400"
        >
          {error}
        </span>
      )}

      <Dialog open={confirmReject} onOpenChange={setConfirmReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter ce dossier ?</DialogTitle>
            <DialogDescription>
              Le dossier <strong className="font-mono text-stone-900 dark:text-stone-100">{reference}</strong> sera
              marqué comme rejeté. Cette action est définitive et sera enregistrée dans
              l&apos;historique du dossier.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
            <Button
              variant="secondary"
              className={statusButtonClass("REJECTED")}
              disabled={disabled}
              onClick={() => run("reject", rejectDossier)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2} />
              {busy === "reject" ? "Rejet en cours..." : "Confirmer le rejet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}