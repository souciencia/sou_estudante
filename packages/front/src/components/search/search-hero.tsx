'use client';

import { useState, useEffect, useTransition } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  // const [isPending, setIsPending] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Debounce: evita chamadas excessivas à API enquanto o usuário digita
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        if (query) {
          router.push(`/?q=${encodeURIComponent(query)}`);
        } else {
          router.push('/');
        }
      });
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [query, router]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isPending ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-4 border border-gray-400 rounded-2xl leading-5 bg-gray-900 shadow-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
          placeholder="Busque por cursos, universidades ou áreas de estudo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500 text-center">
        Dica: Tente "Engenharia de Software" ou "Universidade de São Paulo"
      </p>
    </div>
  );
}