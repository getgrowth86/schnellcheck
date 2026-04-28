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
    id: 'et',
    bot: ['Erste Frage: Wann ist dein Entbindungstermin?'],
    type: 'date',
  },
  {
    id: 'arbeitsmodell',
    bot: ['Arbeitest du angestellt oder bist du selbständig?'],
    type: 'select',
    options: [
      { label: 'Angestellt / Beamtin', value: 'angestellt' },
      { label: 'Selbständig / Freiberufler', value: 'selbstaendig' },
    ],
  },
  {
    id: 'einkommen_angestellt',
    bot: ['Dein Brutto-Monatseinkommen (letzte 12 Monate)?'],
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
    bot: ['Dein durchschnittlicher monatlicher Gewinn (netto)?'],
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
    bot: ['Gibt es ältere Geschwister? (Wichtig für den Bonus)'],
    type: 'select',
    options: [
      { label: 'Ja', value: 'ja' },
      { label: 'Nein', value: 'nein' },
      { label: 'Weiß nicht', value: 'nein' },
    ],
  },
  {
    id: 'steuerklasse',
    bot: ['Deine Steuerklasse oder Partnerschaftssituation?'],
    type: 'select',
    options: [
      { label: 'Alleinerziehend (SK II)', value: 'sk2' },
      { label: 'Verheiratet (SK III)', value: 'sk3' },
      { label: 'Verheiratet (SK IV)', value: 'sk4' },
      { label: 'Verheiratet (SK V)', value: 'sk5' },
      { label: 'Weiß nicht', value: 'sk_unknown' },
    ],
  },
  {
    id: 'antrag_status',
    bot: ['Hast du den Elterngeld-Antrag bereits gestellt?'],
    type: 'select',
    options: [
      { label: 'Ja, schon eingereicht', value: 'ja' },
      { label: 'Nein, noch nicht', value: 'nein' },
      { label: 'Kurz davor', value: 'kurz_davor' },
    ],
  },
  {
    id: 'partnerschaftsbonus',
    bot: ['Könntest du den Partnerschaftsbonus (8 Wochen extra) nutzen?'],
    type: 'select',
    options: [
      { label: 'Ja, geplant', value: 'ja' },
      { label: 'Nein', value: 'nein' },
      { label: 'Noch unsicher', value: 'unsicher' },
    ],
  },
  {
    id: 'phonegate',
    bot: ['Perfekt! 🎉', 'Dein personalisiertes Ergebnis wartet — trag deine Daten ein.'],
    type: 'phonegate',
  },
];

function calcEG(a) {
  const b = a.einkommen_angestellt || a.einkommen_selbstaendig || 2000;
  const eg = Math.max(300, Math.min(Math.round((b * 0.6 * 0.67)), 1800));
  const bonus = a.partnerschaftsbonus === 'ja' ? 200 : 0;
  const opt = Math.min(eg + 300 + bonus, 1800);
  return { eg: eg, opt: opt, diff: (opt - eg) * 14 };
}

function Bot({ children, delay }) {
  const [show, setShow] = useState(!delay);
  useEffect(() => {
    if (delay) setTimeout(() => setShow(true), delay);
  }, [delay]);

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', opacity: show ? 1 : 0, transition: 'opacity 0.3s', marginBottom: 12 }}>
      <img src={ALINA_FOTO} alt="Alina" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 30%', flexShrink: 0 }} />
      <div style={{ background: C.borderLight, borderRadius: '4px 14px 14px 14px', padding: '11px 15px', fontSize: 14.5, lineHeight: 1.55, maxWidth: '82%', color: C.text }}>
        {show ? children : '...'}
      </div>
    </div>
  );
}

function User({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
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

function DateInput({ onSubmit, loading }) {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      setError('Bitte gib dein ET ein');
      return;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    if (selectedDate < today) {
      setError('Das ET liegt in der Vergangenheit. Bist du bereits entbunden?');
      return;
    }
    onSubmit(date);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setError('');
        }}
        style={{
          border: error ? '2px solid #e74c3c' : '1.5px solid ' + C.border,
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
      {error && <div style={{ fontSize: 12, color: '#e74c3c' }}>{error}</div>}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg,' + C.green + ',' + C.greenMid + ')',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '12px 20px',
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {loading ? 'Wird verarbeitet...' : 'Weiter →'}
      </button>
    </form>
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
            ? 'Kostenlos & unverbindlich'
            : 'Alina berät dich zur optimalen Lösung'
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
            {loading ? 'Wird verarbeitet...' : 'Weiter zum Ergebnis →'}
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
              fontFamily: 'inherit',
              textDecoration: 'underline'
            }}
          >
            ← Zurück
          </button>
        </form>
      )}

      {/* Trust Badges */}
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid ' + C.borderLight, fontSize: 12, color: C.textLight, textAlign: 'center', lineHeight: 1.6 }}>
        <div>
          ✅ <strong>Zertifiziert</strong> — Wirtschaftswissenschaftlerin<br/>
          🔒 <strong>DSGVO-konform</strong> — Deine Daten sind sicher
        </div>
      </div>
    </div>
  );
}

function Result({ result, arbeitsmodell, geschwister }) {
  const price = arbeitsmodell === 'angestellt' ? 297 : 397;
  const yearWithoutAlina = result.eg * 12;
  const yearWithAlina = result.opt * 12;
  const savings = yearWithAlina - yearWithoutAlina;

  return (
    <div style={{ background: C.cream, borderRadius: 14, border: '1px solid ' + C.border, padding: 20, margin: '8px 0' }}>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.forest, margin: '0 0 18px', textAlign: 'center' }}>Dein persönliches Ergebnis</h3>

      {/* Ohne Alina */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textLight, marginBottom: 8, textTransform: 'uppercase' }}>Ohne Alina (Standard):</div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid ' + C.border, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{result.eg}€</div>
              <div style={{ fontSize: 12, color: C.textLight }}>pro Monat</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{yearWithoutAlina.toLocaleString('de-DE')}€</div>
              <div style={{ fontSize: 12, color: C.textLight }}>pro Jahr</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mit Alina */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8, textTransform: 'uppercase' }}>Mit Alina (Optimiert):</div>
        <div style={{ background: C.greenFaint, borderRadius: 12, border: '1.5px solid ' + C.green, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.green }}>{result.opt}€</div>
              <div style={{ fontSize: 12, color: C.green }}>pro Monat</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>{yearWithAlina.toLocaleString('de-DE')}€</div>
              <div style={{ fontSize: 12, color: C.green }}>pro Jahr</div>
            </div>
          </div>
        </div>
      </div>

      {/* Die Ersparis */}
      {savings > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fff3e0, ' + C.greenFaint + ')', borderRadius: 12, border: '1.5px solid #ff9800', padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ff6b35', marginBottom: 8, textTransform: 'uppercase' }}>💰 Deine Ersparis:</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ff6b35', marginBottom: 8 }}>+{savings.toLocaleString('de-DE')}€</div>
          <div style={{ fontSize: 13, color: '#cc5500', lineHeight: 1.5 }}>
            <strong>pro Jahr</strong><br/>
            Das ist echtes Geld, das dir sonst entgeht!
          </div>
        </div>
      )}

      {geschwister === 'ja' && (
        <div style={{ background: '#e8f5e9', borderLeft: '3px solid #4caf50', padding: 12, fontSize: 13, borderRadius: 8 }}>
          <strong>👶 Geschwisterbonus:</strong> Nächstes Jahr gibt es zusätzlich einen Zuschlag – Alina rechnet das mit rein.
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [msgs, setMsgs] = useState([]);
  const [showOpts, setShowOpts] = useState(false);
  const [started, setStarted] = useState(false);
  const [gated, setGated] = useState(false);
  const [showCallTime, setShowCallTime] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uName, setUName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [showRes, setShowRes] = useState(false);
  const [completed, setCompleted] = useState(false);
  const chatRef = useRef(null);

  const cur = FLOW[step];
  const result = gated ? calcEG(answers) : null;

  useEffect(() => {
    if (!cur) return;
    const nm = [];
    const botText = Array.isArray(cur.bot) ? cur.bot : [cur.bot];
    for (let i = 0; i < botText.length; i++) {
      nm.push({ from: 'bot', text: botText[i], delay: i * 600 + 200, id: step + '-b-' + i });
    }
    setMsgs((p) => p.concat(nm));
    setTimeout(() => setShowOpts(true), botText.length * 600 + 400);
  }, [step]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, showOpts, showRes, gated, showCallTime]);

  const answer = (display, value) => {
    setShowOpts(false);
    setMsgs((p) => p.concat([{ from: 'user', text: display, id: step + '-u' }]));

    let nextStep = step + 1;

    if (cur.id === 'arbeitsmodell') {
      setAnswers({ ...answers, [cur.id]: value });
      nextStep = FLOW.findIndex((f) => f.id === (value === 'angestellt' ? 'einkommen_angestellt' : 'einkommen_selbstaendig'));
    } else if (cur.id === 'einkommen_angestellt' || cur.id === 'einkommen_selbstaendig') {
      setAnswers({ ...answers, [cur.id]: value });
      nextStep = FLOW.findIndex((f) => f.id === 'geschwister');
    } else {
      setAnswers({ ...answers, [cur.id]: value });
    }

    setTimeout(() => setStep(nextStep), 300);
  };

  const onDate = (date) => {
    const displayDate = new Date(date).toLocaleDateString('de-DE');
    setAnswers({ ...answers, et: date });
    setMsgs((p) => p.concat([{ from: 'user', text: displayDate, id: 'date-u' }]));
    setTimeout(() => setStep(2), 300);
  };

  const onPhone = (firstName, email, phone) => {
    setUName(firstName);
    setUserEmail(email);
    setUserPhone(phone);

    setMsgs((p) => p.concat([{ from: 'user', text: firstName + ' — ' + email, id: 'phone-u' }]));

    setTimeout(() => {
      setGated(true);
      setShowOpts(false);
      setMsgs((p) => p.concat([{ from: 'bot', text: firstName + ', hier ist dein persönliches Ergebnis:', delay: 300, id: 'res-b' }]));
      setTimeout(() => setShowRes(true), 800);
    }, 600);
  };

  const onComplete = () => {
    setSubmitting(true);
    const r = calcEG(answers);

    fetch('/api/submit-to-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: uName,
        email: userEmail,
        phone: userPhone,
        et: answers.et,
        arbeitsmodell: answers.arbeitsmodell,
        einkommen: answers.einkommen_angestellt || answers.einkommen_selbstaendig || '',
        geschwister: answers.geschwister || '',
        steuerklasse: answers.steuerklasse || '',
        antrag_status: answers.antrag_status || '',
        partnerschaftsbonus: answers.partnerschaftsbonus || '',
        elterngeld_ohne: r.eg,
        elterngeld_mit: r.opt,
        elterngeld_diff: r.diff,
      }),
    }).catch(console.log);

    setTimeout(() => {
      setSubmitting(false);
      setCompleted(true);
      setMsgs((p) => p.concat([{ from: 'bot', text: 'Perfekt! 🎉 Alina schaut sich deine Unterlagen an und ruft dich in den nächsten 2 Werktagen an. Alle Details gehen dir per E-Mail zu. Bis dann!', delay: 300, id: 'complete-b' }]));
    }, 1000);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, background: C.cream, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{color:${C.green}}`}</style>

      <nav style={{ background: '#fff', borderBottom: '1px solid ' + C.border, padding: '8px 16px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={LOGO} alt="Zwergengruppe" style={{ height: 28 }} />
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '20px 20px 12px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,5vw,36px)', fontWeight: 700, color: C.forest }}>
          Verschenkst du <span style={{ color: C.accent }}>tausende Euro</span> Elterngeld?
        </h1>
        <p style={{ fontSize: 14, color: C.textMed, marginTop: 8 }}>7 Fragen in 60 Sekunden – dann weißt du, wie viel dir zusteht.</p>
      </section>

      {!started ? (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid ' + C.border, padding: '20px 24px', textAlign: 'center' }}>
            <img src={ALINA_FOTO} alt="Alina" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 30%', marginBottom: 8 }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.forest }}>Elterngeld-Schnellcheck</h2>
            <p style={{ fontSize: 13, color: C.textMed, margin: '8px 0 16px' }}>7 Fragen · 60 Sekunden · Sofort dein Ergebnis</p>
            <button
              onClick={() => setStarted(true)}
              style={{ background: 'linear-gradient(135deg,' + C.green + ',' + C.greenMid + ')', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Schnellcheck starten →
            </button>
          </div>
        </section>
      ) : (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 24px' }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid ' + C.border, overflow: 'hidden' }}>
            <div ref={chatRef} style={{ padding: '20px 18px', overflowY: 'auto', maxHeight: '58vh', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {msgs.map((m) => (m.from === 'bot' ? <Bot key={m.id} delay={m.delay}>{m.text}</Bot> : <User key={m.id} text={m.text} />))}
              {showOpts && cur?.id === 'et' && <DateInput onSubmit={onDate} loading={submitting} />}
              {showOpts && cur?.type === 'phonegate' && !gated && <PhoneGate onSubmit={onPhone} loading={submitting} />}
              {showRes && result && <Result result={result} answers={answers} arbeitsmodell={answers.arbeitsmodell} geschwister={answers.geschwister} />}
              {gated && !completed && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button
                    onClick={onComplete}
                    disabled={submitting}
                    style={{
                      background: C.green,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '12px 24px',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    {submitting ? 'Wird gesendet...' : 'Beratungstermin buchen'}
                  </button>
                </div>
              )}
            </div>
            {showOpts && cur && cur.id !== 'et' && cur.type !== 'phonegate' && !gated && (
              <div style={{ borderTop: '1px solid ' + C.border, padding: '14px 18px', background: C.greenFaint }}>
                {cur.type === 'start' && <Btn label="Los geht's! 🚀" onClick={() => answer('Los geht\'s!', true)} />}
                {cur.type === 'select' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{cur.options.map((o) => <Btn key={o.value} label={o.label} onClick={() => answer(o.label, o.value)} />)}</div>}
              </div>
            )}
          </div>
        </section>
      )}

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.forest, textAlign: 'center', marginBottom: 24 }}>Das haben andere Familien erreicht</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
          {[
            { name: 'Melanie & Tom', sit: 'Steuerklasse V → III', v: '640€', n: '1.180€', d: '+6.480€', q: 'Ohne Alina hätten wir über 6.000€ verschenkt!' },
            { name: 'Sarah', sit: 'Selbstständig', v: '890€', n: '1.420€', d: '+9.460€', q: 'Die Beratung hat sich 30x bezahlt gemacht.' },
            { name: 'Lisa & Jan', sit: 'Partnerschaftsbonus', v: '1.100€', n: '1.100€+4M', d: '+4.400€', q: 'Alina hat alles durchgerechnet.' },
            { name: 'Julia & Marco', sit: 'Selbstständig nebenberuflich', v: '720€', n: '1.240€', d: '+7.840€', q: 'Alina hat alles so erklärt, dass wir keine Sorgen mehr hatten.' },
          ].map((c, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid ' + C.border, padding: 20 }}>
              <div>
                <strong>{c.name}</strong>
                <div style={{ fontSize: 12, color: C.textLight }}>{c.sit}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
                <div style={{ flex: 1, background: C.borderLight, borderRadius: 8, padding: '8px', textAlign: 'center', fontSize: 13 }}>
                  <div style={{ fontSize: 10, color: C.textLight }}>VORHER</div>
                  {c.v}
                </div>
                <div style={{ flex: 1, background: C.greenFaint, borderRadius: 8, padding: '8px', textAlign: 'center', fontSize: 13, color: C.green }}>
                  <div style={{ fontSize: 10 }}>NACHHER</div>
                  {c.n}
                </div>
              </div>
              <div style={{ background: C.greenFaint, borderRadius: 8, padding: '6px', textAlign: 'center', fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 8 }}>{c.d}</div>
              <p style={{ fontSize: 13, color: C.textMed, fontStyle: 'italic' }}>"{c.q}"</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '20px 20px 36px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid ' + C.border, padding: 28 }}>
          <img src={ALINA_FOTO} alt="Alina" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 30%', marginBottom: 12 }} />
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.forest }}>Alina Nußbaum</h3>
          <p style={{ fontSize: 13, color: C.green, fontWeight: 600, marginBottom: 10 }}>Elterngeld-Expertin · Wirtschaftswissenschaftlerin</p>
          <p style={{ fontSize: 13.5, color: C.textMed, lineHeight: 1.6 }}>Ich bringe tiefes Steuer- und Finanzwissen mit. Ich optimiere nicht nur euren Antrag, sondern verstehe, wie Steuerklasse und eure gesamte Situation zusammenspielen.</p>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid ' + C.border, background: '#fff', padding: 20, textAlign: 'center', fontSize: 12.5, color: C.textLight }}>
        <p>© 2026 Zwergengruppe · Elterngeld-Beratung mit Alina Nußbaum</p>
      </footer>
    </div>
  );
}
