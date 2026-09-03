
# Go (`api/`)

```
/
- cmd/api/main.go
- internal
    - config
    - database
    - modules
        - oferta
        - ies
```

- Manter a separação `handlers → services → repository`
- Sempre me pergunte antes de fazer alterações
- Sempre formate os arquivos Go com `gofmt -s -w` antes de commitar
- Mantenha as dependências sincronizadas com `go mod tidy` (garantindo que `go.mod` e `go.sum` estejam sempre atualizados)
