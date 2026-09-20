# Bulker — Package rules
- Never read `data/dados_curso_completo.json`, this is a big file!
- Job one-shot e idempotente: sobe via `--profile bulker`, insere os dados caso
  ainda não existam e encerra.
- Sempre formate os arquivos Go com `gofmt -s -w` antes de commitar
- Mantenha as dependências sincronizadas com `go mod tidy` garantindo que `go.mod` e `go.sum` estejam sempre atualizados
