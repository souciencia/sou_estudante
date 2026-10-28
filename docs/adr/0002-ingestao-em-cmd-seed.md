# 0002. Ingestão como job separado (`cmd/seed`)

**Status:** Rascunho

## Decisão

A carga de dados é um programa próprio (`cmd/seed`, container `se_bulk`, perfil
`bulk` do compose), com o código em `internal/ingest/*` e `features/*/ingest`.
A API (`cmd/api`) não importa esse código. Antes existia um pacote `bulk`
dentro da API.

## Motivo

*A preencher pelo time.*

## Consequências (observadas no código)

- A API pode rodar com credencial somente leitura; a escrita fica isolada no job.
- Um teste (`cmd/api/deps_test.go`) impede que a API passe a depender da ingestão.
- O seed sempre reingere por troca atômica (blue/green): indexa num índice novo
  datado e troca o alias `-latest`, apagando o anterior. Uma falha no meio deixa
  o alias no índice antigo, sem dados parciais dados como completos (ver seção 9
  de [analise-sonnet.md](../analise-sonnet.md)).
- O modelo de documento (`cursos.Curso`, `ies.IES`) é compartilhado entre os
  dois lados.
