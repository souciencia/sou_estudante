import type { ReactNode } from "react";

interface GradientTextProps {
  variant?: "blue" | "green" | "violet" | "animated";
  children: ReactNode;
  className?: string;
}

export const Hgh = ({
  variant = "blue",
  children,
  className = "",
}: GradientTextProps) => {
  const gradients = {
    blue: "from-blue-400 to-blue-100",
    green: "from-green-400 to-green-100",
    violet: "from-violet-400 to-violet-100",
    animated: "from-blue-500 via-purple-500 to-pink-500 animate-gradient",
  };

  return (
    <span
      className={`bg-clip-text text-transparent font-semibold ${gradients[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
