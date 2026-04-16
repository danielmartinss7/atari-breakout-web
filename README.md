# Atari Space Invaders Clone

Repositório original re-aproveitado, a pedido do usuário, para focar na criação de um clone perfeito do clássico Space Invaders do Atari 2600 e Arcades.

## Mudanças do Breakout para este Projeto
Toda a base foi rescrita para o novo jogo. O sistema agora não depende mais de esferas genéricas de colisão, mas renderiza "Pixel Arrays" inteiros criando os famosos blocos pontilhados dos alienígenas da década de 80. Construímos também o som internamente com Web Audio API.

## Controles
- **Mover:** Setas do teclado (Direita, Esquerda) ou as teclas A / D. (Você pode usar os dedos nas telas móveis e arrastar!).
- **Atirar:** Barra de Espaço (`SPACE`).

## Aspectos Visuais
- **Tela de Tubo CRT:** Inserimos camadas em CSS para aplicar 'Scanlines' horizontais, garantindo a estética retrô fiel das TVs dos anos 80.
- **Bunkers Destrutíveis:** As bases verdes se degradam aos poucos através de uma física bloco-a-bloco a cada tiro que absorvem, idêntico aos Arcades!
