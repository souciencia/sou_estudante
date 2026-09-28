export const Footer = () => {
  return (
    <footer className="border-t border-plum-100 bg-surface px-5 py-3.5">
      <p className="text-coadjuvant-xs leading-[1.6] text-text-muted">
        Um produto do <strong>SoU_Ciência · Unifesp</strong> · Dados públicos ·{' '}
        <a
          href="https://creativecommons.org/licenses/by/4.0/deed.pt-br"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Licença Creative Commons BY 4.0
        </a>{' '}
        · Censo da Educação Superior (INEP) · e-MEC · Sisu
      </p>
    </footer>
  )
}
