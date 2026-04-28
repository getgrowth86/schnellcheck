const { google } = require('googleapis');

// Umgebungsvariablen aus Vercel
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}');

async function appendToSheet(values) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:L',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values],
      },
    });

    return result;
  } catch (error) {
    console.error('Google Sheets Error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      timestamp,
      name,
      email,
      phone,
      callTime,
      arbeitsmodell,
      einkommen,
      geschwister,
      elterngeld_ohne,
      elterngeld_mit,
      elterngeld_diff,
      price,
    } = req.body;

    // Validierung
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Reihenfolge muss mit Sheet-Spalten matchen
    const rowData = [
      timestamp || new Date().toISOString(),
      name,
      email,
      phone,
      callTime || '',
      arbeitsmodell || '',
      einkommen || '',
      geschwister || '',
      elterngeld_ohne || '',
      elterngeld_mit || '',
      elterngeld_diff || '',
      price || '',
    ];

    // Zu Sheet hinzufügen
    await appendToSheet(rowData);

    // TODO: Email versenden (nächster Schritt)

    return res.status(200).json({ 
      success: true, 
      message: 'Lead erfolgreich gespeichert',
      timestamp: timestamp 
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to save lead',
      details: error.message 
    });
  }
}
