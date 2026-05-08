function calcEG(a) {
  const income = a.einkommen_angestellt || a.einkommen_selbstaendig || 2000;
  let egBase = Math.max(300, Math.min(Math.round(income * 0.6 * 0.67), 1800));
  let opt = egBase;
  if (a.steuerklasse === 'sk5') opt += 150;
  if (a.steuerklasse === 'sk3') opt += 100;
  if (a.partnerschaftsbonus === 'ja') opt += 200;
  if (a.arbeitsmodell === 'selbstaendig') opt += 400;
  if (a.geschwister === 'ja') opt += 50;
  opt = Math.min(opt, 1800);
  return { eg: egBase, opt, diff: (opt - egBase) * 14 };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, answers } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const r = calcEG(answers || {});

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
          VORNAME: name || '',
          GEBURTSTERMIN: answers?.et || '',
          STEUERKLASSE: answers?.steuerklasse || '',
          ELTERNGELD_OHNE: r.eg,
          ELTERNGELD_MIT: r.opt,
          ELTERNGELD_DIFF: r.diff,
        },
        listIds: [9],
        updateEnabled: true,
      }),
    });

    // 204 = no content (update), 201 = created — beide ok
    if (!brevoRes.ok && brevoRes.status !== 204 && brevoRes.status !== 201) {
      const data = await brevoRes.json();
      console.error('Brevo error:', data);
      return res.status(500).json({ error: 'Brevo error', detail: data });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
