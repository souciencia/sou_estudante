export const Hero = () => {
  return (
    <section
      className="relative overflow-hidden bg-[#0d2a35] px-6 py-16 md:py-24 text-white"
      style={{
        // Um background-image simples para simular as ondas do fundo
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(20, 55, 65, 0.8) 0%, transparent 60%), 
                          repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 10px)`,
      }}
    >
      {/* Container principal centralizado e responsivo */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
        {/* Lado Esquerdo: Textos e Botões */}
        <div className="text-left lg:col-span-7 flex flex-col items-start">
          {/* Badge superior */}
          <div className="mb-6 flex items-center gap-3">
            <span className="h-[1px] w-8 bg-[#ccf900]/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#ccf900]">
              Sua bússola no ensino superior
            </span>
            <span className="h-[1px] w-8 bg-[#ccf900]/50" />
          </div>

          {/* Título Principal */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-tight tracking-tight text-white mb-6">
            O destino é seu.
            <br />
            As{' '}
            <em className="not-italic text-[#ccf900] font-serif italic">
              coordenadas
            </em>
            , nossas.
          </h1>

          {/* Subtítulo / Descrição */}
          <p className="max-w-2xl text-base md:text-lg text-slate-300/90 leading-relaxed mb-8">
            Encontre cursos, entenda como ingressar, descubra apoios para
            permanecer e conheça as instituições — com dados públicos,
            atualizados e de fácil compreensão.
          </p>

          {/* Grupo de Botões */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Botão Buscar Curso (Amarelo/Verde Limão) */}
            <button className="inline-flex items-center gap-2 rounded-full bg-[#ccf900] px-7 py-3.5 text-sm font-semibold text-neutral-900 transition-all hover:bg-[#b5de00] hover:scale-[1.02] active:scale-[0.98]">
              <svg
                className="w-4 h-4 text-neutral-900"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                ></circle>
                <line
                  x1="11"
                  y1="11"
                  x2="14.5"
                  y2="14.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                ></line>
              </svg>
              Buscar curso
            </button>

            {/* Botão Como Funciona (Outline / Transparente) */}
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-500/80 bg-[#163a45]/30 px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#163a45]/60 hover:border-slate-300">
              <svg
                className="w-4 h-4 text-slate-300"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                ></circle>
                <path
                  d="M8 7.2V11M8 5.1V5.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
              </svg>
              Como funciona
            </button>
          </div>
        </div>

        {/* Lado Direito: A Bússola Decorativa (Oculta em telas muito pequenas) */}
        <div className="hidden lg:flex lg:col-span-5 justify-center relative"></div>
      </div>
    </section>
  )
}
