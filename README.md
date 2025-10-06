# Diagnóstico de Impacto da Reforma Tributária

Formulário estático (HTML/CSS/JS) pronto para ser publicado e compartilhado.

- Resultado apresenta um medidor animado acompanhado de cartões explicando os principais fatores (ramo, regime, financeiro, etc.) que levaram ao score final.

## Como gerar um link rápido (sem instalar nada)

Opção recomendada: Netlify Drop (drag & drop)
1. Acesse: https://app.netlify.com/drop
2. Arraste para a página os arquivos `index.html`, `script.js` e `styles.css` (ou compacte a pasta e solte o `.zip`).
3. Aguarde o upload — o Netlify exibirá uma URL pública imediata (ex.: `https://seu-site-netlify.app`).
4. Compartilhe esse link normalmente.

Observações:
- Se quiser personalizar o subdomínio, crie uma conta gratuita e renomeie o site no painel da Netlify.
- Republique a qualquer momento refazendo o drop (o link pode mudar, use uma conta para manter o mesmo site).

## Alternativas de publicação

- Vercel (rápido e grátis)
  - Pelo site: crie um projeto novo e faça o upload dos três arquivos (precisa login).
  - VS Code: instale a extensão “VSCode Vercel”, conecte sua conta e faça o deploy pela extensão.
- GitHub Pages (gratuito)
  - Crie um repositório com estes arquivos na raiz, faça o push para a branch `main` e habilite o GitHub Pages no repositório.
  - O link fica algo como: `https://seu-usuario.github.io/diagnostico-reforma/`.
- Live Server QR (testes na mesma rede)
  - Com a extensão “Live Server QR”, você escaneia um QR para abrir no celular na mesma rede. Não é link público para internet.

## Parâmetros úteis no link

- Rastreio de campanha (exemplo):
  - `?utm_source=instagram&utm_medium=bio&utm_campaign=diagnostico`
- Admin/Exportar CSV (exporta os envios salvos no navegador):
  - Acrescente `?admin=1` ao link para exibir o botão “Exportar resultados (CSV)”.

## Centralizar as respostas depois (opcional)

Você pode receber todas as respostas em um endpoint (ex.: Google Apps Script escrevendo em uma planilha Google). Quando tiver a URL, adicione no `index.html` algo como:

```html
<script>
  window.RESPONDER_ENDPOINT = 'https://SUA_URL_ENDPOINT_AQUI';
</script>
```

O formulário enviará cada submissão por POST JSON para esse endereço além de salvar localmente para exportação CSV.

### Google Apps Script pronto (grava apenas score final, classe de resultado e contato)

Cole este código no Apps Script (Extensões > Apps Script) e publique como Web App (Acessível para "Qualquer pessoa com o link"):

```javascript
function doPost(e) {
  try {
    var raw = e.postData && e.postData.contents ? e.postData.contents : null;
    if (!raw) return ContentService.createTextOutput('no body').setMimeType(ContentService.MimeType.TEXT);
    var data = JSON.parse(raw);

    // Planilha: primeira aba
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheets()[0];

    // Cabeçalho esperado na linha 1:
    // ts, score, result, nome, whatsapp, email, utm_source, utm_medium, utm_campaign
    var row = [
      data.ts || new Date().toISOString(),
      data.score || '',
      data.result || '',
      (data.contact && data.contact.nome) || '',
      (data.contact && data.contact.whatsapp) || '',
      (data.contact && data.contact.email) || '',
      (data.utm && data.utm.utm_source) || '',
      (data.utm && data.utm.utm_medium) || '',
      (data.utm && data.utm.utm_campaign) || ''
    ];
    sh.appendRow(row);

    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('error').setMimeType(ContentService.MimeType.TEXT);
  }
}
```

Depois de publicar, copie a URL final (termina com `/exec`) e cole no `index.html` no trecho:

```html
<script>
  window.RESPONDER_ENDPOINT = 'https://script.google.com/macros/s/SEU_ID/exec';
  // (remova o comentário e substitua SEU_ID pelo seu)
</script>
```