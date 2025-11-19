import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  isLoading = false,
  disabled = false, 
  ...props 
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-md font-medium transition-all active:scale-95 flex items-center justify-center"; 

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-primary text-white hover:bg-secondary",
    secondary: "bg-accent text-white hover:bg-secondary",
    outline:
      "border border-primary text-primary hover:bg-primary hover:text-white",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const isButtonDisabled = disabled || isLoading;
  const disabledClasses = isButtonDisabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";

  return (
    <button
      className={`${base} ${variants[variant]} ${className} ${disabledClasses}`}
      disabled={isButtonDisabled}
      
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-current" // 
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {}
        {children}
        {isLoading && <span className="ml-1">...</span>} 
      </span>
    </button>
  );
}