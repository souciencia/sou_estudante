package main

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
)

func TestTUI_InitialMenu(t *testing.T) {
	cfg := LoadConfig()
	m := NewTUIModel(cfg, nil)

	view := m.View()
	if !strings.Contains(view, "Inserção de dados") {
		t.Errorf("View não contém opção de inserção de dados: %s", view)
	}
	if !strings.Contains(view, "Api-key") {
		t.Errorf("View não contém opção de Api-key: %s", view)
	}
	if !strings.Contains(view, "Limpar o banco") {
		t.Errorf("View não contém opção de limpar o banco: %s", view)
	}
	if !strings.Contains(strings.ToLower(view), "atualizar o dicionario_cursos") {
		t.Errorf("View não contém opção de atualizar o dicionario_cursos: %s", view)
	}
	if !strings.Contains(view, "Sair") {
		t.Errorf("View não contém opção de sair: %s", view)
	}
}

func TestTUI_KeyboardShortcuts(t *testing.T) {
	cfg := LoadConfig()
	m := NewTUIModel(cfg, nil)

	// Test shortcut 'i' -> vai para tela de caminho do arquivo
	newModel, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'i'}})
	tuiM := newModel.(TUIModel)
	if tuiM.state != stateIngestInput {
		t.Errorf("esperava stateIngestInput após pressionar 'i', obteve %v", tuiM.state)
	}

	// Test 'esc' volta para o menu
	newModel, _ = tuiM.Update(tea.KeyMsg{Type: tea.KeyEscape})
	tuiM = newModel.(TUIModel)
	if tuiM.state != stateMenu {
		t.Errorf("esperava stateMenu após pressionar 'esc', obteve %v", tuiM.state)
	}

	// Test shortcut 'c' -> vai para tela de confirmação de reset
	newModel, _ = tuiM.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'c'}})
	tuiM = newModel.(TUIModel)
	if tuiM.state != stateResetConfirm {
		t.Errorf("esperava stateResetConfirm após pressionar 'c', obteve %v", tuiM.state)
	}

	// Test shortcut 'd' -> vai para o processamento de atualização do dicionário
	dictModel, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'d'}})
	dictTUI := dictModel.(TUIModel)
	if dictTUI.state != stateIngesting || !strings.Contains(strings.ToLower(dictTUI.statusMsg), "dicionario") && !strings.Contains(strings.ToLower(dictTUI.statusMsg), "dicionário") {
		t.Errorf("esperava stateIngesting com status de atualização do dicionário após pressionar 'd', obteve state=%v status=%s", dictTUI.state, dictTUI.statusMsg)
	}

	// Recebe dictSuccessMsg -> vai para stateDictDone
	doneModel, _ := dictTUI.Update(dictSuccessMsg{dictCount: 42})
	doneTUI := doneModel.(TUIModel)
	if doneTUI.state != stateDictDone {
		t.Errorf("esperava stateDictDone após dictSuccessMsg, obteve %v", doneTUI.state)
	}
	if !strings.Contains(doneTUI.View(), "Dicionário de Cursos Atualizado") {
		t.Errorf("View não contém mensagem de sucesso do dicionário: %s", doneTUI.View())
	}

	// Test 'esc' em stateDictDone volta para o menu
	menuModel, _ := doneTUI.Update(tea.KeyMsg{Type: tea.KeyEscape})
	tuiM = menuModel.(TUIModel)
	if tuiM.state != stateMenu {
		t.Errorf("esperava stateMenu após pressionar 'esc' em stateDictDone, obteve %v", tuiM.state)
	}

	// Test shortcut 'q' -> emite tea.Quit
	_, cmd := tuiM.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}})
	if cmd == nil {
		t.Errorf("esperava comando de encerramento ao pressionar 'q'")
	}
}
