// components/atoms/Input.tsx
import type React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "light" | "dark" | "accent";
}

const Input = ({ variant = "light", className = "", ...props }: InputProps) => {
  // Mapeamento das tuas variáveis de borda
  const borderColors = {
    light: "border-[var(--color-border-light)]",
    dark: "border-[var(--color-border-dark)]",
    accent: "border-[var(--color-border-accent)]",
  };

  return (
    <input
      className={`
        bg-[var(--color-surface)]
        border-[var(--border-width)]
        ${borderColors[variant]}
        rounded-md px-4 py-2
        focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
        text-[var(--text-normal)]
        transition-all
        ${className}
      `}
      {...props}
    />
  );
};

export default Input;
