interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-secondary",
    secondary: "bg-accent text-white hover:bg-secondary",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button 
      type={type}
      className={`${base} ${variants[variant]} ${className}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
