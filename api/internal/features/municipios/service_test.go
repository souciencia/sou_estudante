package municipios

import (
	"context"
	"errors"
	"testing"
)

type mockRepo struct {
	result Response
	err    error
}

func (m *mockRepo) Listar(context.Context) (Response, error) {
	return m.result, m.err
}

func TestListarMunicipiosGaranteMapaNaoNulo(t *testing.T) {
	svc := NewService(&mockRepo{result: nil})

	got, err := svc.ListarMunicipios(context.Background())
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if got == nil {
		t.Fatal("esperado mapa não-nulo, obtido nil")
	}
}

func TestListarMunicipiosPropagaErro(t *testing.T) {
	svc := NewService(&mockRepo{err: errors.New("boom")})

	if _, err := svc.ListarMunicipios(context.Background()); err == nil {
		t.Fatal("esperado erro propagado")
	}
}
