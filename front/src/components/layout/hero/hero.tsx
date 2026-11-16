import Link from 'next/link'
import { BussolaHero } from './bussola/bussola-hero'

export const Hero = () => {
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
      <div className="relative z-[2] mt-[1.6rem] flex flex-wrap justify-center gap-2.5">
        <Link
          href="/cursos/"
          className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] border-m1-accent bg-m1-accent px-[1.35rem] py-[0.7rem] text-sm font-semibold text-fg transition-transform duration-fast ease-prow hover:-translate-y-px"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            width="15"
            height="15"
            aria-hidden="true"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <line
              x1="11"
              y1="11"
              x2="14.5"
              y2="14.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Buscar curso
        </Link>
        <a
          href="#howto"
          className="inline-flex items-center gap-[7px] rounded-full border-[1.5px] border-on-dark/[.38] bg-on-dark/[.08] px-[1.35rem] py-[0.7rem] text-sm font-semibold text-on-dark transition-colors duration-fast ease-prow hover:bg-on-dark/[.16]"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            width="15"
            height="15"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6.2"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M8 7.2V11M8 5.1V5.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Como funciona
        </a>
      </div>
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
    </section>
  )
}
