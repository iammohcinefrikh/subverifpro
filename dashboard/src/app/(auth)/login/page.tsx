"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileValidationIcon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await signIn.email({
        email,
        password,
      })

      if (res?.error) {
        setError(res.error.message || "Identifiants invalides. Veuillez vérifier votre adresse e-mail et mot de passe.")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue lors de la connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFillDemo = () => {
    setEmail("jean.dupont@subverif.pro")
    setPassword("Password123!")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100/60 dark:bg-stone-950 p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="size-11 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center shadow-md">
            <HugeiconsIcon icon={FileValidationIcon} size={24} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              SubVerif Pro
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Plateforme d'instruction et d'audit des dossiers
            </p>
          </div>
        </div>

        <Card className="border border-stone-200 dark:border-stone-800 shadow-sm bg-card">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold">Connexion Instructeur</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Entrez vos identifiants pour accéder à votre espace de travail.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-5 pt-0 space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <HugeiconsIcon icon={AlertCircleIcon} size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="instructeur@subverif.pro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-8 text-xs border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Mot de passe
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-8 text-xs border-stone-300 dark:border-stone-700"
                />
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-1 flex flex-col gap-2.5">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-8 text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 transition-colors"
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>

              <div className="w-full pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Compte de démonstration</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  Remplir automatiquement
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground">
          Accès sécurisé réservé aux instructeurs habilités.
        </p>
      </div>
    </div>
  )
}
