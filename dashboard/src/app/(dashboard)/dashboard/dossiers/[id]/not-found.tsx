import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, Folder01Icon } from "@hugeicons/core-free-icons"

export default function DossierNotFound() {
  return (
    <div className="h-[400px] flex flex-col items-center justify-center text-center p-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-card">
      <div className="size-10 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center text-stone-600 dark:text-stone-300 mb-3">
        <HugeiconsIcon icon={Folder01Icon} size={20} strokeWidth={2} />
      </div>
      <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
        Dossier introuvable
      </h2>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
        L'identifiant du dossier demandé n'existe pas ou a été supprimé de la base de données.
      </p>
      <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
        <Link href="/dashboard">
          <HugeiconsIcon icon={ArrowLeft02Icon} size={14} strokeWidth={2} />
          Retour à la vue d'ensemble
        </Link>
      </Button>
    </div>
  )
}
