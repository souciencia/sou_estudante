# sou_estudante

O **SoU_Estudante** é uma plataforma de pesquisa e comparação de cursos e universidades, feita para ajudar estudantes e pesquisadores.

>- [Kanban do projeto no Github](https://github.com/users/RicardoIreno/projects/1/views/1?system_template=kanban)
>- Confira a pasta [docs](https://github.com/souciencia/sou_estudante/tree/main/docs)


## Arquitetura

- **Banco de dados:** Elasticsearch
- **API:** Golang
- **Interface:** TypeScript + Next.js
- **Base:** Containers individuais + docker-compose.yml

## Como rodar o projeto

Se seu sistema for Windows, é recomendável utilizar **Docker Engine** dentro do **WSL** (Windows Subsystem for Linux) para rodar esse projeto.

> Confira mais informações sobre o WSL no artigo oficial da Microsoft:
> <https://learn.microsoft.com/pt-br/windows/wsl/install>.
>
> Confira mais informações sobre Docker Engine no site oficial do Docker:
> <https://docs.docker.com/engine/install/ubuntu/#installation-methods>

### 1. Construção dos containers (build)

1. `docker compose build`
2. `./setup.sh`
3. `docker compose up -d`


## As coisas estão funcionando?

Como o fluxo da informação passa por três containers distintos, é importante sabermos se cada uma delas está funcionando separadamente. Para isso usamos tanto os logs dos containers, `docker logs -f [nome/id]`, como também verificamos as respostas das aplicações em suas devidas portas.


**Elasticsearch funcionando**
- http://localhost:9200/

**API funcionando e comunicando com o Elasticsearch**
- http://localhost:8080/cursos?q=medicina

**Frontend funcionando (construção em estágio inicial)**
- http://localhost:3000/
- http://localhost:3000/cursos


## Como Contribuir

### Boas Práticas e Arquitetura

#### Use DRY (Don't Repeat Yourself)
Cada fragmento de conhecimento, regra de negócio ou lógica de código deve ter uma representação única, inequívoca e oficial dentro do sistema.
- Evite duplicação de lógica, estilos e funções.
- Se um comportamento se repete em múltiplos lugares, abstraia-o em uma função utilitária, *custom hook* ou componente reutilizável.

### Organize o UI

Para organizar a interface de usuário (UI), utilizamos a seguinte divisão:

- **atoms:** Elementos visuais essenciais e indivisíveis da UI. Ex.: `Button`, `Input`, `Icon`, `Typography`.

- **features:** Estruturas complexas que desempenham um papel definido e que utilizam mais componentes em sua composição. Ex.: `Card`, `FilterGroup`, `ActiveFilters`.

- **site-blocks**: Apenas por organização, aqui ficam os  componentes como `Header`, `Footer`, `Hero`, etc.

#### Adote Compound Components para componentes robustos

Ao criar componentes robustos e expansíveis, utilize o **Compound Component Pattern**, ou seja, divida o componente em subcomponentes. Todos os subcomponentes pertencem estritamente ao diretório e ao *namespace* do seu componente pai (ex.: `<Select.Option>` reside na mesma pasta do `<Select>`). Exponha APIs flexíveis e expressivas onde os subcomponentes compartilham estado implícito via *React Context* (ex.: `<Select>`, `<Select.Trigger>`, `<Select.Option>`). Implemente de forma a dar controle total sobre a composição, o layout e a ordem de renderização.

### Use as skills que estão em `.opencode/skills`

Deixamos 3 skills essenciais para quem utliza agente de IA, elas irão ajudar a escrever um bom código:
- acessibility
- coding-and-refactoring
- tdd

### Fluxo de Trabalho para Pull Requests

- Crie branches nomeados com o prefixo ao enviar o pull request ou o push.
- Rode os linters para padronização do código (Biome para frontend e Gofmt para a api).
- Commite de forma descritiva: "Adiciona...", "Resolve...", "Refatora...", "Atualiza...".

## Licença livre

Este programa é um software livre; você pode redistribuí-lo e/ou modificá-lo sob os termos da Licença Pública Geral GNU como publicada pela Free Software Foundation; na versão 3 da Licença, ou (a seu critério) qualquer versão posterior.

Este programa é distribuído na esperança de que possa ser útil, mas SEM NENHUMA GARANTIA; sem uma garantia implícita de ADEQUAÇÃO a qualquer MERCADO ou APLICAÇÃO EM PARTICULAR. Veja a Licença Pública Geral GNU para mais detalhes.

Você deve ter recebido uma cópia da Licença Pública Geral GNU junto com este programa. Se não, veja https://www.gnu.org/licenses/.**


### Copyright (C)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
