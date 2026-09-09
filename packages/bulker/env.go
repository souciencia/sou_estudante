package main

import (
	"fmt"
	"os"
	"strings"
)

// UpdateEnvContent atualiza ou insere a chave ELASTICSEARCH_APIKEY no conteúdo de um arquivo .env.
func UpdateEnvContent(content string, newKey string) string {
	lines := strings.Split(content, "\n")
	found := false
	var updatedLines []string

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "ELASTICSEARCH_APIKEY=") {
			updatedLines = append(updatedLines, fmt.Sprintf("ELASTICSEARCH_APIKEY=%s", newKey))
			found = true
		} else {
			updatedLines = append(updatedLines, line)
		}
	}

	if !found {
		if len(updatedLines) > 0 && updatedLines[len(updatedLines)-1] == "" {
			updatedLines = append(updatedLines[:len(updatedLines)-1], fmt.Sprintf("ELASTICSEARCH_APIKEY=%s", newKey), "")
		} else {
			updatedLines = append(updatedLines, fmt.Sprintf("ELASTICSEARCH_APIKEY=%s", newKey))
		}
	}

	return strings.Join(updatedLines, "\n")
}

// SaveEnvAPIKey lê o arquivo .env no caminho fornecido, atualiza o valor da chave e grava o arquivo.
func SaveEnvAPIKey(filePath, newKey string) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("erro ao ler arquivo env (%s): %w", filePath, err)
	}

	updated := UpdateEnvContent(string(data), newKey)
	if err := os.WriteFile(filePath, []byte(updated), 0644); err != nil {
		return fmt.Errorf("erro ao salvar arquivo env (%s): %w", filePath, err)
	}

	return nil
}
