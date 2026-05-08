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
];

const AFTER_FLOW = [
  {
    id: 'problem_question',
    bot: ['Was ist für dich das größte Problem beim Elterngeld?'],
    type: 'select',
    options: [
      { label: 'Nicht wissen, wie viel mir zusteht', value: 'wieviel' },
      { label: 'Angst vor Fehler im Antrag', value: 'fehler' },
      { label: 'Komplexe Situation (SK, Bonus, etc.)', value: 'komplex' },
    ],
  },
  {
    id: 'help_preference',
    bot: ['Wie können wir dir am besten helfen?'],
    type: 'select',
    options: [
      { label: 'Schritt-für-Schritt erklären', value: 'erklaeren' },
      { label: 'Alles für mich durchrechnen', value: 'durchrechnen' },
      { label: 'Den Antrag komplett ausfüllen', value: 'ausfuellen' },
      { label: 'Alles selbst machen, ich vertraue euch', value: 'vertrauen' },
    ],
  },
  {
    id: 'phone',
    bot: ['Wo erreichen wir dich am besten?'],
    type: 'phone',
  },
  {
    id: 'time',
    bot: ['Wann erreichen wir dich am besten?'],
    type: 'select',
    options: [
      { label: '09:00 - 12:00 Uhr', value: '09-12' },
      { label: '12:00 - 15:00 Uhr', value: '12-15' },
      { label: '15:00 - 18:00 Uhr', value: '15-18' },
      { label: '18:00 - 20:00 Uhr', value: '18-20' },
    ],
  },
];

function calcEG(a) {
  const isFreelancer = a.arbeitsmodell === 'selbstaendig';
  const income = a.einkommen_angestellt || a.einkommen_selbstaendig || 2000;
  
  // OHNE Beratung: conservative estimate
  let egBase = Math.max(300, Math.min(Math.round(income * 0.6 * 0.67), 1800));
  
  // MIT Beratung: optimiert
  let opt = egBase;
  
  // Steuerklasse-Optimierung
  if (a.steuerklasse === 'sk5') opt += 150;
  if (a.steuerklasse === 'sk3') opt += 100;
  
  // Partnerschaftsbonus
  if (a.partnerschaftsbonus === 'ja') opt += 200;
  
  // SELBSTSTÄNDIGE: großes Potenzial
  if (isFreelancer) {
    opt += 400; // Gewinnabgrenzung, Betriebsausgaben, Versicherungen, optimale Dokumentation
  }
  
  // Geschwisterbonus
  if (a.geschwister === 'ja') opt += 50;
  
  opt = Math.min(opt, 1800);
  
  return { eg: egBase, opt: opt, diff: (opt - egBase) * 14 };
}

function Bot({ children, delay }) {
  const [show, setShow] = useState(!delay);
  useEffect(() => {
    if (delay) setTimeout(() => setShow(true), delay);
  }, [delay]);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', opacity: show ? 1 : 0, transition: 'opacity 0.3s', marginBottom: 6 }}>
      <img src={ALINA_FOTO} alt="Alina" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 30%', flexShrink: 0 }} />
      <div style={{ background: C.borderLight, borderRadius: '4px 12px 12px 12px', padding: '9px 12px', fontSize: 13.5, lineHeight: 1.5, maxWidth: '84%', color: C.text }}>
        {show ? children : '...'}
      </div>
    </div>
  );
}

function User({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
      <div style={{ background: C.green, color: '#fff', borderRadius: '12px 4px 12px 12px', padding: '8px 12px', fontSize: 13.5 }}>{text}</div>
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

function PhoneInput({ onSubmit, loading }) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.trim()) {
      onSubmit(phone.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="tel"
        placeholder="+49 123 456789"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{
          border: '1.5px solid ' + C.border,
          borderRadius: 10,
          padding: '12px 14px',
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
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

function EmailGate({ onSubmit, loading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && email.trim() && email.includes('@')) {
      onSubmit(name.trim(), email.trim());
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: '1.5px solid ' + C.green,
      padding: 20,
      margin: '8px 0',
      boxShadow: '0 4px 12px rgba(45,106,79,0.15)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h3 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 16,
          fontWeight: 700,
          color: C.forest,
          margin: '0 0 4px'
        }}>
          Dein Ergebnis wartet
        </h3>
        <p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>
          Gib deine Daten ein
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="text"
          placeholder="Dein Vorname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            border: '1.5px solid ' + C.border,
            borderRadius: 10,
            padding: '11px 12px',
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
            padding: '11px 12px',
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
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit'
          }}
        >
          {loading ? 'Wird verarbeitet...' : 'Ergebnis anzeigen'}
        </button>
      </form>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid ' + C.borderLight, fontSize: 11, color: C.textLight, textAlign: 'center' }}>
        🔒 Deine Daten sind DSGVO-konform geschützt
      </div>
    </div>
  );
}

function CountUp({ target, duration = 900 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.round(current));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val.toLocaleString('de-DE');
}

function Result({ result, name }) {
  const hasDiff = result.opt > result.eg;
  const lossPerMonth = result.opt - result.eg;
  const lossTotal = lossPerMonth * 14;

  return (
    <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(145deg,' + C.forest + ',' + C.green + ')', borderRadius: 16, padding: '28px 20px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 100, opacity: 0.06, lineHeight: 1 }}>💶</div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7, marginBottom: 8 }}>
          {name ? name + ' — dein Ergebnis' : 'Dein Ergebnis'}
        </div>
        <div style={{ fontSize: 'clamp(52px,14vw,76px)', fontWeight: 800, fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: 4 }}>
          <CountUp target={result.opt} /> €
        </div>
        <div style={{ fontSize: 14, opacity: 0.8, marginBottom: hasDiff ? 16 : 0 }}>
          pro Monat — optimiert
        </div>
        {hasDiff && (
          <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 10, padding: '9px 14px', display: 'inline-block', fontSize: 13 }}>
            Ohne Optimierung nur <strong>{result.eg.toLocaleString('de-DE')} €</strong> — du verlierst{' '}
            <strong style={{ color: '#fcd34d' }}>{lossPerMonth} € pro Monat</strong>
          </div>
        )}
      </div>

      {/* Verlust-Banner */}
      {hasDiff && (
        <div style={{ background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>⚠️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#b91c1c', marginBottom: 4 }}>
              Du lässt gerade <CountUp target={lossTotal} /> € liegen
            </div>
            <div style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.5 }}>
              Das Geld steht dir zu — aber nur wenn du es richtig beantragst. Die Elterngeldstelle sagt dir das nicht.
            </div>
          </div>
        </div>
      )}

      {/* Vorher / Nachher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ border: '1.5px solid ' + C.border, borderRadius: 12, padding: '14px 12px', background: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: C.textLight, letterSpacing: 1, marginBottom: 6 }}>Ohne Optimierung</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.textMed }}>{result.eg.toLocaleString('de-DE')} €</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>/Monat</div>
        </div>
        <div style={{ border: '2px solid ' + C.green, borderRadius: 12, padding: '14px 12px', background: C.greenFaint, textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: C.green, letterSpacing: 1, marginBottom: 6 }}>Mit Beratung ✓</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.forest }}>{result.opt.toLocaleString('de-DE')} €</div>
          <div style={{ fontSize: 11, color: C.greenMid, marginTop: 2 }}>/Monat</div>
        </div>
      </div>

    </div>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid ' + C.borderLight }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          fontSize: 14,
          fontWeight: 600,
          color: C.text,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{q}</span>
        <span style={{ fontSize: 18, color: C.green, marginLeft: 12 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', fontSize: 13.5, color: C.textMed, lineHeight: 1.6 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [afterStep, setAfterStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [msgs, setMsgs] = useState([]);
  const [showOpts, setShowOpts] = useState(false);
  const [started, setStarted] = useState(true);
  const [emailGated, setEmailGated] = useState(false);
  const [resultShown, setResultShown] = useState(false);
  const [wantHelp, setWantHelp] = useState(null);
  const [afterStarted, setAfterStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [uName, setUName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userTime, setUserTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  const cur = FLOW[step];
  const afterCur = AFTER_FLOW[afterStep];
  const result = emailGated ? calcEG(answers) : null;

  useEffect(() => {
    if (!started) return;
    if (!cur) return;
    const nm = [];
    const botText = Array.isArray(cur.bot) ? cur.bot : [cur.bot];
    for (let i = 0; i < botText.length; i++) {
      nm.push({ from: 'bot', text: botText[i], delay: i * 600 + 200, id: step + '-b-' + i });
    }
    setMsgs((p) => p.concat(nm));
    setTimeout(() => setShowOpts(true), botText.length * 600 + 400);
  }, [step, started]);

  useEffect(() => {
    if (!afterStarted) return;
    if (!afterCur) return;
    const nm = [];
    const botText = Array.isArray(afterCur.bot) ? afterCur.bot : [afterCur.bot];
    for (let i = 0; i < botText.length; i++) {
      nm.push({ from: 'bot', text: botText[i], delay: i * 600 + 200, id: 'after-' + afterStep + '-b-' + i });
    }
    setMsgs((p) => p.concat(nm));
    setTimeout(() => setShowOpts(true), botText.length * 600 + 400);
  }, [afterStep, afterStarted]);

  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }, [msgs, showOpts, resultShown, wantHelp, emailGated]);

  const onDateSubmit = (date) => {
    const displayDate = new Date(date).toLocaleDateString('de-DE');
    answer(displayDate, date);
  };

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

  const afterAnswer = (display, value) => {
    setShowOpts(false);
    setMsgs((p) => p.concat([{ from: 'user', text: display, id: 'after-' + afterStep + '-u' }]));
    
    const updatedAnswers = { ...answers, [afterCur.id]: value };
    setAnswers(updatedAnswers);

    if (afterCur.id === 'time') {
      setUserTime(value);
    }

    if (afterStep === AFTER_FLOW.length - 1) {
      setTimeout(() => onFinalSubmit(value, updatedAnswers), 300);
    } else {
      setTimeout(() => setAfterStep(afterStep + 1), 300);
    }
  };

  const onEmail = (firstName, email) => {
    setUName(firstName);
    setUserEmail(email);
    setMsgs((p) => p.concat([{ from: 'user', text: firstName, id: 'email-u' }]));
    setTimeout(() => {
      setEmailGated(true);
      setShowOpts(false);
      setMsgs((p) => p.concat([{ from: 'bot', text: firstName + ', dein Ergebnis ist fertig:', delay: 300, id: 'res-b' }]));
      setTimeout(() => setResultShown(true), 800);
    }, 600);
  };

  const handleHelpDecision = (want) => {
    setShowOpts(false);
    setWantHelp(want);
    if (want === 'yes') {
      setMsgs((p) => p.concat([{ from: 'user', text: 'Ja', id: 'help-yes' }]));
      setTimeout(() => {
        setAfterStarted(true);
      }, 600);
    } else {
      setMsgs((p) => p.concat([{ from: 'user', text: 'Nein', id: 'help-no' }]));
      setTimeout(() => {
        setMsgs((p) => p.concat([{ from: 'bot', text: 'Danke! Alles Gute für dich und deine Familie! 💚', delay: 300, id: 'exit-b' }]));
      }, 600);
    }
  };

  const onFinalSubmit = (timeValue, finalAnswers) => {
    setSubmitting(true);
    const a = finalAnswers || answers;
    const r = calcEG(a);
    const finalCallTime = timeValue || userTime || '';

    fetch('https://hooks.zapier.com/hooks/catch/26304169/uvmn326/', {
      method: 'POST',
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: uName,
        email: userEmail,
        phone: userPhone,
        callTime: finalCallTime,
        et: a.et,
        arbeitsmodell: a.arbeitsmodell,
        einkommen: a.einkommen_angestellt || a.einkommen_selbstaendig || '',
        geschwister: a.geschwister || '',
        steuerklasse: a.steuerklasse || '',
        antrag_status: a.antrag_status || '',
        partnerschaftsbonus: a.partnerschaftsbonus || '',
        problem: a.problem_question || '',
        helpPreference: a.help_preference || '',
        elterngeld_ohne: r.eg,
        elterngeld_mit: r.opt,
        elterngeld_diff: r.diff,
      }),
    }).catch(console.log);

    setTimeout(() => {
      setSubmitting(false);
      setCompleted(true);
      const monthlyDiff = r.opt - r.eg;
      const yearlyDiff = monthlyDiff * 12;
      setMsgs((p) => p.concat([{ from: 'bot', text: `Vielen Dank! Jemand aus dem Team wird sich telefonisch bei dir melden und dir zeigen, wie du die +${monthlyDiff}€/Monat (+${yearlyDiff.toLocaleString('de-DE')}€/Jahr) rausholst. 💚`, delay: 300, id: 'complete-b' }]));
    }, 600);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, background: C.cream, minHeight: '100dvh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{color:${C.green}}`}</style>

      {/* ── Nav ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid ' + C.border, padding: '8px 16px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={LOGO} alt="Zwergengruppe" style={{ height: 26 }} />
          <div style={{ fontSize: 11, color: C.textLight }}>100+ Familien · kostenlos · 2 Min</div>
        </div>
      </nav>

      {/* ── Compact Header ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '10px 16px 8px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(18px,4.5vw,28px)', fontWeight: 700, color: C.forest, lineHeight: 1.2 }}>
          Wie viel Elterngeld steht dir wirklich zu?
        </h1>
        <p style={{ fontSize: 12.5, color: C.textMed, marginTop: 4 }}>
          Beantworte 5 kurze Fragen — Alina zeigt dir dein Ergebnis sofort.
        </p>
      </div>

      {/* ── Chat ── */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 12px 24px' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid ' + C.border, overflow: 'hidden' }}>

            {/* Messages */}
            <div ref={chatRef} style={{ padding: '16px 14px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {msgs.map((m) => (m.from === 'bot' ? <Bot key={m.id} delay={m.delay}>{m.text}</Bot> : <User key={m.id} text={m.text} />))}

              {showOpts && cur?.id === 'et' && <DateInput onSubmit={onDateSubmit} loading={submitting} />}

              {step > FLOW.length - 1 && !emailGated && <EmailGate onSubmit={onEmail} loading={submitting} />}

              {resultShown && result && !wantHelp && (
                <>
                  <Result result={result} name={uName} />
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>
                    Sollen wir gemeinsam schauen, wie du die +{result.opt - result.eg} € holst?
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => handleHelpDecision('yes')} style={{ flex: 1, background: C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Ja</button>
                    <button onClick={() => handleHelpDecision('no')} style={{ flex: 1, background: C.borderLight, color: C.text, border: 'none', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Nein</button>
                  </div>
                </>
              )}

              {afterStarted && !completed && afterCur?.id === 'phone' && <PhoneInput onSubmit={(phone) => { setUserPhone(phone); afterAnswer(phone, phone); }} loading={submitting} />}
              
              {afterStarted && !completed && showOpts && afterCur && afterCur.id !== 'phone' && (
                <div style={{ borderTop: '1px solid ' + C.border, padding: '14px 18px', background: C.greenFaint }}>
                  {afterCur.type === 'select' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>{afterCur.options.map((o) => <Btn key={o.value} label={o.label} onClick={() => afterAnswer(o.label, o.value)} />)}</div>}
                </div>
              )}

              {afterStarted && !completed && afterCur?.id === 'phone' && <PhoneInput onSubmit={(phone) => { setUserPhone(phone); afterAnswer(phone, phone); }} loading={submitting} />}

              {afterStarted && !completed && showOpts && afterCur && afterCur.id !== 'phone' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}>
                  {afterCur.type === 'select' && afterCur.options.map((o) => <Btn key={o.value} label={o.label} onClick={() => afterAnswer(o.label, o.value)} />)}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Options inline */}
            {showOpts && cur && cur.id !== 'et' && step <= FLOW.length - 1 && !emailGated && !resultShown && (
              <div style={{ padding: '8px 14px 14px' }}>
                {cur.type === 'select' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{cur.options.map((o) => <Btn key={o.value} label={o.label} onClick={() => answer(o.label, o.value)} />)}</div>}
              </div>
            )}
          </div>
        </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px 12px' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.forest, textAlign: 'center', marginBottom: 6 }}>Das haben andere Familien erreicht</h2>
        <p style={{ fontSize: 13, color: C.textLight, textAlign: 'center', marginBottom: 24 }}>Echte Ergebnisse aus unseren Beratungen</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
          {[
            { name: 'Melanie & Tom', sit: 'Steuerklasse V → III', v: '640€/Mon.', n: '1.180€/Mon.', d: '+6.480€ über den Bezugszeitraum', q: 'Ohne Alina hätten wir über 6.000€ verschenkt!' },
            { name: 'Sarah', sit: 'Selbstständig, alleinerziehend', v: '890€/Mon.', n: '1.420€/Mon.', d: '+9.460€ über den Bezugszeitraum', q: 'Die Beratung hat sich 30-fach bezahlt gemacht.' },
            { name: 'Lisa & Jan', sit: 'Partnerschaftsbonus genutzt', v: '1.100€/Mon.', n: '1.100€ + 4 Bonusmonate', d: '+4.400€ über den Bezugszeitraum', q: 'Alina hat alles durchgerechnet und geplant.' },
            { name: 'Julia & Marco', sit: 'Nebenberuflich selbstständig', v: '720€/Mon.', n: '1.240€/Mon.', d: '+7.840€ über den Bezugszeitraum', q: 'Als nebenberuflich Selbstständige dachte ich, Elterngeld wird kompliziert. Alina hat alles so erklärt, dass wir keine Sorgen mehr machen mussten.' },
          ].map((c, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, border: '1px solid ' + C.border, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div>
                  <strong>{c.name}</strong>
                  <div style={{ fontSize: 12, color: C.textLight }}>{c.sit}</div>
                </div>
                <div style={{ color: '#fbbf24', fontSize: 14, letterSpacing: 1 }}>★★★★★</div>
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
              <div style={{ background: C.greenFaint, borderRadius: 8, padding: '8px', textAlign: 'center', fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 10 }}>{c.d}</div>
              <p style={{ fontSize: 13, color: C.textMed, fontStyle: 'italic' }}>"{c.q}"</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '20px 20px 12px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid ' + C.border, padding: 28 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' }}>
            <img src={ALINA_FOTO} alt="Alina" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 30%', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.forest }}>Alina Nußbaum</h3>
              <p style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Elterngeld-Expertin · Zertifizierte Wirtschaftswissenschaftlerin · Gründerin Zwergengruppe</p>
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: C.textMed, lineHeight: 1.6, marginBottom: 16 }}>Ich bringe tiefes Steuer- und Finanzwissen mit. Ich optimiere nicht nur euren Antrag, sondern verstehe, wie Steuerklasse, Progressionsvorbehalt und eure gesamte Situation zusammenspielen. Das kann den Unterschied von tausenden Euro machen.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: C.green, fontWeight: 600 }}>
            <div>✓ 100+ Familien</div>
            <div>✓ Steuer-Expertise</div>
            <div>✓ Geld-zurück-Garantie</div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '20px 20px 36px' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.forest, textAlign: 'center', marginBottom: 24 }}>Häufige Fragen</h2>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid ' + C.border, overflow: 'hidden' }}>
          {[
            { q: 'Ist der Schnellcheck wirklich kostenlos?', a: 'Ja, der Schnellcheck ist 100% kostenlos und unverbindlich. Du erhältst dein persönliches Ergebnis sofort.' },
            { q: 'Was passiert mit meiner E-Mail?', a: 'Deine Daten werden DSGVO-konform behandelt. Wir nutzen sie ausschließlich, um dir dein Ergebnis und ggf. weiterführende Infos zukommen zu lassen.' },
            { q: 'Wann sollte ich mich beraten lassen?', a: 'Am besten so früh wie möglich – idealerweise vor der Geburt. Manche Optimierungen (z.B. Steuerklassenwechsel) sind nur vor der Geburt möglich!' },
            { q: 'Was unterscheidet euch von anderen?', a: 'Alina kombiniert Steuer- und Finanzwissen mit Elterngeld-Expertise. Wir betrachten deine gesamte Situation – nicht nur den Antrag.' },
            { q: 'Was kostet die Beratung?', a: 'Das besprechen wir individuell im persönlichen Telefonat. In jedem Fall: Wir holen für dich mehr raus, als die Beratung kostet – sonst lohnt sie sich nicht.' },
          ].map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '20px 20px 36px' }}>
        <div style={{ background: 'linear-gradient(135deg,' + C.forest + ',' + C.green + ')', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Bereit, dein Elterngeld zu maximieren?</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', marginBottom: 20, lineHeight: 1.5 }}>Die wichtigsten Entscheidungen fallen vor der Geburt. Danach ist es oft zu spät. Sichere dir jetzt dein kostenloses Beratungsgespräch mit Alina.</p>
          <button
            onClick={() => { setStarted(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ background: '#fff', color: C.forest, border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Schnellcheck starten →
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.85)', flexWrap: 'wrap' }}>
            <div>✓ 5 Fragen in 60 Sekunden</div>
            <div>✓ 100% kostenlos</div>
            <div>✓ Sofort dein Ergebnis</div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid ' + C.border, background: '#fff', padding: 20, textAlign: 'center', fontSize: 12.5, color: C.textLight }}>
        <p>© 2026 Zwergengruppe · Elterngeld-Beratung mit Alina Nußbaum</p>
      </footer>
    </div>
  );
}
