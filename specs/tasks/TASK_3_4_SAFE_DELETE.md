Spec: Tarefa 3.4 - Deleção Segura (Padrão AWS)
Objetivo: Limpeza de dados com proteção contra cliques acidentais.

Backend: DELETE /api/v1/music/{id} deve apagar o registro no banco e remover os arquivos físicos da pasta /uploads (original e vocal isolado).

Frontend (O Modal AWS): - Ao clicar em "Deletar", abrir um modal.

Exibir o texto: "Para confirmar, digite deletar no campo abaixo".

O botão "Confirmar Exclusão" deve permanecer Disabled até que o input seja exatamente igual ao esperado.

Bulk Delete: No Dashboard, permitir selecionar múltiplos checkboxes e abrir o mesmo modal informando a quantidade de arquivos que serão removidos.