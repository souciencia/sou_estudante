# Evoluir o bulker para um aplicativo TUI

A aplicação está crescendo e está na hora de evoluir o container `bulker` para uma aplicação TUI que terá um menu de opções. 

## Esse aplicativo precisa:

### Exibir um menu com as opções

- Inserção de dados no banco
- Obter a Api-key (e atualizar o `.env`com a nova chave)
- Limpar o banco (apagar os índices existentes)
- Opção de sair da aplicação e fazer o down
- As opções devem ter um atalho no teclado que é exibido na tela.

### Ter a opção de Inserção de dados no banco

- Verificar se o container `se_es1` está up
- Pedir o caminho do arquivo que contem os dados
- Inserir esses dados no elasticsearch
- Chamar a função `create_indice_cursos` 


### Na função create_indice_cursos()
Deve criar uma espécie de sumário dos cursos existentes. 
- vai percorrer todos os docs criados no indice `cursos`, pegar todos os valores sem repetição para `"curso": { "no_curso" } `, armazená-los em um array, e com este array, criar um índice chamado `indice_cursos`. Me informe qual estratégia você usará para peagr apenas os valores sem repetição. Para deixar mais claro, cada valor será armazenado apenas uma vez.
- Motivo: para tornar possível o objetivo da tarefa `tarefa-nova-estrategia-de-pesquisa.md`


### Start
Essa aplicação deverá aparecer assim que o container subir. Se não for possível, quando o container estiver pronto, deverá exibir uma mensagem de como entrar na aplicação.


## Mais intruções
- Use Bubble Tea.
- Altere o que for necessário em docker-compose.yml, mas me avise antes o que precisar alterar
- Use as skills `tdd` e `coding-and-refactor`
