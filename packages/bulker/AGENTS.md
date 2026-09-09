# Go (`bulker/`)

```
/
- go.mod
- Dockerfile
- src/
    - main.go
    - config.go
    - elasticsearch.go
    - json.go
    - mapper.go
    - structs.go
    - mapping.json
```

## Rules
- ⚠️: DON'T READ `packages/bulker/data/dados_curso_completo.json`
- Sempre formate os arquivos Go com `gofmt -s -w` antes de commitar
- Mantenha as dependências sincronizadas com `go mod tidy` (garantindo que `go.mod` e `go.sum` estejam sempre atualizados)
