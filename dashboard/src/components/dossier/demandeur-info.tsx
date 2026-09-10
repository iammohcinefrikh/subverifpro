import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon
} from "@hugeicons/core-free-icons"

interface DemandeurInfoProps {
  application: DossierDetailData["application"]
}

export function DemandeurInfo({ application }: DemandeurInfoProps) {
  return (
    <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-4 pb-2 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={UserIcon} size={16} className="text-stone-700 dark:text-stone-300" />
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Informations du demandeur & projet
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Identité & Coordonnées */}
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Identité & Coordonnées
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Nom complet</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100">
                {application.fullName}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">CIN</span>
              <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                {application.cin || "—"}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Date de naissance</span>
              <span className="font-mono text-stone-900 dark:text-stone-100">
                {application.dateOfBirth || "—"}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">E-mail</span>
              <span className="font-mono text-stone-900 dark:text-stone-100 truncate block">
                {application.email || "—"}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Téléphone</span>
              <span className="font-mono text-stone-900 dark:text-stone-100">
                {application.phone || "—"}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Ville & Région</span>
              <span className="text-stone-900 dark:text-stone-100">
                {application.city || "—"}{application.region ? `, ${application.region}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Structure / Entreprise */}
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Structure & Activité
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Raison sociale</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {application.nomOuRaisonSociale || "—"}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Type de structure</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {application.structureType || "—"}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Secteur</span>
              <span className="text-stone-900 dark:text-stone-100">
                {application.secteurActivite || "—"}
              </span>
            </div>

            <div className="p-2.5 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] text-muted-foreground block">Ancienneté</span>
              <span className="font-mono text-stone-900 dark:text-stone-100">
                {application.ancienneteAnnees !== null ? `${application.ancienneteAnnees} an(s)` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Projet & Financement */}
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Projet & Budget
          </h3>
          <div className="p-3 rounded-md bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800 space-y-2.5">
            <div>
              <span className="text-[10px] text-muted-foreground block">Objet du projet</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {application.projectObject || "Non renseigné"}
              </span>
            </div>

            {application.projectDescription && (
              <div>
                <span className="text-[10px] text-muted-foreground block">Description détaillée</span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-xs">
                  {application.projectDescription}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200/60 dark:border-stone-800">
              <div>
                <span className="text-[10px] text-muted-foreground block">Date début</span>
                <span className="font-mono text-stone-900 dark:text-stone-100">
                  {application.projectStartDate || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Date fin</span>
                <span className="font-mono text-stone-900 dark:text-stone-100">
                  {application.projectEndDate || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Coût total</span>
                <span className="font-mono font-semibold text-stone-900 dark:text-stone-100">
                  {application.totalAmount ? `${application.totalAmount.toLocaleString("fr-FR")} MAD` : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Montant demandé</span>
                <span className="font-mono font-bold text-primary">
                  {application.requestedAmount ? `${application.requestedAmount.toLocaleString("fr-FR")} MAD` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
