# nova estratégia de pesquisa

A nova estratégia de pesquisa no front será procurar o nome do curso primeiro em `indice_cursos`, onde deverá aparecer um autocompletar em um menu suspenso com todas as opções que batem, e só quando o usuário escolher uma das opções ou apertar enter, é que uma nova requisição será feita dest vez em `cursos` trazendo os resultados do índice principal. Implemente esta nova estratégia separando as responsabilidades da seguinte forma:

- as regras de negócio devem ficar na api, seguindo a premissa "thin front, fat server".
- o front não deve ver mudanças na forma como consulta, apenas na apresentação do autocompletar.

**Mais instruções**
- Use as skills `tdd` e `coding-and-refactor`
- Peça confirmação a cada passo antes de continuar
- Crie novos componentes no front se necessário, mas me explique o que fará antes