import Link from "next/link"
import Menu from "../menu/menu"
import { NauticalIcon } from "../../ui/route/icons/NauticalIcon"

export const Header = () => {
    return (
        <header className="sticky top-0 z-[600] flex h-[52px] items-center justify-between bg-navy-900 px-5">
            <Link href='/' className="flex items-center gap-2.5">
                <span aria-hidden className="block h-7 w-7">
                    <NauticalIcon className="w-7 h-7" />
                </span>
                <span className="text-sm font-semibold tracking-[-0.2px] text-white">
                    So<span className="text-m1-accent">U</span>_Estudante
                </span>
            </Link>
            <div className="flex items-center gap-3 text-coadjuvant-sm text-white/[.45]">
                <a
                    href="https://souciencia.unifesp.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-fast hover:text-white/80"
                >
                    SoU_Ciência
                </a>
                <Menu mode="dark"/>
            </div>
        </header>
    )
}