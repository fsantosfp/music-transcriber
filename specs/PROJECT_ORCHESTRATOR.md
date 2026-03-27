# Master Orchestrator: Music Transcriber MVP

## 🛠 Modo de Operação
O agente deve atuar como um Desenvolvedor Senior Fullstack. Toda a execução é baseada em Spec-Driven Development (SDD).

## 🔄 Ciclo de Trabalho Obrigatório
Para cada tarefa definida na pasta `/specs/tasks/`, o agente deve:
1. **Consultar o `PROGRESS.md`** para identificar a tarefa atual.
2. **Ler a Spec detalhada** da tarefa em `/specs/tasks/TASK_X.md`.
3. **Implementar o Código** seguindo rigorosamente os padrões técnicos.
4. **Escrever e Executar Testes Unitários** (Pytest / Vitest) conforme `SPEC_GLOBAL_TESTING.md`.
5. **Atualizar o `PROGRESS.md`** marcando a tarefa como concluída.
6. **Reportar ao Usuário** o resultado e pedir permissão para avançar.

## 🛑 Regras de Ouro e Bloqueio
- **Contexto Isolado:** Cada tarefa deve ser executada em um branch Git separado (ex: feature/task-1-1).
- **Test-First:** A tarefa NÃO está concluída se os testes falharem ou não existirem.
- **Documentação:** Atualizar o README.md com novas rotas ou configs em cada tarefa.
- **Ordem Serial:** Nunca inicie o Milestone N+1 sem concluir o Milestone N.