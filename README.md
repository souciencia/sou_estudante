# sou_estudante

O **SoU_Estudante** é uma plataforma de pesquisa e comparação de cursos e universidades, feita para ajudar estudantes e pesquisadores.

>- [Kanban do projeto no Github](https://github.com/users/RicardoIreno/projects/1/views/1?system_template=kanban)
>- Confira a pasta [docks](https://github.com/souciencia/sou_estudante/tree/main/docs)


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

1. Renomeie o arquivo `.env.example`, na raíz do projeto, para `.env`.
2. Etapa de *build* dos containers: `docker-compose build`.
3. `docker-compose up -d` para o *start*. Omitir a *flag* `-d` mostrará os logs em tempo real.
4. Use `docker ps` para conferir se os containers estão rodando.

### 2. Configurando a API Key do Elasticsearch

Precisamos obter a have de API através da interação com o Elasticsearch.

1. Acesse [http://localhost:9200/](http://localhost:9200/) pelo navegador. Usuário e senha são os mesmos do arquivo [.env](.env). Ao acessar, o resultado esperado deve ser:

```json
{
  "name" : "elsou01",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "xxxxxxxxxxxxxxxxxxx",
  "version" : {
    "number" : "8.17.0",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "xxxxxxxxxxxxxxxxxxxxxxxxx",
    "build_date" : "2024-12-11T12:08:05.663969764Z",
    "build_snapshot" : false,
    "lucene_version" : "9.12.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```
2. Use o comando:

```sh
curl -u elastic -X POST "http://localhost:9200/_security/api_key" \
     -H "Content-Type: application/json" \
     -d '{"name": "my_api"}'
```
Resultado esperado:

```json
{"id":"qM-xxxxxxxxxxxxxxxxx","name":"my_api","api_key":"xxxxxxxxxxxxxx","encoded":"xxxxxxxxxxxxxxxxxxxxxxxxx=="}
```
3. Atualize o `.env` com a chave de API gerada colandi o valor de `encoded` da resposta na variável `ELASTICSEARCH_API_KEY`.
4. Restart o container `se_api` através do comando: `docker compose restart se_api`.

### 4. Carga de dados de exemplo

A carga dos dados é feita usando um container especializado nessa tarefa, o `se_bulker`, que está configurado para dar o *start* apenas com um comando específico.

1. Cole o arquivo csv com o o nome `dados.csv` na pasta `packages/bulker/data/`
2. Dê o *start* no container `se_bulker` através do comando `docker compose --profile bulker up se_bulker`.

Aguarde a etapa de *build* e a mensagem informando "Ingestão concluída!".

## As coisas estão funcionando?

Como o fluxo da informação passa por três containers distintos, é importante sabermos se cada uma delas está funcionando separadamente. Para isso usamos tanto os logs dos containers, `docker logs -f [nome/id]`, como também verificamos as respostas das aplicações em suas devidas portas.


**Elasticsearch funcionando**
- (http://localhost:9200/

**API funcionando e comunicando com o Elasticsearch**
- http://localhost:8080/cursos?q=medicina

**Frontend funcionando (construção em estágio inicial)**
- http://localhost:3000/
- http://localhost:3000/cursos

## Contribuidores
**Para usuário do VS Code:**
Recomendamos a instalação da extensão oficial do [Biome](https://biomejs.dev/pt-br/).

**Para usuários de Nvim**
Recomendamos o uso do plugin [conform.nvim](https://github.com/stevearc/conform.nvim).

```lua
require("conform").setup({
  formatters_by_ft = {
    typescript = { "biome" },
    typescriptreact = { "biome" },
    javascript = { "biome" },
    css = { "biome" },
    json = { "biome" },
    go = { "gofmt" },
  },
  format_on_save = {
    timeout_ms = 500,
    lsp_fallback = true,
  },
})
```

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


