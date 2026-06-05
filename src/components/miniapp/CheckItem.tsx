import { Check } from "lucide-react";

type CheckItemProps = {
  children: React.ReactNode;
  textOnDark?: boolean;
};

const ON_DARK_TEXT = { color: "#ffffff" } as const;

export function CheckItem({ children, textOnDark = false }: CheckItemProps) {
  const textStyle = textOnDark ? ON_DARK_TEXT : undefined;

  return (
    <li className="check-item" style={textStyle}>
      <span className="check-item-icon">
        <Check className="h-2.5 w-2.5 text-[#131323]" strokeWidth={3} />
      </span>
      <span style={textStyle}>{children}</span>
    </li>
  );
}
