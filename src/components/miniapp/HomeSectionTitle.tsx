import type { LucideIcon } from "lucide-react";

type HomeSectionTitleProps = {
  icon: LucideIcon;
  iconFilled?: boolean;
  children: React.ReactNode;
};

export function HomeSectionTitle({
  icon: Icon,
  iconFilled = false,
  children,
}: HomeSectionTitleProps) {
  return (
    <h2 className="home-section-title flex items-center gap-1.5 text-sm font-extrabold tracking-tight text-[var(--text)]">
      <Icon
        className={`h-4 w-4 shrink-0 text-[var(--accent)]${
          iconFilled ? " fill-[var(--accent)]" : ""
        }`}
        strokeWidth={iconFilled ? 0 : 2.5}
        aria-hidden
      />
      {children}
    </h2>
  );
}
