package main

import (
	"encoding/json"
	"testing"
)

func TestParseAPIKeyResponse(t *testing.T) {
	rawJSON := `{
		"id": "VuaCfGcBCdbkQm-e5aOx",
		"name": "bulker-key",
		"api_key": "ui2_2RgzQJSbsuckPf9bDw",
		"encoded": "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkyXzJSZ3pRanNic3Vja1BmOWJEdw=="
	}`

	var resp apiKeyResponse
	err := json.Unmarshal([]byte(rawJSON), &resp)
	if err != nil {
		t.Fatalf("falha ao deserializar: %v", err)
	}

	if resp.Encoded != "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkyXzJSZ3pRanNic3Vja1BmOWJEdw==" {
		t.Errorf("encoded incorreto: %s", resp.Encoded)
	}
}
