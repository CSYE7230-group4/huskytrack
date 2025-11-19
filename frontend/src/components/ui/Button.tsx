interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  className?: string;
  onClick?: () => void;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md font-medium transition-all active:scale-95";

  const variants = {
    primary: "bg-primary text-white hover:bg-secondary",
    secondary: "bg-accent text-white hover:bg-secondary",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
