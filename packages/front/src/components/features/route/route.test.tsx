import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Route } from "./route";

const routes = [
    {
        module: "1",
        title: "Escolher curso",
        description: "Explore por área, localização e modalidade",
        badge: "CARTA NÁUTICA",
    },
    {
        module: "2",
        title: "Como ingressar",
        description: "Notas de corte, vagas e cotas no Sisu",
        badge: "BÚSSOLA",
    },
    {
        module: "3",
        title: "Como permanecer",
        description: "Cotas, assistência e apoios estudantis",
        badge: "ÂNCORA",
    },
    {
        module: "4",
        title: "Conhecer instituição",
        description: "Indicadores, docentes e qualidade",
        badge: "TELESCÓPIO",
    },
    {
        module: "5",
        title: "Comparar cursos",
        description: "Analise até 4 cursos lado a lado",
        badge: "SEXTANTE",
    },
] as const;

describe("Route", () => {
    it.each(routes)(
        "renders module $module correctly",
        ({ module, title, description, badge }) => {
            const { container } = render(
                <div>
                    <Route module={module} />
                </div>
            );

            expect(
                screen.getByRole("heading", {
                    level: 3,
                    name: title,
                })
            ).toBeInTheDocument();

            expect(screen.getByText(description)).toBeInTheDocument();

            expect(screen.getByText(badge)).toBeInTheDocument();

            const link = screen.getByRole("link");

            expect(link).toHaveAttribute("href", "#");

            const route = container.querySelector(
                `[data-module="${module}"]`
            );

            expect(route).toBeInTheDocument();

            expect(route?.querySelector("svg")).toBeInTheDocument();
        }
    );
});