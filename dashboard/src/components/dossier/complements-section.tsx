import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  Alert02Icon,
  CheckmarkCircle02Icon,
  File01Icon,
} from "@hugeicons/core-free-icons"

interface ComplementsSectionProps {
  complements: DossierDetailData["complements"]
}

export function ComplementsSection({ complements }: ComplementsSectionProps) {
  return (
    <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} size={16} className="text-stone-700 dark:text-stone-300" />
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Demandes de compléments
          </CardTitle>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {complements.length} demande{complements.length > 1 ? "s" : ""}
        </span>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {complements.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            Aucun complément d'information n'a été demandé pour ce dossier.
          </div>
        ) : (
          <div className="space-y-2.5">
            {complements.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border text-xs transition-colors ${
                  item.isUrgent
                    ? "border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20"
                    : "border-stone-200 dark:border-stone-800 bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium h-5 ${
                        item.status === "RECU"
                          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : item.isUrgent
                          ? "border-rose-300 dark:border-rose-800 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : "border-amber-300 dark:border-amber-800 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-muted-foreground">Échéance :</span>
                    <span className={item.isUrgent ? "font-bold text-rose-600 dark:text-rose-400" : "font-semibold text-stone-900 dark:text-stone-100"}>
                      {item.deadline}
                    </span>
                    {item.isUrgent && (
                      <HugeiconsIcon icon={Alert02Icon} size={14} className="text-rose-600" />
                    )}
                  </div>
                </div>

                {/* Pièces demandées */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Pièces réclamées ({item.missingDocs.length}) :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.missingDocs.map((doc, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700"
                      >
                        <HugeiconsIcon icon={File01Icon} size={11} className="text-muted-foreground" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                {item.receivedAt && (
                  <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-muted-foreground">
                    Réponse reçue le : <span className="font-mono text-stone-900 dark:text-stone-100">{item.receivedAt}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
