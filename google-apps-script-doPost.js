// Opcional: defina o ID da planilha e/ou o nome da aba.
// Se deixar em branco, o script usa a planilha/aba ativa (recomendado se o script estiver vinculado à planilha).
var SHEET_ID = '';
var SHEET_NAME = '';

function ensureHeaders(sheet, headers) {
  var firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var hasAny = firstRow.some(function (v) { return v && String(v).trim(); });
  var same = firstRow.join('|') === headers.join('|');
  if (!hasAny || !same) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function parsePayload(e) {
  if (!e || !e.postData) {
    return { error: 'Evento ou postData ausente', data: null, raw: '', type: '' };
  }
  var raw = e.postData.contents || '';
  var type = e.postData.type || '';
  var data = null;
  try {
    data = JSON.parse(raw);
  } catch (jsonErr) {
    // Tenta parâmetros de formulário (x-www-form-urlencoded)
    var params = e.parameter || {};
    if (Object.keys(params).length) {
      data = params;
    }
  }
  return { error: null, data: data, raw: raw, type: type };
}

function getSheet() {
  var ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Não foi possível abrir a planilha. Verifique permissões/ID.');
  if (SHEET_NAME) {
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    return sh;
  }
  return ss.getActiveSheet();
}

function doPost(e) {
  Logger.log('Execução iniciada');
  try {
    var parsed = parsePayload(e);
    if (!parsed.data) {
      Logger.log('Erro: Evento ou postData ausente. Evento recebido: ' + e);
      return ContentService.createTextOutput('Erro: Dados não recebidos').setMimeType(ContentService.MimeType.TEXT);
    }

    Logger.log('Tipo recebido: ' + parsed.type);
    Logger.log('Trecho do corpo (200 chars): ' + (parsed.raw || '').substr(0, 200));

    var payload = parsed.data || {};
    var contact = payload.contact || {};
    var utm = payload.utm || {};

    var headers = [
      'ts', 'score', 'result',
      'nome', 'empresa', 'whatsapp', 'email',
      'utm_source', 'utm_medium', 'utm_campaign',
      'Q2_label', 'Q2_value',
      'Q3_label', 'Q3_value',
      'Q4_label', 'Q4_value',
      'Q7_label', 'Q7_value'
    ];

    var sheet = getSheet();
    ensureHeaders(sheet, headers);

    var row = [
      payload.ts || new Date().toISOString(),
      payload.score || '',
      payload.result || '',
      contact.nome || '',
      contact.empresa || '',
      contact.whatsapp || '',
      contact.email || '',
      utm.utm_source || '',
      utm.utm_medium || '',
      utm.utm_campaign || '',
      payload.Q2_label || '',
      payload.Q2_value || '',
      payload.Q3_label || '',
      payload.Q3_value || '',
      payload.Q4_label || '',
      payload.Q4_value || '',
      payload.Q7_label || '',
      payload.Q7_value || ''
    ];

    sheet.appendRow(row);
    Logger.log('Dados inseridos na planilha');
    Logger.log('Execução concluída');
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    Logger.log('Erro ao processar: ' + err.toString());
    return ContentService.createTextOutput('Erro interno').setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet() {
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}