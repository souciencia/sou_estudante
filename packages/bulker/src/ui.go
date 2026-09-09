package main

import (
	"context"
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/elastic/go-elasticsearch/v8"
)

type tuiState int

const (
	stateMenu tuiState = iota
	stateIngestInput
	stateIngesting
	stateIngestDone
	stateApiKey
	stateResetConfirm
	stateResetDone
	stateDictDone
	stateError
)

type menuItem struct {
	key         string
	shortcut    string
	title       string
	description string
}

var menuItems = []menuItem{
	{
		key:         "i",
		shortcut:    "[i] ou [1]",
		title:       "Inserção de dados no banco",
		description: "Usa um JSON para criar os indices `cursos` e `dicionario_cursos`",
	},
	{
		key:         "d",
		shortcut:    "[d] ou [2]",
		title:       "Atualizar o dicionario_cursos",
		description: "Atualiza `dicionario_cursos` a partir do índice de `cursos` existente.",
	},
	{
		key:         "k",
		shortcut:    "[k] ou [3]",
		title:       "Obter a Api-key",
		description: "Gera nova chave de autenticação e atualiza o arquivo .env",
	},
	{
		key:         "c",
		shortcut:    "[c] ou [4]",
		title:       "Limpar o banco",
		description: "Apaga os índices existentes",
	},
	{
		key:         "q",
		shortcut:    "[q] ou [5]",
		title:       "Sair da aplicação e fazer o down",
		description: "Encerra o bulker e para o container",
	},
}

// Mensagens internas do Bubble Tea
type esHealthMsg struct {
	online bool
	status string
	err    error
}

type ingestProgressMsg struct {
	count uint64
}

type ingestSuccessMsg struct {
	totalDocs  uint64
	dictCount  int
	sourceFile string
}

type apiKeySuccessMsg struct {
	apiKey  string
	envFile string
}

type resetSuccessMsg struct{}

type dictSuccessMsg struct {
	dictCount int
}

type errMsg struct {
	err error
}

type TUIModel struct {
	cfg        *Config
	esClient   *elasticsearch.Client
	state      tuiState
	cursor     int
	textInput  textinput.Model
	spinner    spinner.Model
	statusMsg  string
	errorMsg   string
	esOnline   bool
	esStatus   string
	ingestDocs uint64
	dictDocs   int
}

// Estilos Lip Gloss
var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FFFFFF")).
			Background(lipgloss.Color("#5A56E0")).
			Padding(0, 1)

	headerStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#04B575")).
			MarginBottom(1)

	shortcutStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FFB86C"))

	itemTitleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#F8F8F2"))

	itemDescStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#6272A4"))

	selectedItemStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(lipgloss.Color("#50FA7B"))

	statusOnlineStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#50FA7B")).
				Bold(true)

	statusOfflineStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#FF5555")).
				Bold(true)

	boxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("#6272A4")).
			Padding(1, 2)

	infoStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#8BE9FD"))
)

func NewTUIModel(cfg *Config, esClient *elasticsearch.Client) TUIModel {
	ti := textinput.New()
	ti.Placeholder = "/data/dados_curso_completo.json"
	ti.SetValue(cfg.JSONFilePath)
	ti.Focus()
	ti.CharLimit = 256
	ti.Width = 50

	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("#50FA7B"))

	return TUIModel{
		cfg:       cfg,
		esClient:  esClient,
		state:     stateMenu,
		cursor:    0,
		textInput: ti,
		spinner:   s,
		esOnline:  false,
		esStatus:  "verificando...",
	}
}

func (m TUIModel) Init() tea.Cmd {
	return tea.Batch(
		m.checkESHealthCmd(),
		m.spinner.Tick,
	)
}

func (m TUIModel) checkESHealthCmd() tea.Cmd {
	return func() tea.Msg {
		if m.esClient == nil {
			client, err := NewElasticsearchClient(m.cfg)
			if err != nil {
				return esHealthMsg{online: false, status: "indisponível", err: err}
			}
			m.esClient = client
		}

		online, status, err := CheckESHealth(context.Background(), m.esClient)
		return esHealthMsg{online: online, status: status, err: err}
	}
}

func (m TUIModel) generateApiKeyCmd() tea.Cmd {
	return func() tea.Msg {
		newKey, err := GenerateAPIKey(
			context.Background(),
			m.cfg.ElasticsearchURL,
			m.cfg.ElasticsearchUsername,
			m.cfg.ElasticsearchPassword,
			"bulker-tui-key",
		)
		if err != nil {
			return errMsg{err: err}
		}

		// Atualizar .env
		if err := SaveEnvAPIKey(m.cfg.EnvFilePath, newKey); err != nil {
			return errMsg{err: fmt.Errorf("chave gerada mas erro ao salvar .env: %w", err)}
		}

		m.cfg.ElasticsearchAPIKey = newKey
		// Recria client com a nova chave
		newClient, err := NewElasticsearchClient(m.cfg)
		if err == nil {
			m.esClient = newClient
		}

		return apiKeySuccessMsg{apiKey: newKey, envFile: m.cfg.EnvFilePath}
	}
}

func (m TUIModel) resetDatabaseCmd() tea.Cmd {
	return func() tea.Msg {
		if m.esClient == nil {
			client, err := NewElasticsearchClient(m.cfg)
			if err != nil {
				return errMsg{err: err}
			}
			m.esClient = client
		}

		indices := []string{m.cfg.IndexName, m.cfg.DictIndexName}
		err := ResetDatabase(context.Background(), m.esClient, indices, m.cfg.MappingPath)
		if err != nil {
			return errMsg{err: err}
		}
		return resetSuccessMsg{}
	}
}

func (m TUIModel) updateDictCmd() tea.Cmd {
	return func() tea.Msg {
		if m.esClient == nil {
			client, err := NewElasticsearchClient(m.cfg)
			if err != nil {
				return errMsg{err: err}
			}
			m.esClient = client
		}

		dictCount, err := CreateDicionarioCursos(context.Background(), m.esClient, m.cfg.IndexName, m.cfg.DictIndexName)
		if err != nil {
			return errMsg{err: fmt.Errorf("falha ao atualizar dicionario_cursos: %w", err)}
		}

		return dictSuccessMsg{
			dictCount: dictCount,
		}
	}
}

func (m TUIModel) startIngestCmd(filePath string) tea.Cmd {
	return func() tea.Msg {
		if m.esClient == nil {
			client, err := NewElasticsearchClient(m.cfg)
			if err != nil {
				return errMsg{err: err}
			}
			m.esClient = client
		}

		// 1. Ingestão de dados no índice principal
		totalDocs, err := IngestDataFile(context.Background(), m.esClient, m.cfg, filePath, nil)
		if err != nil {
			return errMsg{err: fmt.Errorf("falha na ingestão: %w", err)}
		}

		// 2. Chamar a função create_indice_cursos (agora dicionario_cursos)
		dictCount, err := CreateDicionarioCursos(context.Background(), m.esClient, m.cfg.IndexName, m.cfg.DictIndexName)
		if err != nil {
			return errMsg{err: fmt.Errorf("ingestão concluída mas erro ao criar dicionario_cursos: %w", err)}
		}

		return ingestSuccessMsg{
			totalDocs:  totalDocs,
			dictCount:  dictCount,
			sourceFile: filePath,
		}
	}
}

func (m TUIModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c":
			return m, tea.Quit
		}

	case esHealthMsg:
		m.esOnline = msg.online
		m.esStatus = msg.status
		if msg.err != nil {
			m.esStatus = "offline"
		}
		return m, nil

	case spinner.TickMsg:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd

	case ingestProgressMsg:
		m.ingestDocs = msg.count
		return m, nil

	case ingestSuccessMsg:
		m.state = stateIngestDone
		m.ingestDocs = msg.totalDocs
		m.dictDocs = msg.dictCount
		return m, nil

	case apiKeySuccessMsg:
		m.state = stateApiKey
		m.statusMsg = fmt.Sprintf("Nova Api-Key gerada e salva com sucesso em %s:\n\n%s", msg.envFile, msg.apiKey)
		return m, nil

	case resetSuccessMsg:
		m.state = stateResetDone
		return m, nil

	case dictSuccessMsg:
		m.state = stateDictDone
		m.dictDocs = msg.dictCount
		return m, nil

	case errMsg:
		m.state = stateError
		m.errorMsg = msg.err.Error()
		return m, nil
	}

	// Manipulação de estados específicos
	switch m.state {
	case stateMenu:
		return m.updateMenu(msg)
	case stateIngestInput:
		return m.updateIngestInput(msg)
	case stateIngesting:
		// Em processamento, ignora teclas exceto cancelamento se necessário
		return m, nil
	case stateIngestDone, stateApiKey, stateResetDone, stateDictDone, stateError:
		if keyMsg, ok := msg.(tea.KeyMsg); ok {
			switch keyMsg.String() {
			case "enter", "esc", "q":
				m.state = stateMenu
				return m, m.checkESHealthCmd()
			}
		}
	case stateResetConfirm:
		return m.updateResetConfirm(msg)
	}

	return m, nil
}

func (m TUIModel) updateMenu(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "k":
			if msg.String() == "k" {
				// Atalho direto para Obter Api-key
				return m.triggerMenuAction("k")
			}
			if m.cursor > 0 {
				m.cursor--
			} else {
				m.cursor = len(menuItems) - 1
			}
		case "down", "j":
			if m.cursor < len(menuItems)-1 {
				m.cursor++
			} else {
				m.cursor = 0
			}
		case "enter":
			selected := menuItems[m.cursor]
			return m.triggerMenuAction(selected.key)
		case "i", "1":
			return m.triggerMenuAction("i")
		case "d", "2":
			return m.triggerMenuAction("d")
		case "3":
			return m.triggerMenuAction("k")
		case "c", "4":
			return m.triggerMenuAction("c")
		case "q", "5":
			return m.triggerMenuAction("q")
		}
	}
	return m, nil
}

func (m TUIModel) triggerMenuAction(actionKey string) (tea.Model, tea.Cmd) {
	switch actionKey {
	case "i":
		m.state = stateIngestInput
		m.textInput.SetValue(m.cfg.JSONFilePath)
		m.textInput.Focus()
		return m, m.checkESHealthCmd()
	case "d":
		m.state = stateIngesting
		m.statusMsg = "Atualizando índice dicionario_cursos a partir do índice de cursos..."
		return m, m.updateDictCmd()
	case "k":
		m.state = stateIngesting
		m.statusMsg = "Gerando nova Api-Key no Elasticsearch..."
		return m, m.generateApiKeyCmd()
	case "c":
		m.state = stateResetConfirm
		return m, nil
	case "q":
		return m, tea.Quit
	}
	return m, nil
}

func (m TUIModel) updateIngestInput(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "esc":
			m.state = stateMenu
			return m, nil
		case "enter":
			if !m.esOnline {
				m.state = stateError
				m.errorMsg = "Elasticsearch não está pronto. Verifique se o container se_es01 está up!"
				return m, nil
			}
			filePath := strings.TrimSpace(m.textInput.Value())
			if filePath == "" {
				filePath = m.cfg.JSONFilePath
			}
			m.cfg.JSONFilePath = filePath
			m.state = stateIngesting
			m.statusMsg = fmt.Sprintf("Processando arquivo %s e criando índices...", filePath)
			return m, m.startIngestCmd(filePath)
		}
	}

	var cmd tea.Cmd
	m.textInput, cmd = m.textInput.Update(msg)
	return m, cmd
}

func (m TUIModel) updateResetConfirm(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch strings.ToLower(msg.String()) {
		case "s", "y":
			m.state = stateIngesting
			m.statusMsg = "Apagando índices existentes e recriando configurações..."
			return m, m.resetDatabaseCmd()
		case "n", "esc":
			m.state = stateMenu
			return m, nil
		}
	}
	return m, nil
}

func (m TUIModel) View() string {
	var b strings.Builder

	// Cabeçalho / Banner
	b.WriteString(titleStyle.Render("⚡ BULKER — Sistema de Ingestão e Sumarização"))
	b.WriteString("\n\n")

	// Status do Elasticsearch
	esStatusStr := statusOfflineStyle.Render("● Offline (" + m.esStatus + ")")
	if m.esOnline {
		esStatusStr = statusOnlineStyle.Render("● Online (" + m.esStatus + ")")
	}
	b.WriteString(fmt.Sprintf("Elasticsearch [%s]: %s\n\n", m.cfg.ElasticsearchURL, esStatusStr))

	switch m.state {
	case stateMenu:
		b.WriteString(headerStyle.Render("Selecione uma opção navegando com [↑/↓] ou pelo atalho:"))
		b.WriteString("\n\n")

		for i, item := range menuItems {
			cursor := "  "
			if m.cursor == i {
				cursor = "► "
			}

			shortcut := shortcutStyle.Render(fmt.Sprintf("%-10s", item.shortcut))
			title := itemTitleStyle.Render(item.title)
			if m.cursor == i {
				title = selectedItemStyle.Render(item.title)
			}
			desc := itemDescStyle.Render("— " + item.description)

			b.WriteString(fmt.Sprintf("%s%s %s %s\n", cursor, shortcut, title, desc))
		}

		b.WriteString("\n")
		b.WriteString(infoStyle.Render("[Enter] Confirmar  •  [q] Sair e Down"))

	case stateIngestInput:
		b.WriteString(headerStyle.Render("📁 Inserção de dados no Elasticsearch"))
		b.WriteString("\n")
		if !m.esOnline {
			b.WriteString(statusOfflineStyle.Render("⚠️  Alerta: O Elasticsearch não parece estar respondendo!"))
			b.WriteString("\n\n")
		}
		b.WriteString("Informe o caminho do arquivo JSON com os dados:\n")
		b.WriteString(m.textInput.View())
		b.WriteString("\n\n")
		b.WriteString(infoStyle.Render("[Enter] Iniciar Ingestão  •  [Esc] Voltar ao Menu"))

	case stateIngesting:
		b.WriteString(headerStyle.Render("⏳ Processando Operação"))
		b.WriteString("\n\n")
		b.WriteString(fmt.Sprintf("%s %s\n", m.spinner.View(), m.statusMsg))

	case stateIngestDone:
		b.WriteString(headerStyle.Render("✅ Ingestão e Sumarização Concluídas!"))
		b.WriteString("\n\n")
		b.WriteString(boxStyle.Render(fmt.Sprintf(
			"• Documentos inseridos no índice principal (%s): %d\n"+
				"• Cursos únicos adicionados ao índice sumário (%s): %d\n",
			m.cfg.IndexName, m.ingestDocs,
			m.cfg.DictIndexName, m.dictDocs,
		)))
		b.WriteString("\n\n")
		b.WriteString(infoStyle.Render("[Enter] Voltar ao Menu"))

	case stateApiKey:
		b.WriteString(headerStyle.Render("🔑 Obter Api-key"))
		b.WriteString("\n\n")
		b.WriteString(boxStyle.Render(m.statusMsg))
		b.WriteString("\n\n")
		b.WriteString(infoStyle.Render("[Enter] Voltar ao Menu"))

	case stateResetConfirm:
		b.WriteString(headerStyle.Render("⚠️  Limpar o Banco de Dados"))
		b.WriteString("\n\n")
		b.WriteString(boxStyle.Render(fmt.Sprintf(
			"Tem certeza que deseja apagar os índices existentes?\n\n"+
				"Índices afetados: %s, %s\n\n"+
				"Esta ação é irreversível.",
			m.cfg.IndexName, m.cfg.DictIndexName,
		)))
		b.WriteString("\n\n")
		b.WriteString(shortcutStyle.Render("[S] Sim, apagar tudo  •  [N / Esc] Cancelar"))

	case stateResetDone:
		b.WriteString(headerStyle.Render("🗑️  Banco Limpo com Sucesso"))
		b.WriteString("\n\n")
		b.WriteString("Os índices foram apagados e o índice principal foi recriado a partir do mapping.\n\n")
		b.WriteString(infoStyle.Render("[Enter] Voltar ao Menu"))

	case stateDictDone:
		b.WriteString(headerStyle.Render("📚 Dicionário de Cursos Atualizado com Sucesso!"))
		b.WriteString("\n\n")
		b.WriteString(boxStyle.Render(fmt.Sprintf(
			"• Origem (índice principal): %s\n"+
				"• Destino (índice dicionário): %s\n"+
				"• Cursos únicos no dicionario_cursos: %d\n",
			m.cfg.IndexName,
			m.cfg.DictIndexName,
			m.dictDocs,
		)))
		b.WriteString("\n\n")
		b.WriteString(infoStyle.Render("[Enter] Voltar ao Menu"))

	case stateError:
		b.WriteString(headerStyle.Render("❌ Ocorreu um Erro"))
		b.WriteString("\n\n")
		b.WriteString(statusOfflineStyle.Render(m.errorMsg))
		b.WriteString("\n\n")
		b.WriteString(infoStyle.Render("[Enter] Voltar ao Menu"))
	}

	return b.String()
}
