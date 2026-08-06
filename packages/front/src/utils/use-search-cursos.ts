"use client";
import { useEffect, useState } from "react";
import { cursoService } from "@/services/api/curso.service";
import type { OfertaCompleta } from "@/services/api/types";
import { API_CONFIG } from "@/services/api";

export function useSearchCursos(query: string) {
  const [results, setResults] = useState<OfertaCompleta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!query || query.length < API_CONFIG.SEARCH_MIN_CHARS) {
      setResults([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await cursoService.searchCursos(query);
        setResults(response.results);
      } catch (err) {
        setError('Erro ao buscar cursos');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, API_CONFIG.SEARCH_DEBOUNCE_MS);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return { results, isLoading, error };
}
