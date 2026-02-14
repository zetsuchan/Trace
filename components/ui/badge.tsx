interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "symptom" | "mechanism" | "root";
}

const VARIANTS = {
  default: "bg-bg-elevated text-text-secondary",
  symptom: "bg-chain-symptom/15 text-chain-symptom",
  mechanism: "bg-chain-mechanism/15 text-chain-mechanism",
  root: "bg-chain-root/15 text-chain-root",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
