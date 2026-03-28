Spec: Tarefa 3.6 - Modo Karaoke (Visualização)
Objetivo: Facilitar o acompanhamento da letra durante o play.

Lógica: 1. O componente de preview deve monitorar o currentTime do player de áudio.
2. Mapear qual objeto dentro do array lyrics_sync corresponde ao tempo atual.
3. Destaque: Aplicar uma classe CSS (ex: bg-yellow-200 ou text-blue-600 font-bold) na frase ativa.

Dica: Como o Whisper entrega o start e end de cada frase, basta um simples filter no array de sincronia a cada atualização do player.