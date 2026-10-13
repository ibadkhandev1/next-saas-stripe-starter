import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
export function AuthDivider({ label = "OR" }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
export function AuthField({ id, label, className, ...props }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className={cn("h-10", className)} {...props} />
    </div>
  )
}
// Password input with a reveal toggle. Toggling the type is what shows the
// value; nothing is stored anywhere.
export function AuthPasswordField({
  id,
  label,
  revealed,
  onRevealChange,
  ...props
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          className="h-10 pr-10"
          type={revealed ? "text" : "password"}
          {...props}
        />
        <button
          type="button"
          onClick={() => onRevealChange(!revealed)}
          aria-label={revealed ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {revealed ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  )
}
export function AuthError({ message }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  )
}
const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"]
// A rough score, computed in the browser from the current value. Presentation
// only: it never blocks submission on its own.
export function PasswordStrength({ score }) {
  const clamped = Math.max(0, Math.min(4, score))
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              step <= clamped
                ? clamped <= 1
                  ? "bg-destructive"
                  : clamped === 2
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {STRENGTH_LABELS[clamped]}
      </span>
    </div>
  )
}
export function SubmitButton({ pending = false, children, ...props }) {
  return (
    <Button type="submit" size="lg" className="h-10 w-full" {...props}>
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  )
}
// Social sign-in renders but does not navigate until an OAuth route is wired.
export function GoogleButton({ label = "Continue with Google", onClick }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-10 w-full"
      onClick={onClick}
    >
      <GoogleIcon />
      {label}
    </Button>
  )
}
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3h-4a12 12 0 0 0 0 10.7l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
      />
    </svg>
  )
}
