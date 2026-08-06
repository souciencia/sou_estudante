// components/SearchResultList.tsx
import { SkeletonCard } from "@/components/card/skeleton-card";
import { ErrorMessage } from "@/components/text/error-message";
import { Typo } from "@/components/text/typo";
import type { OfertaCompleta } from "@/services/api/types";
import SearchResultItem from "./search-result-item";


interface SearchResultListProps {
  cursos: OfertaCompleta[];
  isLoading?: boolean;
  error?: string | null;
}

export default function SearchResultList({
  cursos,
  isLoading,
  error,
}: SearchResultListProps) {
  // Loading
  if (isLoading) {
    return (
      <div className="grid gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Error
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Empty
  if (!cursos || cursos.length === 0) {
    return (
      <div className="text-center py-8">
        <Typo v="mute" s="sm" t="p" className="cursor-auto">
          Nenhum curso encontrado
        </Typo>
      </div>
    );
  }

  // Results
  return (
    <div className="space-y-4">
      <Typo v="mute" s="sm" t="p" className="cursor-auto">
        {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
      </Typo>
      <div className="grid gap-4">
        {cursos.map((curso, index) => {
          // Gerar key única usando sequencial ou combinação de campos
          const key = curso.sequencial 
            ? `seq-${curso.sequencial}` 
            : `${curso.instituicao?.co_ies}-${curso.curso?.co_curso}-${index}`;
          
          return <SearchResultItem key={key} oferta={curso} />;
        })}
      </div>
    </div>
  );
}
