import Link from 'next/link'
import { BussolaHero } from './bussola/bussola-hero'
import { CourseSearchEntry } from '@/components/search/course-search-entry/course-search-entry'

export const Hero2 = () => {
  return (
    <section
      className="relative overflow-hidden bg-navy-950 px-6 pb-[3.25rem] pt-11 text-center min-[860px]:px-12 min-[860px]:pb-14 min-[860px]:pt-[3.25rem] min-[860px]:text-left"
      style={{
        backgroundImage: 'url("/textura-hero.jpg")',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, color-mix(in srgb, var(--color-m2-accent) 9%, transparent) 0%, transparent 55%), radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--color-m1-accent) 7%, transparent) 0%, transparent 55%)',
        }}
      />
      <BussolaHero aria-hidden />
      <div className="relative z-[1] mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.9px] text-m1-accent">
        <span aria-hidden className="h-px w-5 bg-m1-accent/35" />
        Sua bússola no ensino superior
        <span aria-hidden className="h-px w-5 bg-m1-accent/35" />
      </div>
      <h1 className="relative z-[1] mb-3.5 font-display text-[clamp(1.9rem,5vw,2.8rem)] font-semibold leading-[1.15] tracking-[-0.3px] text-on-dark min-[860px]:max-w-[600px]">
        O destino é seu.
        <br />O <em className="font-medium italic text-m1-accent">mapa</em>,
        nosso.
      </h1>
      <p className="relative z-[1] mx-auto max-w-[480px] text-xs leading-[1.7] text-on-dark/[.58] min-[860px]:mx-0 min-[860px]:max-w-[540px]">
        Encontre cursos, entenda como ingressar, descubra apoios para permanecer
        e conheça as instituições — com dados públicos, atualizados e de fácil
        compreensão.
      </p>
 
      <svg
        className="absolute inset-x-0 bottom-0 block h-9 w-full"
        viewBox="0 0 1440 36"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,18 C360,36 1080,0 1440,18 L1440,36 L0,36 Z"
          fill="var(--color-surface-lv1)"
        />
      </svg>
      <section className="mx-auto my-10 max-w-[620px]">
          <CourseSearchEntry />
      </section>
    </section>
  )
}
