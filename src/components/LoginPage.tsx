import { useId, useState, type FormEvent } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  ShieldCheck,
  Store,
  TriangleAlert,
  UserRound,
} from "lucide-react";

/*
 * Venue Vue sign-in screen.
 *
 * Real email/password sign-in against the backend. The signed-in user's role
 * is looked up automatically from their account — it is never picked on
 * screen. No global layout components are touched.
 */

const INVALID_CREDENTIALS =
  "Invalid credentials. Check your email and password, then try again.";

function mapAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return INVALID_CREDENTIALS;
  if (/email not confirmed/i.test(message))
    return "This account hasn't been confirmed yet. Ask your venue admin for help.";
  if (/too many requests/i.test(message))
    return "Too many attempts. Wait a moment, then try again.";
  return message || INVALID_CREDENTIALS;
}

function LogoMark() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-3 rounded-full opacity-60 blur-xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 45%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-gold-glow)]">
        <Store className="size-7" aria-hidden="true" />
      </div>
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const showEmailError = touched.email && emailError !== null;
  const showPasswordError = touched.password && passwordError !== null;

  function handleEmailBlur() {
    setTouched((t) => ({ ...t, email: true }));
  }

  function handlePasswordBlur() {
    setTouched((t) => ({ ...t, password: true }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice(null);
    setTouched({ email: true, password: true });

    if (emailError !== null || passwordError !== null) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setFormError(mapAuthError(error.message));
        return;
      }

      // Role is resolved in the background from the signed-in account —
      // never chosen on screen.
      if (data.user) {
        await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .limit(1);
      }

      await router.navigate({ to: "/dashboard" });
    } catch {
      setFormError("Sign-in failed. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleForgotPassword() {
    setFormError(null);
    setNotice("Password reset isn't set up yet — ask your venue admin for help.");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Ambient stage lighting — token-based, dark-first */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 32rem at 50% -12rem, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%), radial-gradient(48rem 30rem at 100% 100%, color-mix(in oklab, var(--secondary) 55%, transparent), transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="interactive-card rounded-3xl border border-border/70 bg-card/90 p-8 shadow-[var(--shadow-lift)] backdrop-blur-md sm:p-10">
          {/* Branding */}
          <div className="flex flex-col items-center text-center">
            <LogoMark />
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground">
              Venue Vue
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Event POS &amp; Venue Management System
            </p>
          </div>

          {/* Form-level error */}
          {formError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-3 text-sm text-destructive-foreground"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          {/* Neutral notice (e.g. forgot password placeholder) */}
          {notice && (
            <div
              role="status"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-border/70 bg-secondary/60 px-3.5 py-3 text-sm text-muted-foreground"
            >
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email / Username */}
            <div>
              <label
                htmlFor={emailId}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Email or username
              </label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id={emailId}
                  type="text"
                  autoComplete="username"
                  placeholder="you@venue.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError(null);
                  }}
                  onBlur={handleEmailBlur}
                  disabled={submitting}
                  aria-invalid={showEmailError}
                  aria-describedby={showEmailError ? `${emailId}-error` : undefined}
                  className={`h-11 w-full rounded-xl border bg-surface-raised pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
                    showEmailError ? "border-destructive" : "border-input"
                  }`}
                />
              </div>
              {showEmailError && (
                <p id={`${emailId}-error`} className="mt-1.5 text-xs font-medium text-destructive">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor={passwordId}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError(null);
                  }}
                  onBlur={handlePasswordBlur}
                  disabled={submitting}
                  aria-invalid={showPasswordError}
                  aria-describedby={showPasswordError ? `${passwordId}-error` : undefined}
                  className={`h-11 w-full rounded-xl border bg-surface-raised pl-3.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 ${
                    showPasswordError ? "border-destructive" : "border-input"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {showPasswordError && (
                <p id={`${passwordId}-error`} className="mt-1.5 text-xs font-medium text-destructive">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between gap-3">
              <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={submitting}
                  className="size-4 shrink-0 cursor-pointer rounded border-input bg-surface-raised accent-[var(--gold)]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={submitting}
                className="text-sm font-medium text-gold underline-offset-4 transition-colors hover:text-gold-soft hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm disabled:opacity-60"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="interactive-btn flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[var(--shadow-gold-glow)] hover:bg-gold-soft focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="size-4" aria-hidden="true" />
                  Sign in
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Offline-first · Your register keeps working even when the network doesn&apos;t
        </p>
      </div>
    </div>
  );
}

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Email or username is required.";
  if (trimmed.includes("@")) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
    if (!valid) return "Enter a valid email address or a username without “@”.";
  } else if (trimmed.length < 3) {
    return "Username must be at least 3 characters.";
  }
  return null;
}

function validatePassword(value: string): string | null {
  if (value.length === 0) return "Password is required.";
  if (value.length < 6) return "Password must be at least 6 characters.";
  return null;
}
