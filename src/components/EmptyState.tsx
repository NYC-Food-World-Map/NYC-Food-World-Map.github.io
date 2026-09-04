import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="rounded-xl border border-dashed border-[color:var(--line)] bg-[color:var(--card)] px-4 py-5"
    >
      <p className="text-base font-medium text-[color:var(--foreground)]">
        {title}
      </p>
      {description ? (
        <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
