import { useId, useState, type FormEvent } from "react";
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
 * Front-end only for now: validation, loading, and error states are simulated
 * locally until the auth backend is wired up. No global layout components are
 * touched — this screen stands on its own.
 */

type Role = "admin" | "manager" | "cashier";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Full venue control" },
  { value: "manager", label: "Manager", hint: "Events & reporting" },
  { value: "cashier", label: "Cashier / Staff", hint: "Register & orders" },
];

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
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("cashier");
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

    // Placeholder sign-in — replaced when the auth backend lands.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setSubmitting(false);
    setFormError("Invalid credentials. Check your email and password, then try again.");
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

            {/* Role selector */}
            <fieldset>
              <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sign in as
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, hint }) => {
                  const selected = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRole(value)}
                      disabled={submitting}
                      title={hint}
                      className={`interactive-btn rounded-xl border px-2 py-2.5 text-xs font-semibold leading-tight focus-visible:outline-none disabled:opacity-60 ${
                        selected
                          ? "border-gold/60 bg-primary text-primary-foreground shadow-[var(--shadow-gold-glow)]"
                          : "border-input bg-surface-raised text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

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
