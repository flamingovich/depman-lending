import { ChipCheckIcon } from "@/components/miniapp/ChipCheckIcon";

type CheckItemProps = {
  children: React.ReactNode;
  textOnDark?: boolean;
  iconVariant?: "red" | "gold" | "green";
};

const ON_DARK_TEXT = { color: "#ffffff" } as const;

export function CheckItem({
  children,
  textOnDark = false,
  iconVariant = "gold",
}: CheckItemProps) {
  const textStyle = textOnDark ? ON_DARK_TEXT : undefined;

  return (
    <li className="check-item" style={textStyle}>
      <span className="check-item-chip" aria-hidden>
        <ChipCheckIcon variant={iconVariant} size={14} />
      </span>
      <span className="check-item-text" style={textStyle}>
        {children}
      </span>
    </li>
  );
}
