function doPost(e) {
  Logger.log('Execução iniciada');
  try {
    if (!e || !e.postData) {
      Logger.log('Erro: Evento ou postData ausente. Evento recebido: ' + e);
      return ContentService.createTextOutput('Erro: Dados não recebidos').setMimeType(ContentService.MimeType.TEXT);
    }
    const payload = JSON.parse(e.postData.contents);
    // Obter a planilha ativa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Inserir linha com os novos campos
    sheet.appendRow([
      payload.ts,
      payload.score,
      payload.result,
      payload.contact.nome,
      payload.contact.empresa,
      payload.contact.whatsapp,
      payload.contact.email,
      payload.utm.utm_source,
      payload.utm.utm_medium,
      payload.utm.utm_campaign,
      payload.Q2_label,
      payload.Q2_value,
      payload.Q3_label,
      payload.Q3_value,
      payload.Q4_label,
      payload.Q4_value,
      payload.Q7_label,
      payload.Q7_value
    ]);
    Logger.log('Dados inseridos na planilha');
    Logger.log('Execução concluída');
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    Logger.log('Erro ao processar: ' + err.toString());
    return ContentService.createTextOutput('Erro interno').setMimeType(ContentService.MimeType.TEXT);
  }
}