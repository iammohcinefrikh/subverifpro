import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { DossierDetailData } from "@/lib/queries/dossier"
import { capitalizeFirst, formatDate } from "@/lib/format"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon
} from "@hugeicons/core-free-icons"

interface DemandeurInfoProps {
  application: DossierDetailData["application"]
}

/** Small info tile: label on top, value below, with a slight gap between them. */
const tileClass = "flex flex-col gap-1"
const sectionTitleClass =
  "text-[10px] font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider"
const labelClass = "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
/** Shared value styling so every tile renders with the same font and weight. */
const valueClass = "text-xs font-medium text-stone-900 dark:text-stone-100"

/** Muted section pill — mirrors the card's inner spacing and border radius. */
const sectionBoxClass =
  "rounded-xl border border-transparent bg-muted/50 px-4 py-3.5 flex flex-col gap-4"
/** Vertical rhythm between the tile rows inside a section body. */
const sectionBodyClass = "flex flex-col gap-4"

/**
 * Muted box wrapping one section: a header (title + rule) on top, then the
 * tiles passed as children. Keeps every section visually identical without
 * repeating the header markup at each call site.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={sectionBoxClass}>
      <div className="flex flex-col gap-2">
        <h3 className={sectionTitleClass}>{title}</h3>
        <Separator />
      </div>
      <div className={sectionBodyClass}>{children}</div>
    </div>
  )
}

export function DemandeurInfo({ application }: DemandeurInfoProps) {
  return (
    <Card className="border border-stone-200 dark:border-stone-800 shadow-xs">
      <CardHeader className="p-4 pb-2!">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={UserIcon} size={16} className="text-stone-700 dark:text-stone-300" />
          <CardTitle className="text-xs font-semibold tracking-tight uppercase text-stone-900 dark:text-stone-100">
            Informations du demandeur &amp; projet
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-2 text-xs">

        {/* ── Identité & Coordonnées ─────────────────────────────────── */}
        <Section title="Identité & Coordonnées">
          {/* Row 1 — who they are */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className={`${tileClass} col-span-2 sm:col-span-1`}>
              <span className={labelClass}>Nom complet</span>
              <span className={valueClass}>{application.fullName}</span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>CIN</span>
              <span className={valueClass}>{application.cin || "—"}</span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Date de naissance</span>
              <span className={valueClass}>
                {formatDate(application.dateOfBirth) || "—"}
              </span>
            </div>
          </div>

          {/* Row 2 — how to reach them */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className={`${tileClass} col-span-2 sm:col-span-1`}>
              <span className={labelClass}>E-mail</span>
              <span className={`${valueClass} truncate`}>
                {application.email || "—"}
              </span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Téléphone</span>
              <span className={valueClass}>{application.phone || "—"}</span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Ville &amp; Région</span>
              <span className={valueClass}>
                {application.city || "—"}
                {application.region ? `, ${application.region}` : ""}
              </span>
            </div>
          </div>
        </Section>

        {/* ── Programme & Structure ──────────────────────────────────── */}
        <Section title="Programme & Structure">
          {/* Programme anchors full width */}
          <div className={tileClass}>
            <span className={labelClass}>Programme</span>
            <span className={valueClass}>{application.programName || "—"}</span>
          </div>

          {/* Structure details — 2×2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`${tileClass} col-span-2`}>
              <span className={labelClass}>Raison sociale</span>
              <span className={valueClass}>
                {application.nomOuRaisonSociale || "—"}
              </span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Type de structure</span>
              <span className={valueClass}>
                {application.structureType
                  ? capitalizeFirst(application.structureType)
                  : "—"}
              </span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Secteur</span>
              <span className={valueClass}>
                {application.secteurActivite || "—"}
              </span>
            </div>

            <div className={`${tileClass} col-span-2 sm:col-span-1`}>
              <span className={labelClass}>Ancienneté</span>
              <span className={valueClass}>
                {application.ancienneteAnnees !== null
                  ? `${application.ancienneteAnnees} an${application.ancienneteAnnees > 1 ? "s" : ""}`
                  : "—"}
              </span>
            </div>
          </div>
        </Section>

        {/* ── Projet & Budget ────────────────────────────────────────── */}
        <Section title="Projet & Budget">
          {/* Objet & description span full width */}
          <div className={tileClass}>
            <span className={labelClass}>Objet du projet</span>
            <span className={valueClass}>
              {application.projectObject || "Non renseigné"}
            </span>
          </div>

          {application.projectDescription && (
            <div className={tileClass}>
              <span className={labelClass}>Description détaillée</span>
              <p className={`${valueClass} leading-relaxed`}>
                {application.projectDescription}
              </p>
            </div>
          )}

          {/* Dates left | Amounts right */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={tileClass}>
              <span className={labelClass}>Date début</span>
              <span className={valueClass}>
                {formatDate(application.projectStartDate) || "—"}
              </span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Date fin</span>
              <span className={valueClass}>
                {formatDate(application.projectEndDate) || "—"}
              </span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Coût total</span>
              <span className={valueClass}>
                {application.totalAmount
                  ? `${application.totalAmount.toLocaleString("fr-FR")} MAD`
                  : "—"}
              </span>
            </div>

            <div className={tileClass}>
              <span className={labelClass}>Montant demandé</span>
              <span className={valueClass}>
                {application.requestedAmount
                  ? `${application.requestedAmount.toLocaleString("fr-FR")} MAD`
                  : "—"}
              </span>
            </div>
          </div>
        </Section>

        {/* ── Dépenses ──────────────────────────────────────────────── */}
        <Section title="Dépenses du projet">
          {application.depenses.length === 0 ? (
            <div className="text-muted-foreground">
              Aucune dépense renseignée pour ce projet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {application.depenses.map((depense) => (
                <div key={depense.id} className="flex items-start justify-between gap-3">
                  <span className={`min-w-0 ${valueClass}`}>{depense.libelle}</span>
                  <span className={`${valueClass} shrink-0`}>
                    {depense.montant.toLocaleString("fr-FR")} MAD
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

      </CardContent>
    </Card>
  )
}
