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
    describe.each(routes)(
        "Módulo $module - $title",
        ({ module, title, description, badge }) => {
            
            const setup = () => render(
                <div>
                    <Route module={module} />
                </div>
            );

            it("renders the correct heading title", () => {
                setup();
                expect(
                    screen.getByRole("heading", {
                        level: 3,
                        name: title,
                    })
                ).toBeInTheDocument();
            });

            it("renders the correct description text", () => {
                setup();
                expect(screen.getByText(description)).toBeInTheDocument();
            });

            it("renders the correct badge text", () => {
                setup();
                expect(screen.getByText(badge)).toBeInTheDocument();
            });

            it("renders a link pointing to '#'", () => {
                setup();
                const link = screen.getByRole("link");
                expect(link).toHaveAttribute("href", "#");
            });

            it("contains the correct data-module attribute", () => {
                const { container } = setup();
                const route = container.querySelector(`[data-module="${module}"]`);
                expect(route).toBeInTheDocument();
            });

            it("renders an SVG icon inside the route component", () => {
                const { container } = setup();
                const route = container.querySelector(`[data-module="${module}"]`);
                expect(route?.querySelector("svg")).toBeInTheDocument();
            });
        }
    );
});