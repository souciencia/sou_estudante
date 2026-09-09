package main

import (
	"strings"
	"testing"
)

func TestUpdateEnvAPIKey_ExistingKey(t *testing.T) {
	input := "ESNODE01_NAME=se_es01\nELASTICSEARCH_APIKEY=old_key_123\nAPI_URL=http://se_api:8080\n"
	expected := "ESNODE01_NAME=se_es01\nELASTICSEARCH_APIKEY=new_secret_key\nAPI_URL=http://se_api:8080\n"

	got := UpdateEnvContent(input, "new_secret_key")
	if got != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, got)
	}
}

func TestUpdateEnvAPIKey_MissingKey(t *testing.T) {
	input := "ESNODE01_NAME=se_es01\nAPI_URL=http://se_api:8080"
	got := UpdateEnvContent(input, "new_secret_key")

	if !strings.Contains(got, "ELASTICSEARCH_APIKEY=new_secret_key") {
		t.Errorf("expected content to contain ELASTICSEARCH_APIKEY=new_secret_key, got:\n%s", got)
	}
}

func TestUpdateEnvAPIKey_EmptyValue(t *testing.T) {
	input := "ESNODE01_NAME=se_es01\nELASTICSEARCH_APIKEY=\nAPI_URL=http://se_api:8080\n"
	expected := "ESNODE01_NAME=se_es01\nELASTICSEARCH_APIKEY=new_secret_key\nAPI_URL=http://se_api:8080\n"

	got := UpdateEnvContent(input, "new_secret_key")
	if got != expected {
		t.Errorf("expected:\n%s\ngot:\n%s", expected, got)
	}
}
