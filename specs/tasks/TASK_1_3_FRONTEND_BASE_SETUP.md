# Spec: Tarefa 1.3 - Front-end Base e Componente de Upload
## 1. Objetivo
Configurar o ambiente Front-end utilizando React e Vite, e implementar a tela inicial de upload com suporte a "Drag & Drop", integrada ao endpoint de backend.

## 2. Stack Tecnológica
Framework: React (Vite) com TypeScript.

Estilização: Tailwind CSS (para prototipação rápida e responsiva).

Icons: Lucide-react (ícones leves e modernos).

Upload: react-dropzone.

HTTP Client: Axios.

## 3. Estrutura de Pastas (Frontend)
/frontend
├── Dockerfile
├── index.html
├── src/
│   ├── api/            # Configuração do Axios
│   ├── components/     # Componentes reutilizáveis (Dropzone, Button)
│   ├── hooks/          # Hooks para gerenciar estado de upload
│   └── App.tsx         # Layout principal
└── tailwind.config.js

## 4. Requisitos de Implementação
4.1. Configuração do Docker (Frontend)
Criar um Dockerfile para o frontend usando node:18-alpine.

Atualizar o docker-compose.yml na raiz para incluir o serviço frontend, mapeando a porta 5173.

Importante: Configurar o Proxy no Vite para evitar problemas de CORS em ambiente de desenvolvimento local.

4.2. Componente de Upload (UI/UX)
Implementar o Box de Upload centralizado (conforme imagem 1 do esboço).

Estados Visuais:

Default: Área pontilhada com ícone de upload.

DragActive: Mudar a cor da borda/fundo quando o usuário arrastar um arquivo sobre a área.

Uploading: Mostrar um spinner ou barra de progresso simples.

Feedback: Mostrar o nome do arquivo selecionado e um botão "Enviar" (ou enviar automaticamente após o drop, para maior agilidade).

4.3. Integração com API
Criar uma instância do Axios apontando para http://localhost:8000/api/v1.

Ao finalizar o upload com sucesso, o sistema deve capturar o id (UUID) retornado pelo backend e armazenar no estado local (ou redirecionar para a visualização).

## 5. Critérios de Aceite (Do / Don't)
✅ O que FAZER (Do)
[ ] Validar no Front-end a extensão do arquivo antes de enviar (apenas áudios).

[ ] Implementar um componente de "Toaster" ou Alerta para exibir erros (ex: "Arquivo muito grande").

[ ] Garantir que o design seja centralizado e focado na produtividade (sem distrações).

[ ] Adicionar o campo status do backend no estado do componente para preparar para a Tarefa 2.1.

❌ O que NÃO FAZER (Don't)
[ ] Não gastar tempo com bibliotecas de UI complexas (Material UI/Chakra); Tailwind puro é suficiente para agilidade.

[ ] Não implementar a tela de edição de transcrição ainda (foco no Milestone 1).

[ ] Não fazer deploy em cloud; o setup deve ser estritamente local via Docker.

## 6. Ajuste Necessário no Backend (CORS)
Nota para o Agente: Como o Frontend e Backend rodam em portas diferentes, o agente deve voltar ao backend/main.py e configurar o CORSMiddleware do FastAPI para permitir origens de http://localhost:5173.