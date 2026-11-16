package cursos

import (
	"context"
	"errors"
	"net/url"
	"testing"

	"api_estudante/internal/apperr"
)

// MockRepository implementa Repository para testes
type MockRepository struct {
	CapturedQuery   string
	CapturedFilters SearchFilterParams
	CapturedPage    int
	CapturedLimit   int
	ReturnResult    *SearchResult
	ReturnErr       error

	CapturedID   string
	ReturnCurso  *Curso
	ReturnGetErr error
}

func (m *MockRepository) Search(
	ctx context.Context,
	query string,
	filters SearchFilterParams,
	page, limit int,
) (*SearchResult, error) {
	m.CapturedQuery = query
	m.CapturedFilters = filters
	m.CapturedPage = page
	m.CapturedLimit = limit
	return m.ReturnResult, m.ReturnErr
}

func (m *MockRepository) GetByID(_ context.Context, id string) (*Curso, error) {
	m.CapturedID = id
	return m.ReturnCurso, m.ReturnGetErr
}

func TestBuscarCursosComFiltrosCumulativos(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 25,
			Hits:  []Curso{},
		},
	}

	service := NewService(mockRepo)
	ctx := context.Background()

	filters := SearchFilterParams{
		UF:         []string{"SP", "RJ"},
		Turno:      []string{"Noturno", "Diurno"},
		Grau:       []string{"Bacharelado"},
		Categoria:  []string{"Pública Federal"},
		Modalidade: []string{"Presencial"},
		Enade:      []string{"5", "4"},
		Ingresso:   []string{"sisu"},
		Sort:       "enade",
	}

	resp, err := service.BuscarCursos(ctx, "engenharia", filters, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if len(mockRepo.CapturedFilters.UF) != 2 || mockRepo.CapturedFilters.UF[0] != "SP" || mockRepo.CapturedFilters.UF[1] != "RJ" {
		t.Errorf("esperado UF ['SP', 'RJ'], recebido '%v'", mockRepo.CapturedFilters.UF)
	}
	if len(mockRepo.CapturedFilters.Turno) != 2 {
		t.Errorf("esperado 2 turnos, recebido '%v'", mockRepo.CapturedFilters.Turno)
	}

	// Os links HATEOAS devem preservar exatamente os filtros aplicados.
	parsed, err := url.Parse(resp.Links.Self)
	if err != nil {
		t.Fatalf("link Self inválido %q: %v", resp.Links.Self, err)
	}
	query := parsed.Query()
	want := map[string]string{
		"q":          "engenharia",
		"uf":         "SP,RJ",
		"turno":      "Noturno,Diurno",
		"grau":       "Bacharelado",
		"categoria":  "Pública Federal",
		"modalidade": "Presencial",
		"enade":      "5,4",
		"ingresso":   "sisu",
		"sort":       "enade",
		"page":       "1",
		"limit":      "10",
	}
	for key, value := range want {
		if got := query.Get(key); got != value {
			t.Errorf("link Self %s = %q, esperado %q", key, got, value)
		}
	}
}

func TestBuscarCursosAplicaDefaultsDePaginacao(t *testing.T) {
	mockRepo := &MockRepository{ReturnResult: &SearchResult{}}
	service := NewService(mockRepo)

	if _, err := service.BuscarCursos(context.Background(), "medicina", SearchFilterParams{}, 0, 0); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if mockRepo.CapturedPage != 1 || mockRepo.CapturedLimit != 20 {
		t.Errorf("page/limit = %d/%d, esperado 1/20", mockRepo.CapturedPage, mockRepo.CapturedLimit)
	}

	if _, err := service.BuscarCursos(context.Background(), "medicina", SearchFilterParams{}, 1, 500); err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if mockRepo.CapturedLimit != 20 {
		t.Errorf("limit = %d, esperado 20 (acima do teto)", mockRepo.CapturedLimit)
	}
}

func TestBuscarCursosPropagaErroDoRepository(t *testing.T) {
	mockRepo := &MockRepository{ReturnErr: errors.New("indisponível")}
	service := NewService(mockRepo)

	_, err := service.BuscarCursos(context.Background(), "medicina", SearchFilterParams{}, 1, 20)
	if err == nil || !errors.Is(err, mockRepo.ReturnErr) {
		t.Fatalf("esperado erro embrulhado do repository, obtido %v", err)
	}
}

func TestBuscarCursoPorIDPropagaErroGenerico(t *testing.T) {
	origem := errors.New("indisponível")
	mockRepo := &MockRepository{ReturnGetErr: origem}
	service := NewService(mockRepo)

	_, err := service.BuscarCursoPorID(context.Background(), "123")
	if err == nil || !errors.Is(err, origem) {
		t.Fatalf("esperado erro embrulhado, obtido %v", err)
	}
}

func TestBuscarCursosRetornaAgregacoes(t *testing.T) {
	mockRepo := &MockRepository{
		ReturnResult: &SearchResult{
			Total: 10,
			Hits:  []Curso{},
			Aggregations: &SearchAggregations{
				UFs: []AggregationBucket{
					{Key: "SP", Count: 7},
					{Key: "RJ", Count: 3},
				},
				Graus: []AggregationBucket{
					{Key: "BACHARELADO", Count: 10},
				},
			},
		},
	}

	service := NewService(mockRepo)
	ctx := context.Background()

	resp, err := service.BuscarCursos(ctx, "medicina", SearchFilterParams{}, 1, 10)
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	if resp.Aggregations == nil {
		t.Fatal("esperado aggregations preenchido, recebido nil")
	}
	if len(resp.Aggregations.UFs) != 2 || resp.Aggregations.UFs[0].Key != "SP" || resp.Aggregations.UFs[0].Count != 7 {
		t.Errorf("agregacao de UF incorreta: %v", resp.Aggregations.UFs)
	}
}

func TestBuscarCursoPorIDRejeitaIDVazio(t *testing.T) {
	service := NewService(&MockRepository{})

	if _, err := service.BuscarCursoPorID(context.Background(), "   "); !errors.Is(err, apperr.ErrInvalidInput) {
		t.Fatalf("esperado ErrInvalidInput, recebido %v", err)
	}
}

func TestBuscarCursosRejeitaQueryVazia(t *testing.T) {
	service := NewService(&MockRepository{})

	if _, err := service.BuscarCursos(context.Background(), "   ", SearchFilterParams{}, 1, 20); !errors.Is(err, apperr.ErrInvalidInput) {
		t.Fatalf("esperado ErrInvalidInput, recebido %v", err)
	}
}

func TestBuscarCursoPorIDPropagaNaoEncontrado(t *testing.T) {
	mockRepo := &MockRepository{ReturnGetErr: ErrNotFound}
	service := NewService(mockRepo)

	_, err := service.BuscarCursoPorID(context.Background(), "999")
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("esperado ErrNotFound, recebido %v", err)
	}
}

func TestBuscarCursoPorIDRetornaCurso(t *testing.T) {
	mockRepo := &MockRepository{ReturnCurso: &Curso{Edicao: "2024", Curso: DadosCurso{NoCurso: "MEDICINA"}}}
	service := NewService(mockRepo)

	item, err := service.BuscarCursoPorID(context.Background(), "123")
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if item == nil || item.Curso.NoCurso != "MEDICINA" {
		t.Errorf("curso retornado incorretamente: %+v", item)
	}
	if mockRepo.CapturedID != "123" {
		t.Errorf("esperado id '123', recebido '%s'", mockRepo.CapturedID)
	}
}

func TestLinksDePaginacaoPreservamExactDesligado(t *testing.T) {
	cases := []struct {
		name  string
		exact bool
		want  string
	}{
		{"desligado aparece nos links", false, "false"},
		{"ligado e o padrao, omitido", true, ""},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			mockRepo := &MockRepository{ReturnResult: &SearchResult{Total: 100}}
			service := NewService(mockRepo)

			resp, err := service.BuscarCursos(context.Background(), "medicina", SearchFilterParams{Exact: c.exact}, 2, 10)
			if err != nil {
				t.Fatalf("erro inesperado: %v", err)
			}

			links := map[string]string{
				"self": resp.Links.Self, "first": resp.Links.First, "last": resp.Links.Last,
				"prev": *resp.Links.Prev, "next": *resp.Links.Next,
			}
			for name, link := range links {
				parsed, err := url.Parse(link)
				if err != nil {
					t.Fatalf("link %s inválido %q: %v", name, link, err)
				}
				if got := parsed.Query().Get("exact"); got != c.want {
					t.Errorf("link %s: exact = %q, esperado %q", name, got, c.want)
				}
			}
		})
	}
}

func TestBuscarCursosRejeitaSortDesconhecido(t *testing.T) {
	mockRepo := &MockRepository{ReturnResult: &SearchResult{}}
	service := NewService(mockRepo)

	_, err := service.BuscarCursos(context.Background(), "medicina", SearchFilterParams{Sort: "preco"}, 1, 10)
	if !errors.Is(err, apperr.ErrInvalidInput) {
		t.Fatalf("esperado ErrInvalidInput, recebido %v", err)
	}
	if mockRepo.CapturedQuery != "" {
		t.Error("o repositório não deveria ser consultado com sort inválido")
	}
}

func TestBuscarCursosAceitaSortsConhecidos(t *testing.T) {
	for _, sort := range []string{"", "_score", "relevancia", "enade", "desistencia", "az"} {
		t.Run("sort="+sort, func(t *testing.T) {
			service := NewService(&MockRepository{ReturnResult: &SearchResult{}})
			if _, err := service.BuscarCursos(context.Background(), "medicina", SearchFilterParams{Sort: sort}, 1, 10); err != nil {
				t.Fatalf("sort %q deveria ser aceito: %v", sort, err)
			}
		})
	}
}

func TestBuscarCursoPorIDRejeitaIDNaoNumerico(t *testing.T) {
	for _, id := range []string{"abc", "1/_search", "12 3", "-1", "1.5", "../x"} {
		t.Run(id, func(t *testing.T) {
			mockRepo := &MockRepository{}
			service := NewService(mockRepo)

			if _, err := service.BuscarCursoPorID(context.Background(), id); !errors.Is(err, apperr.ErrInvalidInput) {
				t.Fatalf("esperado ErrInvalidInput para %q, recebido %v", id, err)
			}
			if mockRepo.CapturedID != "" {
				t.Error("o repositório não deveria ser consultado com id inválido")
			}
		})
	}
}
