export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, answers } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name || '',
          ET: answers?.et || '',
          ARBEITSMODELL: answers?.arbeitsmodell || '',
          STEUERKLASSE: answers?.steuerklasse || '',
        },
        listIds: [9],
        updateEnabled: true,
      }),
    });

    const data = await brevoRes.json();

    if (!brevoRes.ok && brevoRes.status !== 204) {
      console.error('Brevo error:', data);
      return res.status(500).json({ error: 'Brevo error', detail: data });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
