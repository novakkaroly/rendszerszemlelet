/* ===== Theme Toggle ===== */
(function(){
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  r.setAttribute('data-theme', d);
  updateIcon();
  t && t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
    updateIcon();
  });
  function updateIcon() {
    if (!t) return;
    t.setAttribute('aria-label', 'Váltás ' + (d === 'dark' ? 'világos' : 'sötét') + ' módra');
    t.innerHTML = d === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

/* ===== Dimension Card Toggles ===== */
document.querySelectorAll('.dim-card-header').forEach(header => {
  header.addEventListener('click', () => {
    const card = header.closest('.dim-card');
    const toggle = header.querySelector('.dim-toggle');
    const detail = card.querySelector('.dim-card-detail');
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    toggle.setAttribute('aria-expanded', !isExpanded);
    if (isExpanded) {
      detail.hidden = true;
    } else {
      detail.hidden = false;
    }
  });
});

/* ===== Self-Assessment Sliders ===== */
const sliders = document.querySelectorAll('.assess-slider');
const dimLabels = [
  'Interdiszciplináris kapcsolatok',
  'Tanulási folyamat',
  'Pedagógus szerepe',
  'Diák szerepe',
  'Értékelés módja',
  'Oktatási környezet'
];

function getAssessmentValues() {
  return Array.from(sliders).map(s => parseInt(s.value));
}

sliders.forEach(slider => {
  slider.addEventListener('input', () => {
    const output = slider.closest('.assess-item').querySelector('.slider-value');
    output.textContent = slider.value;
    drawRadar();
    updateResultText();
  });
});

/* ===== Radar Chart ===== */
const canvas = document.getElementById('radar-chart');
const ctx = canvas ? canvas.getContext('2d') : null;

function drawRadar() {
  if (!ctx) return;
  const values = getAssessmentValues();
  const n = values.length;
  const cx = 180, cy = 180, r = 140;
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = 360 * dpr;
  canvas.height = 360 * dpr;
  canvas.style.width = '360px';
  canvas.style.height = '360px';
  ctx.scale(dpr, dpr);
  
  ctx.clearRect(0, 0, 360, 360);
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(200,200,200,0.12)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#a0a0a0' : '#6b6960';
  const fillColor = isDark ? 'rgba(96,192,176,0.2)' : 'rgba(58,122,108,0.15)';
  const strokeColor = isDark ? '#60c0b0' : '#3a7a6c';
  
  // Grid
  for (let level = 1; level <= 5; level++) {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      const x = cx + (r * level / 5) * Math.cos(angle);
      const y = cy + (r * level / 5) * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Axes
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Labels
  const shortLabels = ['Interdisc.', 'Folyamat', 'Pedagógus', 'Diák', 'Értékelés', 'Környezet'];
  ctx.font = '11px Nunito, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    const lx = cx + (r + 22) * Math.cos(angle);
    const ly = cy + (r + 22) * Math.sin(angle);
    ctx.fillText(shortLabels[i], lx, ly + 4);
  }
  
  // Data polygon
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const idx = i % n;
    const angle = (Math.PI * 2 / n) * idx - Math.PI / 2;
    const val = values[idx] / 5;
    const x = cx + r * val * Math.cos(angle);
    const y = cy + r * val * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Dots
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    const val = values[i] / 5;
    const x = cx + r * val * Math.cos(angle);
    const y = cy + r * val * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#222' : '#fff';
    ctx.fill();
  }
}

function updateResultText() {
  const values = getAssessmentValues();
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const minIdx = values.indexOf(min);
  const maxIdx = values.indexOf(max);
  
  let level;
  if (avg <= 2) level = 'Kezdő szint';
  else if (avg <= 3) level = 'Fejlődő szint';
  else if (avg <= 4) level = 'Haladó szint';
  else level = 'Mester szint';
  
  const summary = document.getElementById('result-summary');
  summary.innerHTML = `
    <strong>${level}</strong> (átlag: ${avg.toFixed(1)}/5)<br><br>
    Legerősebb dimenzió: <strong>${dimLabels[maxIdx]}</strong> (${max})<br>
    Fejlesztendő dimenzió: <strong>${dimLabels[minIdx]}</strong> (${min})<br><br>
    <em>Tipp: Kezdd a fejlesztést a leggyengébb dimenzióban, és figyeld meg, hogyan hat a többire.</em>
  `;
}

// Observer for theme changes to redraw radar
const observer = new MutationObserver(() => drawRadar());
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

drawRadar();
updateResultText();

/* ===== Gemini API Integration ===== */
let geminiApiKey = '';

const SYSTEM_PROMPT = `Te egy tapasztalt pedagógiai mentor és oktatáskutató vagy, aki a rendszerszemléletű oktatás szakértője. A feladatod, hogy magyar nyelven segítsd a pedagógusokat a hagyományos oktatásból a rendszerszemléletű oktatásba való átmenetben.

A rendszerszemléletű oktatás 7 dimenziója:
1. ISMERETÁTADÁS FÓKUSZA: Tantárgyi szigetektől → Interdiszciplináris kapcsolatok felé (összefüggések keresése, komplexitás)
2. TANULÁSI FOLYAMAT: Lineáris előrehaladástól → Iteratív és dinamikus ciklus felé (keresés, reflexió, fejlődés)
3. PEDAGÓGUS SZEREPE: Tudásforrás és irányítótól → Facilitátor és mentor felé (támogató, tanulóközpontú)
4. DIÁK SZEREPE: Passzív befogadótól → Aktív résztvevő és együttműködő felé (kritikus gondolkodó, közös munka)
5. ÉRTÉKELÉS MÓDJA: Összegző és külsőtől → Formatív és folyamatos felé (portfólió, kompetencia mérés)
6. OKTATÁSI KÖRNYEZET: Szigorú és izolálttól → Rugalmas és kapcsolódó felé (valós kontextus, nyitott)
7. RENDSZERSZEMLÉLET MINT EGÉSZ: Az összes dimenzió összekapcsolódik és egymást erősíti.

Válaszolj mindig:
- Gyakorlatias, azonnal alkalmazható tanácsokkal
- Konkrét példákkal és módszertani javaslatokkal
- Struktúrált formában (használj felsorolásokat, számozott listákat)
- Magyar nyelven, közérthető pedagógiai nyelven
- Mindig hivatkozz arra, melyik dimenzió(k)hoz kapcsolódik a válaszod
- Ha lehetséges, adj AI-vel támogatott megoldási javaslatokat is`;

const PROMPT_TEMPLATES = {
  interdiszciplinaris: {
    context: 'Interdiszciplináris térkép generálása',
    prefill: 'Készíts interdiszciplináris kapcsolati térképet a következő témához: [írd ide a témát, pl. "víz", "energia", "pénz"]. Mutasd meg, milyen tantárgyi kapcsolódási pontok léteznek, és adj konkrét feladatötleteket minden kapcsolathoz.'
  },
  oravazlat: {
    context: 'Óravázlat átalakítás',
    prefill: 'Alakítsd át a következő hagyományos óravázlatot rendszerszemléletű megközelítéssé: [írd ide a tantárgyat, témát, évfolyamot]. Tartsd meg az eredeti tananyagot, de építs be iteratív tanulási ciklusokat, kooperatív feladatokat és formatív értékelést.'
  },
  rubrika: {
    context: 'Formatív értékelési rubrika',
    prefill: 'Készíts formatív értékelési rubrikát a következő tanulási célhoz: [írd ide a tantárgyat és a konkrét tanulási célt]. A rubrika legyen kompetencia-alapú, 4 szinttel, és tartalmazzon önértékelési lehetőséget a diákok számára.'
  },
  reflexio: {
    context: 'Reflektív kérdések generálása',
    prefill: 'Generálj reflektív kérdéssorozatot a következő témához/tanórához: [írd ide a témát]. A kérdések segítsék a diákokat a metakogníció fejlesztésében, az iteratív tanulási ciklus tudatosításában.'
  },
  kooperativ: {
    context: 'Kooperatív feladat tervezése',
    prefill: 'Tervezz kooperatív tanulási feladatot a következő paraméterekkel: [tantárgy, téma, évfolyam, csoportlétszám]. A feladat aktiválja a diákokat, fejlessze a kritikus gondolkodást és az együttműködési készségeket.'
  },
  valos: {
    context: 'Valós világ kapcsolódási pontok',
    prefill: 'Keress valós világ kapcsolódási pontokat a következő tantervi témához: [írd ide a témát]. Adj konkrét példákat arra, hogyan lehet a tananyagot aktuális eseményekhez, helyi problémákhoz és a diákok életéhez kötni.'
  }
};

// API Key Management
const btnSaveKey = document.getElementById('btn-save-key');
const apiKeyInput = document.getElementById('api-key-input');
const apiStatus = document.getElementById('api-status');

btnSaveKey.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    apiStatus.textContent = 'Kérlek adj meg egy API kulcsot.';
    apiStatus.className = 'api-status error';
    return;
  }
  
  apiStatus.textContent = 'Ellenőrzés...';
  apiStatus.className = 'api-status';
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Válaszolj egyetlen szóval: működik' }] }]
        })
      }
    );
    
    if (response.ok) {
      geminiApiKey = key;
      apiStatus.textContent = 'API kulcs sikeresen elmentve és ellenőrizve.';
      apiStatus.className = 'api-status success';
      apiKeyInput.value = '';
      apiKeyInput.placeholder = '••••••••••••••••';
    } else {
      const err = await response.json();
      apiStatus.textContent = 'Hiba: ' + (err.error?.message || 'Érvénytelen API kulcs.');
      apiStatus.className = 'api-status error';
    }
  } catch (e) {
    apiStatus.textContent = 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.';
    apiStatus.className = 'api-status error';
  }
});

// Quick Actions
const chatContext = document.getElementById('chat-context');
const chatContextText = document.getElementById('chat-context-text');
const chatContextClose = document.getElementById('chat-context-close');
const chatInput = document.getElementById('chat-input');

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const promptKey = btn.dataset.prompt;
    const template = PROMPT_TEMPLATES[promptKey];
    if (template) {
      chatContext.hidden = false;
      chatContextText.textContent = template.context;
      chatInput.value = template.prefill;
      chatInput.focus();
      chatInput.setSelectionRange(
        chatInput.value.indexOf('['),
        chatInput.value.indexOf(']') + 1
      );
      document.getElementById('ai-chat').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

chatContextClose.addEventListener('click', () => {
  chatContext.hidden = true;
  chatContextText.textContent = '';
});

// Chat
const chatMessages = document.getElementById('chat-messages');
const btnSend = document.getElementById('btn-send');

let conversationHistory = [];

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = formatMessage(content);
  div.appendChild(bubble);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoading() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg-ai';
  div.id = 'chat-loading';
  div.innerHTML = '<div class="chat-loading"><span></span><span></span><span></span></div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoading() {
  const el = document.getElementById('chat-loading');
  if (el) el.remove();
}

function formatMessage(text) {
  // Basic markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h4>$1</h4>')
    .replace(/^# (.+)$/gm, '<h4>$1</h4>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
    .replace(/(<li>.*<\/li>)/gs, (match) => {
      if (!match.startsWith('<ul>') && !match.startsWith('<ol>')) {
        return '<ul>' + match + '</ul>';
      }
      return match;
    })
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  
  if (!geminiApiKey) {
    addMessage('ai', 'Kérlek, először állítsd be a Gemini API kulcsodat a fenti mezőben. Az API kulcs ingyenesen beszerezhető az AI Studio-ból.');
    return;
  }
  
  addMessage('user', text);
  chatInput.value = '';
  chatContext.hidden = true;
  addLoading();
  
  conversationHistory.push({ role: 'user', parts: [{ text: text }] });
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );
    
    removeLoading();
    
    if (!response.ok) {
      const err = await response.json();
      addMessage('ai', 'Hiba történt: ' + (err.error?.message || 'Ismeretlen hiba. Ellenőrizd az API kulcsot.'));
      conversationHistory.pop();
      return;
    }
    
    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sajnálom, nem tudtam választ generálni. Próbáld újra.';
    
    conversationHistory.push({ role: 'model', parts: [{ text: aiText }] });
    addMessage('ai', aiText);
    
  } catch (e) {
    removeLoading();
    addMessage('ai', 'Hálózati hiba történt. Ellenőrizd az internetkapcsolatot és próbáld újra.');
    conversationHistory.pop();
  }
}

btnSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// AI Plan from Assessment
document.getElementById('btn-get-ai-plan').addEventListener('click', () => {
  if (!geminiApiKey) {
    document.getElementById('ai-asszisztens').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  
  const values = getAssessmentValues();
  const assessment = dimLabels.map((label, i) => `${label}: ${values[i]}/5`).join('\n');
  
  const prompt = `A pedagógus önértékelési eredményei a rendszerszemléletű oktatás 6 dimenziójában (1=hagyományos, 5=rendszerszemléletű):\n\n${assessment}\n\nKérlek, készíts személyre szabott fejlesztési tervet:\n1. Értékeld az összesített helyzetet\n2. Azonosítsd a legfontosabb fejlesztendő területet\n3. Adj 3-5 konkrét, azonnal megvalósítható lépést a leggyengébb dimenzióhoz\n4. Mutasd meg, hogyan kapcsolódik a fejlesztés a többi dimenzióhoz (rendszerhatás)\n5. Javasolj egy 4 hetes „mini-transzformációs" tervet`;

  chatInput.value = prompt;
  document.getElementById('ai-asszisztens').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => sendMessage(), 300);
});

/* ===== Scroll Animation ===== */
const fadeEls = document.querySelectorAll('.dim-card, .assess-item, .api-key-card, .quick-btn');
fadeEls.forEach(el => el.classList.add('fade-in'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

fadeEls.forEach(el => io.observe(el));

// Fallback: make all elements visible after short delay in case observer misses
setTimeout(() => {
  fadeEls.forEach(el => {
    if (!el.classList.contains('visible')) {
      el.classList.add('visible');
    }
  });
}, 2000);

/* ===== Smooth Scroll for Nav ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
