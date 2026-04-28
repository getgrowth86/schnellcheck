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
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = true;
    if (!email.trim() || !email.includes('@')) newErrors.email = true;
    if (!phone.trim() || phone.length < 8) newErrors.phone = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(name.trim(), email.trim(), phone.trim());
    }
  };

  const InputField = ({ icon, label, type, value, onChange, onFocus, onBlur, error }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.forest, display: 'block', marginBottom: 6 }}>
        {icon} {label}
      </label>
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: '100%',
          border: '1.5px solid ' + (error ? '#e74c3c' : focusedField === label ? C.green : C.border),
          borderRadius: 10,
          padding: '14px 16px',
          fontSize: 15,
          fontFamily: 'inherit',
          outline: 'none',
          background: focusedField === label ? C.greenFaint : '#fff',
          transition: 'all 0.2s',
          boxShadow: focusedField === label ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
        }}
      />
      {error && <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4 }}>Bitte gültig ausfüllen</div>}
    </div>
  );

  return (
    <div
      style={{
        background: 'linear-gradient(135deg,' + C.greenFaint + ',' + '#fff' + ')',
        borderRadius: 16,
        border: '1.5px solid ' + C.green,
        padding: '32px 28px',
        margin: '8px 0',
        boxShadow: '0 8px 24px rgba(45,106,79,0.12)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 60, height: 60, background: C.greenFaint, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
          📞
        </div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.forest, margin: '0 0 8px' }}>
          Dein Ergebnis wartet auf dich
        </h3>
        <p style={{ fontSize: 15, color: C.textMed, margin: 0, lineHeight: 1.5 }}>
          Alina braucht nur deine Kontaktdaten, um dein personalisiertes Ergebnis zu zeigen.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={submit}>
        <InputField
          icon="👤"
          label="Vorname"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocusedField('Vorname')}
          onBlur={() => setFocusedField(null)}
          error={errors.name}
        />
        <InputField
          icon="✉️"
          label="E-Mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocusedField('E-Mail')}
          onBlur={() => setFocusedField(null)}
          error={errors.email}
        />
        <InputField
          icon="☎️"
          label="Telefon"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onFocus={() => setFocusedField('Telefon')}
          onBlur={() => setFocusedField(null)}
          error={errors.phone}
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#ccc' : 'linear-gradient(135deg,' + C.green + ',' + C.greenMid + ')',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 24px',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(45,106,79,0.25)',
            marginTop: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ⏳ Wird verarbeitet...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ✨ Weiter zu meinen Zeiten
            </span>
          )}
        </button>
      </form>

      {/* Trust Badge */}
      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: C.textLight, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        🔒 Deine Daten sind sicher verschlüsselt
      </div>
    </div>
  );
}

function CallTimeGate({ onSubmit, loading }) {
  const [time, setTime] = useState('');
  const [focused, setFocused] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (time) {
      onSubmit(time);
    }
  };

  const timeSlots = [
    { value: '09-12', label: '09:00 - 12:00', emoji: '🌅' },
    { value: '12-15', label: '12:00 - 15:00', emoji: '☀️' },
    { value: '15-18', label: '15:00 - 18:00', emoji: '🌤️' },
    { value: '18-20', label: '18:00 - 20:00', emoji: '🌙' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg,' + C.greenFaint + ',' + '#fff' + ')',
        borderRadius: 16,
        border: '1.5px solid ' + C.green,
        padding: '32px 28px',
        margin: '8px 0',
        boxShadow: '0 8px 24px rgba(45,106,79,0.12)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 60, height: 60, background: C.greenFaint, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
          ⏰
        </div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.forest, margin: '0 0 8px' }}>
          Wann passt es dir?
        </h3>
        <p style={{ fontSize: 15, color: C.textMed, margin: 0, lineHeight: 1.5 }}>
          Alina ruft dich in diesem Zeitfenster an.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {timeSlots.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => setTime(slot.value)}
              style={{
                padding: '16px 14px',
                borderRadius: 12,
                border: '2px solid ' + (time === slot.value ? C.green : C.border),
                background: time === slot.value ? C.greenFaint : '#fff',
                color: time === slot.value ? C.forest : C.textMed,
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: time === slot.value ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: time === slot.value ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{slot.emoji}</div>
              <div>{slot.label}</div>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !time}
          style={{
            width: '100%',
            background: loading || !time ? '#ccc' : 'linear-gradient(135deg,' + C.green + ',' + C.greenMid + ')',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 24px',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: loading || !time ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(45,106,79,0.25)',
            opacity: loading || !time ? 0.7 : 1,
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ⏳ Wird verarbeitet...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              ✨ Zeit bestätigen & fertig
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

function Result({ result, arbeitsmodell, geschwister }) {
  const price = arbeitsmodell === 'angestellt' ? 297 : 397;
  const yearTotal = result.opt * 12;
  const savings = (result.opt - result.eg) * 12;

  return (
    <div style={{ background: C.cream, borderRadius: 14, border: '1px solid ' + C.border, padding: 20, margin: '8px 0' }}>
      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.forest, margin: '0 0 16px' }}>📊 Dein Ergebnis</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ border: '1px solid ' + C.border, borderRadius: 10, padding: 14, background: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight }}>STANDARD</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{result.eg}€</div>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>pro Monat</div>
        </div>
        <div style={{ border: '1.5px solid ' + C.green, borderRadius: 10, padding: 14, background: C.greenFaint }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.green }}>MIT ALINA</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.green, marginTop: 4 }}>{result.opt}€</div>
          <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>pro Monat</div>
        </div>
      </div>

      {savings > 0 && (
        <div style={{ background: '#fff3cd', borderLeft: '4px solid #ff9800', padding: 14, marginBottom: 14, fontSize: 14, borderRadius: 8 }}>
          <div style={{ fontWeight: 700, color: '#cc7700', marginBottom: 4 }}>💰 Das sind {savings}€ mehr pro Jahr!</div>
        </div>
      )}

      {geschwister === 'ja' && (
        <div style={{ background: '#e8f5e9', borderLeft: '3px solid #4caf50', padding: 12, marginBottom: 12, fontSize: 13 }}>
          <strong>👶 Geschwisterbonus:</strong> Nächstes Jahr gibt es einen zusätzlichen Zuschlag — Alina rechnet das mit rein.
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
    for (let i = 0; i < cur.bot.length; i++) {
      nm.push({ from: 'bot', text: cur.bot[i], delay: i * 600 + 200, id: step + '-b-' + i });
    }
    setMsgs((p) => p.concat(nm));
    setTimeout(() => setShowOpts(true), cur.bot.length * 600 + 400);
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
      if (value === 'angestellt') {
        nextStep = FLOW.findIndex((f) => f.id === 'einkommen_angestellt');
      } else {
        nextStep = FLOW.findIndex((f) => f.id === 'einkommen_selbstaendig');
      }
    } else if (cur.id === 'einkommen_angestellt' || cur.id === 'einkommen_selbstaendig') {
      setAnswers({ ...answers, [cur.id]: value });
      nextStep = FLOW.findIndex((f) => f.id === 'geschwister');
    } else {
      setAnswers({ ...answers, [cur.id]: value });
    }

    setTimeout(() => setStep(nextStep), 300);
  };

  const onPhone = (firstName, email, phone) => {
    setUName(firstName);
    setUserEmail(email);
    setUserPhone(phone);

    setMsgs((p) => p.concat([{ from: 'user', text: firstName + ' — ' + email, id: 'phone-u' }]));

    setTimeout(() => {
      setGated(true);
      setShowOpts(false);
      setMsgs((p) => p.concat([{ from: 'bot', text: firstName + ', hier ist dein personalisiertes Ergebnis:', delay: 300, id: 'res-b' }]));
      setTimeout(() => setShowRes(true), 800);
      setTimeout(() => setShowCallTime(true), 1500);
    }, 600);
  };

  const onCallTime = (time) => {
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
        callTime: time,
        arbeitsmodell: answers.arbeitsmodell,
        einkommen: answers.einkommen_angestellt || answers.einkommen_selbstaendig || '',
        geschwister: answers.geschwister || '',
        elterngeld_ohne: r.eg,
        elterngeld_mit: r.opt,
        elterngeld_diff: r.diff,
        price: answers.arbeitsmodell === 'angestellt' ? 297 : 397,
      }),
    }).catch(console.log);

    setMsgs((p) => p.concat([{ from: 'user', text: 'Zeitfenster: ' + time, id: 'time-u' }]));

    setTimeout(() => {
      setSubmitting(false);
      setShowCallTime(false);
      setCompleted(true);
      setMsgs((p) => p.concat([{ from: 'bot', text: 'Perfekt! 🎉 Alina schaut sich deine Unterlagen an und ruft dich im Zeitfenster an. Wir haben deine E-Mail notiert — dort schicken wir dir auch noch alle Details. Bis dann!', delay: 300, id: 'complete-b' }]));
    }, 600);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, background: C.cream, minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{color:${C.green}}`}</style>

      <nav style={{ background: '#fff', borderBottom: '1px solid ' + C.border, padding: '8px 16px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={LOGO} alt="Zwergengruppe" style={{ height: 28 }} />
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: C.forest }}>Zwergengruppe</div>
            </div>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '20px 20px 12px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,5vw,36px)', fontWeight: 700, color: C.forest }}>
          Verschenkst du <span style={{ color: C.accent }}>tausende Euro</span> Elterngeld?
        </h1>
        <p style={{ fontSize: 14, color: C.textMed, marginTop: 8 }}>Beantworte 3 kurze Fragen und erfahre sofort, wie viel dir zusteht.</p>
      </section>

      {!started ? (
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid ' + C.border, padding: '20px 24px', textAlign: 'center' }}>
            <img src={ALINA_FOTO} alt="Alina" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center 30%', marginBottom: 8 }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: C.forest }}>Elterngeld-Schnellcheck</h2>
            <p style={{ fontSize: 13, color: C.textMed, margin: '8px 0 16px' }}>3 Fragen · 60 Sekunden · Sofort dein Ergebnis</p>
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
              {showOpts && cur?.type === 'phonegate' && !gated && <PhoneGate onSubmit={onPhone} loading={submitting} />}
              {showRes && result && <Result result={result} answers={answers} arbeitsmodell={answers.arbeitsmodell} geschwister={answers.geschwister} />}
              {showCallTime && !completed && <CallTimeGate onSubmit={onCallTime} loading={submitting} />}
            </div>
            {showOpts && cur && cur.type !== 'phonegate' && !gated && (
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
