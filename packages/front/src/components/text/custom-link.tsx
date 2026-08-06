import Link from "next/link";
import type { ReactNode } from "react";

interface CustomLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export const CustomLink = ({
  href,
  children,
  className = "",
}: CustomLinkProps) => {
  const isExternal = href.startsWith("http");

  // Se for externo, usa a tag <a> normal
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  // Se for interno, usa o componente Link do Next.js
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};
