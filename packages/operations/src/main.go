package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/mattn/go-isatty"
)

func main() {
	cfg := LoadConfig()

	es, err := NewElasticsearchClient(cfg)
	if err != nil {
		log.Printf("Aviso ao inicializar cliente Elasticsearch: %v", err)
	}

	// Se não houver terminal interativo anexado, informa como conectar e aguarda sinal
	if !isatty.IsTerminal(os.Stdin.Fd()) && !isatty.IsCygwinTerminal(os.Stdin.Fd()) {
		fmt.Println("================================================================================")
		fmt.Println("⚡ OPERATIONS TUI PRONTO!")
		fmt.Println("Para acessar o menu interativo, execute em outro terminal:")
		fmt.Println("   podman exec -it se_operations ./operations")
		fmt.Println("ou conecte-se via attach:")
		fmt.Println("   podman attach se_operations")
		fmt.Println("================================================================================")

		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan
		return
	}

	p := tea.NewProgram(NewTUIModel(cfg, es), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Erro ao executar aplicativo TUI: %v\n", err)
		os.Exit(1)
	}
}
