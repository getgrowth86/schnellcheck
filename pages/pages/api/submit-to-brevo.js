export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    return res.status(500).json({ error: 'Missing BREVO_API_KEY' });
  }

  try {
    const {
      timestamp,
      name,
      email,
      phone,
      callTime,
      et,
      arbeitsmodell,
      einkommen,
      geschwister,
      steuerklasse,
      urgency_answer,
      problem,
      help_preference,
      antrag_status,
      partnerschaftsbonus,
      elterngeld_ohne,
      elterngeld_mit,
      elterngeld_diff,
    } = req.body;

    // Validierung
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Kontakt zu Brevo hinzufügen
    const brevoPayload = {
      email: email,
      firstName: name || '',
      attributes: {
        FIRSTNAME: name || '',
        PHONE: phone || '',
        TIMESTAMP: new Date(timestamp).toLocaleString('de-DE'),
        ET: et || '',
        ARBEITSMODELL: arbeitsmodell || '',
        EINKOMMEN: einkommen || '',
        GESCHWISTER: geschwister || '',
        STEUERKLASSE: steuerklasse || '',
        URGENCY: urgency_answer || '',
        PROBLEM: problem || '',
        HELP_PREFERENCE: help_preference || '
