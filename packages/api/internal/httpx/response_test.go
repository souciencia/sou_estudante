package httpx

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWriteJSON(t *testing.T) {
	rec := httptest.NewRecorder()

	WriteJSON(rec, http.StatusCreated, map[string]int{"total": 3})

	if rec.Code != http.StatusCreated {
		t.Errorf("status = %d, esperado %d", rec.Code, http.StatusCreated)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, esperado application/json", ct)
	}

	var body map[string]int
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("corpo não é JSON válido: %v", err)
	}
	if body["total"] != 3 {
		t.Errorf("corpo = %v, esperado total=3", body)
	}
}

func TestWriteError(t *testing.T) {
	rec := httptest.NewRecorder()

	WriteError(rec, http.StatusBadRequest, "entrada inválida")

	if rec.Code != http.StatusBadRequest {
		t.Errorf("status = %d, esperado 400", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, esperado application/json", ct)
	}

	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("corpo não é JSON válido: %v", err)
	}
	if body["error"] != "entrada inválida" {
		t.Errorf("corpo = %v, esperado error=entrada inválida", body)
	}
}

// Payload não serializável não pode causar panic nem perder o status já escrito.
func TestWriteJSONComPayloadNaoSerializavel(t *testing.T) {
	rec := httptest.NewRecorder()

	WriteJSON(rec, http.StatusOK, map[string]interface{}{"invalido": make(chan int)})

	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, esperado 200", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("Content-Type = %q, esperado application/json", ct)
	}
}
