import { useState, useEffect, useRef } from 'react';

const LOGO = 'https://i.imgur.com/SWNd8hL.png';
const ALINA_FOTO = 'https://i.imgur.com/T3OCg2m.jpeg';

const C = {
  forest: '#1b4332',
  green: '#2d6a4f',
  greenMid: '#40916c',
  greenLight: '#52b788',
  greenPale: '#d8f3dc',
  greenFaint: '#f0faf4',
  cream: '#fffdf7',
  accent: '#e76f51',
  accentSoft: '#fce8e2',
  text: '#1a1a2e',
  textMed: '#3d4550',
  textLight: '#6b7280',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
};

const FLOW = [
  {
    id: 'welcome',
    bot: ['Ich bin Alina, Elterngeld-Expertin 👋', 'In 60 Sekunden weißt du genau, wie viel dir zusteht.'],
    type: 'start',
  },
  {
    id: 'arbeitsmodell',
    bot: ['Erste Frage: Arbeitest du angestellt oder machst du dein eigenes Ding?'],
    type: 'select',
    options: [
      { label: 'Angestellt', value: 'angestellt' },
      { label: 'Selbständig/Freiberufler', value: 'selbstaendig' },
    ],
  },
  {
    id: 'einkommen_angestellt',
    bot: ['Wie viel verdienst du ungefähr monatlich (Brutto)?'],
    type: 'select',
    options: [
      { label: 'Unter 1.500€', value: 1200 },
      { label: '1.500–2.500€', value: 2000 },
      { label: '2.500–3.500€', value: 3000 },
      { label: '3.500–4.500€', value: 4000 },
      { label: 'Über 4.500€', value: 5000 },
    ],
  },
  {
    id: 'einkommen_selbstaendig',
    bot: ['Wie sah dein durchschnittlicher monatlicher Gewinn aus?'],
    type: 'select',
    options: [
      { label: 'Unter 1.500€', value: 1200 },
      { label: '1.500–2.500€', value: 2000 },
      { label: '2.500–3.500€', value: 3000 },
      { label: '3.500–4.500€', value: 4000 },
      { label: 'Über 4.500€', value: 5000 },
    ],
  },
  {
    id: 'geschwister',
    bot: ['Gibt es Geschwister?'],
    type: 'select',
    options: [
      { label: 'Ja', value: 'ja' },
      { label: 'Nein', value: 'nein' },
      { label: 'Weiß nicht', value: 'nein' },
    ],
  },
  {
    id: 'phonegate',
    bot: ['Perfekt! 🎉', 'Trag deine Kontaktdaten ein, dann zeige ich dir dein personalisiertes Ergebnis.'],
    type: 'phonegate',
  },
];

function calcEG(a) {
  const b = a.einkommen_angestellt || a.einkommen_selbstaendig || 2000;
  const eg = Math.max(300, Math.min(Math.round((b * 0.6 * 0.67)), 1800));
  return { eg: eg, opt: eg, diff: eg * 14 - eg * 12 };
}

function Bot({ children, delay }) {
  const [show, setShow] = useState(!delay);
  useEffect(() => {
    if (delay) setTimeout(() => setShow(true), delay);
  }, [delay]);

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', opacity: show ? 1 : 0, transition: 'opacity 0.3s' }}>
      <img src={ALINA_FOTO} alt="Alina" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 30%', flexShrink: 0 }} />
      <div style={{ background: C.borderLight, borderRadius: '4px 14px 14px 14px', padding: '11px 15px', fontSize: 14.5, lineHeight: 1.55, maxWidth: '82%', color: C.text }}>
        {show ? children : '...'}
      </div>
    </div>
  );
}

function User({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ background: C.green, color: '#fff', borderRadius: '14px 4px 14px 14px', padding: '10px 15px', fontSize: 14.5 }}>{text}</div>
    </div>
  );
}

function Btn({ label, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        border: '2px solid ' + (h ? C.greenMid : C.green),
        background: h ? C.green : '#fff',
        color: h ? '#fff' : C.green,
        borderRadius: 10,
        padding: '9px 16px',
        fontSize: 13.5,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all .18s',
      }}
    >
      {label}
    </button>
  );
}

function PhoneGate({ onSubmit, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);

  const handleStep1 = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim() && email.includes('@')) {
      setStep(2);
    }
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (phone.trim().length >= 9) {
      onSubmit(name.trim(), email.trim(), phone.trim());
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: '1.5px solid ' + C.green,
      padding: 24,
      margin: '8px 0',
      boxShadow: '0 4px 12px rgba(45,106,79,0.15)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
        <h3 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 18,
          fontWeight: 700,
          color: C.forest,
          margin: '0 0 6px'
        }}>
          {step === 1 ? 'Dein Ergebnis wartet' : 'Alina ruft dich an'}
        </h3>
        <p style={{ fontSize: 13, color: C.textMed, margin: 0 }}>
          {step === 1 
            ? 'Kostenlose, persönliche Beratung – keine versteckten Gebühren'
            : 'Alina berät dich zur optimalen Lösung für deine Situation'
          }
        </p>
      </div>

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            placeholder="Dein Vorname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              border: '1.5px solid ' + C.border,
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <input
            type="email"
            placeholder="Deine E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              border: '1.5px solid ' + C.border,
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg,' + C.green + ',' + C.greenMid + ')',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '13px 20px',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {loading ? 'Wird verarbeitet...' : 'Weiter →'}
          </button>
        </form>
      )}

      {/* Step 2: Phone */}
      {step === 2 && (
        <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="tel"
            placeholder="Deine Telefonnummer"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              border: '1.5px solid ' + C.border,
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg,' + C.green + ',' + C.greenMid + ')',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '13px 20px',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {loading ? 'Wird verarbeitet...' : 'Beratung buchen'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.textLight,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            ← Zurück
          </button>
        </form>
      )}

      {/* Trust Badges */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid ' + C.borderLight, fontSize: 12, color: C.textLight, textAlign: 'center', lineHeight: 1.6 }}>
        <div style={{ marginBottom: 8 }}>
          ✅ <strong>Zertifiziert</strong> — Wirtschaftswissenschaftlerin<br/>
          🔒 <strong>DSGVO-konform</strong> — Deine Daten sind sicher
        </div>
      </div>
    </div>
  );
}
