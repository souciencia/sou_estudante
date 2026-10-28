# Pontos de atenção

### API keys de produção

O `setup.sh` gera as keys falando com `localhost:9200` — no ambiente **local**
(`--dev`). Em produção, o ES **não publica porta no host** (sem `ports:` no
`docker-compose.prod.yml`), então não dá para usar `localhost:9200` direto. As
keys do `.env` precisam ser válidas contra o cluster de produção.

O `setup.sh` é o orquestrador único: pergunta **dev ou produção** (`--dev`/
`--prod`) e delega para a rotina correspondente (`scripts/routines/`). Em
produção, a geração das keys roda **dentro do container do ES** via
`podman exec` (função `setup_api_keys_in_container` em `scripts/lib/es.sh`),
sem precisar de porta no host. O `scripts/deploy.sh` foi absorvido nessa rotina
e removido.

> A rotina de produção valida `ELASTIC_PASSWORD`, sobe o ES, gera as duas keys
> dentro do container e grava `ELASTICSEARCH_APIKEY` e
> `ELASTICSEARCH_BULK_APIKEY` no `.env`. Com `--reuse-valid-keys`, valida a key
> existente antes de recriar.


---

### Heap do Elasticsearch

O `docker-compose.prod.yml` passa `ES_JAVA_OPTS` do `.env` ao Elasticsearch
(padrão sugerido: `-Xms1g -Xmx1g`). Em VPS de pouca memória, fixar o heap evita que a JVM estoure o limite da máquina.

Ajuste `-Xms`/`-Xmx` conforme a RAM disponível (regra comum: até metade da
memória da VM, deixando folga para o SO e o page cache).


---

### Dados e seed

O seed é um job one-shot que **sempre reingere** por troca atômica (blue/green):
indexa num índice novo datado (`<base>-<AAAA-MM-DD>`) e aponta o alias
`<base>-latest` para ele ao final, apagando o anterior. Se falhar, o alias
continua no índice antigo.

```bash
podman compose -f docker-compose.prod.yml --env-file .env --profile bulk run --rm --no-deps se_bulk
```
O deploy não roda o seed automaticamente.


---

## Checklist final e riscos

## Checklist antes de subir produção

- [ ] `Caddyfile` com domínio real e hash de senha válido (sem `HASH_AQUI`).
- [ ] Portas 80/443 da VM liberadas e domínio com registro A correto.
- [ ] `.env` criado em `DEPLOY_PATH`, com `ELASTIC_PASSWORD` coerente com o volume do ES.
- [ ] `ELASTICSEARCH_APIKEY` e `ELASTICSEARCH_BULK_APIKEY` geradas contra o ES de produção (o `setup.sh --prod` faz isso automaticamente via `podman exec`).
- [ ] `./data` com os JSONs, se for rodar o seed.
- [ ] Comando de compose disponível no servidor (podman/docker).

## Riscos e limitações atuais

- ~~Sem health check semântico~~: resolvido — a API expõe `/readyz`, que faz ping
  no Elasticsearch (200 se ok, 503 se fora); o `prod.sh` verifica `/readyz` no
  pós-deploy.
- **Seed é manual**: o deploy não reingere dados; o seed só roda quando chamado
  explicitamente (sempre reingere por blue/green).
- ~~Front sem healthcheck~~: resolvido — `se_front` ganhou healthcheck nos dois
  compose (dev e prod), via `wget` do busybox.

A partir destes pontos de atenção, vamos ajustar passo a passo o que precisa ser ajustado