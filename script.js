/* =========================================
   FLOW STATE SORTEIO — script.js
   ========================================= */

// ─── CONFIG ──────────────────────────────
const CONFIG = {
  totalNumbers: 200,

  // Defina a data de encerramento (próxima sexta às 18h)
  // Formato: new Date(ano, mês-1, dia, hora, minuto, segundo)
  getNextFriday() {
    const now = new Date();
    const day = now.getDay(); // 0=dom ... 5=sex ... 6=sáb
    const daysUntilFriday = (5 - day + 7) % 7 || 7; // sempre a próxima sexta
    const friday = new Date(now);
    friday.setDate(now.getDate() + daysUntilFriday);
    friday.setHours(18, 0, 0, 0);
    return friday;
  },

  // Números já vendidos (pago) — edite conforme necessário
  soldNumbers: [],

  // Números reservados (aguardando pagamento) — edite conforme necessário
  reservedNumbers: [],

  // Número do WhatsApp (formato internacional, sem +)
  whatsappNumber: '5563999999999',
};

// ─── ESTADO ──────────────────────────────
const endDate = CONFIG.getNextFriday();

// ─── INICIALIZAÇÃO ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderGrid();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  initScrollCTA();
  initPixCopy();
});

// ─── GRADE DE NÚMEROS ─────────────────────
function renderGrid() {
  const grid = document.getElementById('numbersGrid');
  if (!grid) return;

  const soldSet     = new Set(CONFIG.soldNumbers);
  const reservedSet = new Set(CONFIG.reservedNumbers);

  let available = 0;

  for (let i = 1; i <= CONFIG.totalNumbers; i++) {
    const num = String(i).padStart(3, '0');
    const btn = document.createElement('button');
    btn.className = 'num-btn';
    btn.textContent = num;

    if (soldSet.has(i)) {
      btn.classList.add('sold');
      btn.setAttribute('aria-label', `Número ${num} — pago`);
      btn.disabled = true;
    } else if (reservedSet.has(i)) {
      btn.classList.add('reserved');
      btn.setAttribute('aria-label', `Número ${num} — reservado`);
      btn.disabled = true;
    } else {
      available++;
      btn.setAttribute('aria-label', `Número ${num} — disponível`);
      btn.addEventListener('click', () => handleNumberClick(i, num));
    }

    grid.appendChild(btn);
  }

  const countEl = document.getElementById('availableCount');
  if (countEl) {
    const sold     = soldSet.size;
    const reserved = reservedSet.size;
    countEl.textContent = `${available} disponíveis · ${sold} pagos · ${reserved} reservados`;
  }
}

// ─── CLIQUE NO NÚMERO ─────────────────────
function handleNumberClick(num, numFormatted) {
  const msg = encodeURIComponent(
    `Olá! Quero participar do sorteio da Camiseta do Brasil 🇧🇷\n\n` +
    `Número escolhido: *${numFormatted}*\n\n` +
    `Valor: R$ 5,00 via PIX`
  );
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${msg}`;
  window.open(url, '_blank', 'noopener,noreferrer');

  // Feedback visual rápido
  flashButton(numFormatted);
}

function flashButton(numFormatted) {
  const buttons = document.querySelectorAll('.num-btn');
  buttons.forEach(btn => {
    if (btn.textContent === numFormatted) {
      btn.style.background = 'rgba(155,92,246,0.35)';
      btn.style.borderColor = '#C084FC';
      btn.style.transform = 'scale(1.12)';
      setTimeout(() => {
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.transform = '';
      }, 600);
    }
  });
}

function initPixCopy() {
  const pixButtons = document.querySelectorAll('.pix-copy-btn');
  pixButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pixValue = btn.dataset.pix || '';
      navigator.clipboard.writeText(pixValue).then(() => {
        btn.textContent = 'PIX COPIADO';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'COPIAR PIX';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(() => {
        btn.textContent = 'COPIAR MANUAL';
      });
    });
  });
}

// ─── CONTADOR REGRESSIVO ──────────────────
function updateCountdown() {
  const now  = new Date();
  const diff = endDate - now;

  if (diff <= 0) {
    setCountdownUnits(0, 0, 0, 0);
    const label = document.querySelector('.countdown-label');
    if (label) label.textContent = '⚡ SORTEIO ENCERRADO';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  setCountdownUnits(days, hours, minutes, seconds);
}

function setCountdownUnits(d, h, m, s) {
  const pad = n => String(n).padStart(2, '0');
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    const newVal = pad(val);
    if (el.textContent !== newVal) {
      el.textContent = newVal;
      el.classList.remove('tick');
      // força reflow para reiniciar a animação
      void el.offsetWidth;
      el.classList.add('tick');
    }
  };
  set('days',    d);
  set('hours',   h);
  set('minutes', m);
  set('seconds', s);
}

// ─── CTA FLUTUANTE (scroll) ───────────────
function initScrollCTA() {
  const floatingCta = document.querySelector('.floating-cta');
  if (!floatingCta) return;

  // Oculta o CTA flutuante quando o CTA principal está visível
  const mainCta = document.querySelector('.cta-section');
  if (!mainCta) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        floatingCta.style.opacity = '0';
        floatingCta.style.pointerEvents = 'none';
        floatingCta.style.transform = 'translateX(-50%) translateY(20px)';
      } else {
        floatingCta.style.opacity = '1';
        floatingCta.style.pointerEvents = 'auto';
        floatingCta.style.transform = 'translateX(-50%) translateY(0)';
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(mainCta);
  floatingCta.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
}

// ─── ADMIN HELPERS (console) ──────────────
// Para atualizar os números pelo console do navegador:
//   SORTEIO.markSold([1, 5, 12])
//   SORTEIO.markReserved([3, 7])
//   SORTEIO.clearAll()
window.SORTEIO = {
  markSold(nums) {
    CONFIG.soldNumbers = [...new Set([...CONFIG.soldNumbers, ...nums])];
    document.getElementById('numbersGrid').innerHTML = '';
    renderGrid();
    console.log('✅ Vendidos:', CONFIG.soldNumbers);
  },
  markReserved(nums) {
    CONFIG.reservedNumbers = [...new Set([...CONFIG.reservedNumbers, ...nums])];
    document.getElementById('numbersGrid').innerHTML = '';
    renderGrid();
    console.log('🕐 Reservados:', CONFIG.reservedNumbers);
  },
  clearAll() {
    CONFIG.soldNumbers = [];
    CONFIG.reservedNumbers = [];
    document.getElementById('numbersGrid').innerHTML = '';
    renderGrid();
    console.log('🔄 Grade resetada');
  },
  status() {
    console.log({
      soldNumbers: CONFIG.soldNumbers,
      reservedNumbers: CONFIG.reservedNumbers,
      endDate: endDate.toLocaleString('pt-BR'),
    });
  }
};
