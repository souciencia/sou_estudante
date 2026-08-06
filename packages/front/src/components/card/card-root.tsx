import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Props {
  v?: 'prev' | 'full'
  children: ReactNode
  className?: string
}

export const CardRoot = ({children, className = "", v = 'prev' }: Props) => {
  const variants = {
    prev: "w-full",
    full: "bg-gradient-to-r from-green-400 to-green-100",
  };

  return (
    <div
      className={
        cn(`border border-zinc-300 rounded-[26px] px-6 py-4 shadow`, 
          `${variants[v]} ${className}`
        )}
    >
      {children}
    </div>
  );
};
