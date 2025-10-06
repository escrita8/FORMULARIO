# Resumo do projeto – Diagnóstico de Impacto da Reforma Tributária

Atualizado em: 2025-10-06

## Visão geral
Aplicação estática (HTML/CSS/JS) que conduz um diagnóstico em etapas, calcula um índice de impacto (0–100), exibe o resultado com um quadro detalhado por pergunta e captura dados de contato para retorno. Publicação via GitHub Pages e opção de envio dos resultados para Google Sheets via Apps Script.

## O que está pronto
- Fluxo do questionário com capa + 8 perguntas, seguindo o briefing atualizado:
  - R1: Ramo da empresa
  - R2: Número de funcionários (correlação com regime/parcela de clientes)
  - R3: Faixa de faturamento anual
  - Q1: Regime tributário (regras específicas para Simples vs. Lucro Presumido/Real)
  - Q2: Regime dos fornecedores (ênfase em Simples/MEI/PF vs. Regime normal)
  - Q3: Perfil de clientes
  - Q4: Conhecimento de cadastros fiscais
  - Q5: Saúde financeira (seleção múltipla com cálculo dinâmico)
- Pesos do cálculo normalizados (10% para cada pergunta, totalizando 100% após normalização)
- Resultado:
  - Medidor animado exibindo o Índice de Impacto (0–100%) com contagem progressiva
  - Barra gradiente que acompanha a animação e muda de cor conforme faixas (baixo/médio/alto)
  - Cartões explicativos destacando os principais fatores (ramo, regime, financeiro, etc.) que levaram ao resultado
  - Conteúdo textual de recomendações por faixa permanece inalterado
- Contato obrigatório para ver o resultado:
  - Nome e WhatsApp obrigatórios; E-mail e Nome da empresa opcionais
  - Validação visual (borda vermelha) e habilitação dinâmica do botão “Ver resultado”
- Botões nas telas de resultado:
  - Empilhados verticalmente, alinhados à esquerda, largura reduzida (max-width: 360px)
  - “Tirar dúvidas” e “O que a 3C CONTABILIDADE oferece?” em azul (btn--primary) com WhatsApp e site atualizados
- Responsividade (mobile):
  - Tabela do resultado reorganiza em duas linhas por item no celular para evitar corte de conteúdo
  - Quebra de linha e colunas ajustáveis para caber na tela
- Cabeçalho e capa:
  - Título à esquerda, logo centralizada, CTA WhatsApp à direita
  - Rodapé de navegação oculto na capa (mantém “Começar agora” dentro da capa)
- Anti-duplicação de envio e utilitários:
  - Flag de envio (submissionSent)
  - Admin bar com exportação CSV via `?admin=1`
  - Modo debug via `?debug=1`

## Integração e dados
- Persistência local: `localStorage`
- Exportação CSV (inclui R1/R2, respostas e contato)
- Endpoint externo (Apps Script): preparado em `window.RESPONDER_ENDPOINT` no HTML; envio com `no-cors` e `text/plain` (sendBeacon de fallback)

## Publicação
- Projeto hospedado no GitHub Pages; já realizamos commits e push na branch `main`

## Pontos recentes implementados
- Inclusão da lógica condicional entre regime tributário, perfil de clientes e porte
- Pergunta financeira agora aceita múltiplas seleções com score dinâmico
- Ajustes visuais: botões empilhados, largura limitada, alinhamento à esquerda
- Medidor animado no resultado final em vez do breakdown detalhado
- Responsividade da tabela em telas pequenas

## Próximos passos sugeridos
- Ajustar UTMs personalizados nos links externos, se necessário para campanhas
- Opcional: voltar a lógica de cores por faixa (verde/até 15, amarelo/até 50, vermelho/até 100) se desejado
- Ajustar paleta para harmonizar 100% com a logo (variáveis do tema em `:root`)
- Opcional: deduplicação server-side no Apps Script (idempotência por timestamp+email ou hash)
- Revisar thresholds de classificação final (alto/médio/baixo) e textos de recomendação

## Como retomar depois
1. Abrir o arquivo `index.html` e `script.js` para continuar ajustes de perguntas, textos e CTAs
2. Se for alterar pesos ou lógica do score, editar `weights` em `script.js`
3. Para mudar layout/cores, editar `styles.css` (ver seções: resultado, buttons, tema)
4. Se alterar endpoint, atualizar `window.RESPONDER_ENDPOINT` no `index.html`
5. Testes rápidos:
  - `?debug=1` para ver payload/endpoint no console
  - `?admin=1` para exportar CSV local
6. Publicar: `git add . && git commit -m "ajustes" && git push`

---
Qualquer ajuste fino desejado (ex.: responsividade em outros breakpoints, tom das cores, ordem das linhas, formatação do WhatsApp/e-mail), podemos dar sequência a partir deste ponto.