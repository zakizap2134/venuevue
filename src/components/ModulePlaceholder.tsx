import type { LucideIcon } from "lucide-react";

/** Shared placeholder body for POS modules that aren't built yet. */
export function ModulePlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="interactive-card rounded-3xl border border-border/70 bg-card/90 p-8 shadow-[var(--shadow-lift)] backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-gold">
            <Icon className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
