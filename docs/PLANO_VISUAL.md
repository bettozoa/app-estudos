# Guia visual e fluxo diário — app de estudos

Complemento do `PLANO_APP_ESTUDOS.md`. Este documento cobre identidade visual, componentes e o
fluxo da tela inicial (revisão do dia → capítulo → prova próxima).

Público: 6 a 10 anos. Referência de interação: Duolingo. Referência estética: desenho animado
com contorno grosso, tipo Cartoon Network / livro infantil moderno — nada de gradiente, nada de
sombra realista, nada de 3D.

---

## 1. Mascote

Um **gato**. É o único personagem do app e é ele quem fala com a criança — o app nunca fala em
"você deve", quem pede é o gato.

- **Nome:** deixe a criança batizar no primeiro acesso ("Como você vai chamar seu gato?").
  Custa uma tela e cria vínculo imediato. O nome escolhido aparece nas falas.
- **Construção:** cabeça circular, orelhas triangulares, olhos grandes com brilho, focinho
  pequeno, bochechas rosadas, bigodes finos. Contorno `#1F2E3D` com 3px em tudo. Corpo só
  aparece nas poses maiores.
- **Estados (6 poses, mesmo rosto base):**

| Estado | Quando aparece |
|---|---|
| Acenando | tela inicial, saudação |
| Comemorando (patinhas para cima) | acerto, conquista, fim de sessão |
| Pensando (pata no queixo) | pergunta difícil, dica |
| Encorajando (pata estendida) | erro — nunca cara de bravo |
| Dormindo | criança não estudou hoje / ofensiva em risco |
| Fantasiado | itens da loja (chapéu, capa, óculos) |

**Regra de ouro:** o gato nunca fica triste ou decepcionado com a criança. No erro ele é
animado ("Quase! Olha só..."). Culpa desmotiva; curiosidade sustenta.

---

## 2. Paleta

Cores quentes e saturadas, com contorno escuro dando o aspecto de adesivo.

| Papel | Hex | Uso |
|---|---|---|
| Contorno | `#1F2E3D` | borda de tudo, 3px; também é a cor do texto |
| Fundo | `#FFF8EC` | papel creme, fundo do app |
| Superfície | `#FFFFFF` | cards |
| Laranja (ação) | `#E2542B` | botão principal, mascote, ofensiva |
| Amarelo (recompensa) | `#FFC53D` | XP, moedas, estrelas |
| Verde (acerto) | `#2E9E5B` | acerto, progresso concluído |
| Roxo (perfil) | `#7F77DD` | avatar, itens especiais |
| Azul-céu (calma) | `#38A9C9` | telas de leitura, texto de apoio |
| Rosa (detalhe) | `#F5B8B0` | bochechas, acentos |
| Erro | `#E2542B` sobre `#FFE9E3` | feedback de erro — laranja, nunca vermelho-sangue |

Uma matéria = uma cor, fixa para sempre: História laranja, Geografia verde, Ciências azul,
Português roxo, Matemática amarelo. A criança passa a reconhecer a matéria pela cor antes de ler.

---

## 3. Tipografia

- **Títulos e botões:** Baloo 2 (Google Fonts) — arredondada, gordinha, alta legibilidade
  infantil. Alternativas: Fredoka, Nunito.
- **Textos de pergunta:** Nunito ou a mesma Baloo em peso regular.
- **Tamanho mínimo: 16px.** Enunciado 18px. Botão 19–20px.
- Nada de caixa alta em frase inteira e nada de itálico — atrapalha leitor em formação.
- Frases curtas. Se o enunciado do livro for longo, ele vai no bloco de "texto de apoio",
  visualmente separado.

---

## 4. Componentes

- **Botão principal:** retângulo `rx: 18`, altura 56–60px, contorno 3px e uma "base" 4px mais
  escura embaixo (o efeito de tecla do Duolingo). Ao tocar, o botão desce 4px e a base some.
- **Cards:** branco, `rx: 16`, contorno 3px, padding 16–20px.
- **Alternativas de resposta:** cards de toque com no mínimo 56px de altura, um por linha.
  Nada de letras A/B/C/D pequenas — a área toda é clicável.
- **Barra de progresso da sessão:** no topo, cheia e arredondada, com o gato caminhando em cima
  dela conforme avança.
- **Ícones:** desenhados no mesmo traço do gato (mesma espessura de contorno). Nunca misturar
  com biblioteca de ícones lineares finos.
- **Alvo de toque: 48px mínimo**, sempre. Dedo de criança de 7 anos erra bastante.

**Animação e som**

- Acerto: card verde com um pulinho (`scale 1 → 1.06 → 1`, 180ms) + som curto e agudo.
- Erro: card treme de leve na horizontal, o gato entra encorajando. Sem som grave de "errou".
- Conquista/nível: confete SVG por 1,2s. Só nesses momentos — se tudo brilha, nada brilha.
- Som ligado por padrão, com botão de mudo bem visível e persistente.
- Respeitar `prefers-reduced-motion`: sem tremida, sem confete.

---

## 5. Tela "Hoje" — a lógica do que aparece

Esta é a tela inicial e o coração do app. Ela responde a uma pergunta só: **o que eu faço
agora?** A criança nunca precisa decidir; ela só confirma.

### Ordem de prioridade

1. **Tem prova nos próximos 7 dias?** O cartão da prova sobe para o topo e o botão principal
   muda de "Estudar hoje" para **"Treinar para a prova de História"**. O gato fala:
   "A prova é sexta! Vamos treinar cidades planejadas?"
2. **Tem revisão vencida?** Botão principal = "Estudar hoje", com o número de revisões no balão
   do gato. Revisão sempre vem antes de conteúdo novo.
3. **Fila limpa?** O botão vira "Continuar capítulo", apontando para o capítulo em andamento.
4. **Capítulo terminado?** O botão convida para o próximo capítulo publicado, e a trilha mostra
   o nó novo abrindo com animação.

Logo abaixo do botão principal, sempre: o cartão **"Continuar capítulo"** com a barra de
progresso. É o convite para estudar mais depois de fechar a revisão do dia — a indução para
escolher capítulo acontece aí, sem menu e sem lista.

### Composição da sessão

| Situação | Mistura |
|---|---|
| Dia comum | 60% revisões vencidas + 40% questões novas do módulo atual |
| Sem revisão vencida | 100% novas, até fechar o módulo |
| Sem conteúdo novo | Revisões antecipadas (as de caixa mais baixa primeiro) |
| Prova em ≤7 dias | 70% do capítulo da prova + 30% do resto da fila |

Sessão-alvo: 15 a 20 questões, de 5 a 8 minutos. Curto o bastante para caber antes do jantar.

### Provas no banco

```sql
provas (
  id uuid pk,
  aluno_id uuid fk,
  materia_id text fk,
  titulo text,             -- "Prova 3ª etapa"
  data date,
  capitulos text[],        -- ids dos capítulos cobrados
  criada_por uuid          -- responsável
)
```

O responsável cadastra a prova em três toques (matéria, data, capítulos) na área dele. A partir
daí:

- 7 dias antes: cartão de aviso na tela Hoje e mudança do botão principal.
- 3 dias antes: o cartão fica em destaque e o gato passa a cobrar todo dia.
- No dia anterior: modo **"Revisão de prova"** — varre todo o capítulo ignorando o agendamento,
  priorizando o que ela mais errou.
- Depois da data: some sozinho e volta ao fluxo normal.

Se ninguém cadastrar prova nenhuma, o app funciona igual — a prova é um acelerador, não um
requisito.

---

## 6. Telas e o que cada uma precisa mostrar

| Tela | Essencial |
|---|---|
| **Hoje** | ofensiva, XP, gato falando, botão principal, cartão do capítulo, cartão de prova |
| **Sessão** | barra de progresso com o gato, pergunta, alternativas grandes, feedback com explicação e fonte |
| **Fim de sessão** | XP ganho, ofensiva atualizada, conquistas novas, "o que escapou", botão de continuar |
| **Trilha** | matérias em cartões coloridos → capítulos → módulos em nós (bloqueado, aberto, dominado) |
| **Loja** | moedas, itens de fantasia do gato e temas de cor |
| **Perfil** | avatar do gato vestido, conquistas em grade, ofensiva máxima |
| **Área do responsável** | protegida por PIN: cadastro de provas, relatório de erros, gerar simulado em PDF |

---

## 7. Onboarding (uma vez, 4 telas)

1. O gato aparece e se apresenta.
2. "Qual é o seu nome?" (só o primeiro nome ou apelido).
3. "Como vai se chamar seu gato?"
4. "Escolha a cor do seu tema" — três opções. Já entrega uma escolha de personalização antes de
   qualquer esforço, o que aumenta muito a chance de a criança voltar.

Depois disso, cai direto na primeira sessão. Nenhum tutorial de texto: a primeira pergunta é
fácil de propósito, para o primeiro acerto vir em segundos.

---

## 8. Instruções para o Claude Code

- Criar `src/design/tokens.ts` com a paleta e os raios acima; **nenhum hex solto** em componente.
- O mascote é um componente SVG único com prop `estado`, com as poses no mesmo `viewBox` —
  troca de pose sem redesenhar layout.
- Componentes base primeiro: `BotaoPrincipal`, `Card`, `CartaoAlternativa`, `BarraProgresso`,
  `Mascote`, `Pilula` (ofensiva/XP). Todas as telas se montam com esses seis.
- A lógica da seção 5 vira uma função pura testável:
  `decidirAcaoDoDia(revisoesVencidas, capituloAtual, provasProximas, hoje) → { tipo, rotulo, alvo }`.
  Ela é o único lugar que decide o que a tela Hoje mostra.
- Fontes servidas localmente (`@fontsource/baloo-2`), não por CDN — o app precisa abrir offline.
