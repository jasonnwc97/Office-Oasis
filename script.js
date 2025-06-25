const animalEmojis = ['🦍','🐕','🐈','🐄','🐖','🐑','🐇','🐤'];
const animals = [];
const purchaseCounts = {};
const MAX_PURCHASE = 4;
const SPEED = 80;

let grassPoints = 0;
let milkPoints = 0;
let woolPoints = 0;
let tick = 0;

// DOM references
const shopButton = document.getElementById('shopButton');
const shopPanel = document.getElementById('shopPanel');
const shopButtons = document.getElementById('shopButtons');
const animalZone = document.getElementById('animalZone');
const grassEl = document.getElementById('grassPoints');
const rateEl = document.getElementById('grassRate');
const milkEl = document.getElementById('milkPoints');
const woolEl = document.getElementById('woolPoints');

// Toggle shop visibility
shopButton.addEventListener('click', () => {
  shopPanel.classList.toggle('hidden');
});

// Create shop buttons
function createShopButtons() {
  animalEmojis.forEach(emoji => {
    purchaseCounts[emoji] = 0;
    const btn = document.createElement('button');
    btn.className = 'animalButton';
    btn.dataset.emoji = emoji;
    btn.onclick = () => {
      if (grassPoints < 1 || purchaseCounts[emoji] >= MAX_PURCHASE) return;
      grassPoints--;
      purchaseCounts[emoji]++;
      createAnimal(emoji);
      updateDisplay();
    };
    shopButtons.appendChild(btn);
  });
  updateButtons();
}

// UI updates
function updateDisplay() {
  grassEl.textContent = grassPoints;
  milkEl.textContent = milkPoints;
  woolEl.textContent = woolPoints;
  updateButtons();
  updateGrassRate();
}

function updateButtons() {
  document.querySelectorAll('.animalButton').forEach(btn => {
    const emoji = btn.dataset.emoji;
    const count = purchaseCounts[emoji];
    btn.textContent = `${emoji} (${count}/${MAX_PURCHASE})`;
    btn.disabled = grassPoints < 1 || count >= MAX_PURCHASE;
  });
}

function updateGrassRate() {
  let total = 1; // base rate
  animals.forEach(el => {
    const lv = +el.dataset.level;
    if (lv >= 10) total += 2;
    else if (lv >= 5) total += 1;
  });
  rateEl.textContent = total;
}

// Animal creation
function createAnimal(emoji) {
  const el = document.createElement('div');
  el.className = 'animal';
  el.dataset.emoji = emoji;
  el.dataset.level = '0';
  el.dataset.scale = '0.6';
  el.dataset.direction = '1';
  el.style.transition = 'none';

  const body = document.createElement('div');
  body.className = 'animalBody';
  body.textContent = emoji;
  body.style.transform = 'scaleX(1) scale(0.6)';
  el.appendChild(body);

  const tip = document.createElement('div');
  tip.className = 'animalTooltip';
  let tipText = `Feed me! Cost: 1 grass | +0/sec grass`;
  if (emoji === '🐄') tipText += ' | +0/sec 🥛';
  if (emoji === '🐑') tipText += ' | +0/sec 🧶';
  tip.textContent = tipText;
  el.appendChild(tip);
  el._tip = tip;

  animalZone.appendChild(el);
  animals.push(el);

  const maxX = animalZone.clientWidth - el.clientWidth;
  const maxY = animalZone.clientHeight - el.clientHeight;
  el.style.left = `${Math.random() * maxX}px`;
  el.style.top = `${Math.random() * maxY}px`;

  requestAnimationFrame(() => {
    moveAnimal(el);
    scheduleMove(el);
  });

  el.addEventListener('click', () => {
    let lv = +el.dataset.level;
    if (lv >= 10) return;
    const cost = lv + 1;
    if (grassPoints < cost) return;

    grassPoints -= cost;
    lv++;
    el.dataset.level = lv;

    const scale = parseFloat(el.dataset.scale) * 1.1;
    el.dataset.scale = scale.toFixed(2);

    if (el.dataset.emoji === '🐤' && lv >= 5) {
      body.textContent = '🐓';
      el.dataset.emoji = '🐓';
    }

    const gRate = lv >= 10 ? 2 : lv >= 5 ? 1 : 0;
    const emoji = el.dataset.emoji;
    const isCow = emoji === '🐄';
    const isSheep = emoji === '🐑';
    const milkRate = isCow && lv >= 10 ? (1 / 5).toFixed(2) : 0;
    const woolRate = isSheep && lv >= 10 ? (1 / 5).toFixed(2) : 0;

    let tipText = lv >= 10
      ? `Max lv | +${gRate}/sec grass`
      : `Feed me! Cost: ${lv + 1} grass | +${gRate}/sec grass`;
    if (isCow) tipText += ` | +${milkRate}/sec 🥛`;
    if (isSheep) tipText += ` | +${woolRate}/sec 🧶`;
    el._tip.textContent = tipText;

    const dir = el.dataset.direction;
    body.style.transform = `scaleX(${dir}) scale(${scale})`;

    updateDisplay();
  });
}

// Animal movement
function moveAnimal(el) {
  const size = el.clientWidth;
  const maxX = animalZone.clientWidth - size;
  const maxY = animalZone.clientHeight - size;
  const curX = parseFloat(el.style.left) || 0;
  const curY = parseFloat(el.style.top) || 0;
  const newX = Math.random() * maxX;
  const newY = Math.random() * maxY;
  const dist = Math.hypot(newX - curX, newY - curY);
  const dur = dist / SPEED;
  const dir = newX > curX ? -1 : 1;

  el.dataset.direction = dir;
  el.querySelector('.animalBody').style.transform =
    `scaleX(${dir}) scale(${el.dataset.scale})`;

  el.style.transition = `left ${dur}s ease, top ${dur}s ease`;
  el.style.left = `${newX}px`;
  el.style.top = `${newY}px`;
}

function scheduleMove(el) {
  const delay = 10000 + Math.random() * 15000;
  setTimeout(() => {
    moveAnimal(el);
    scheduleMove(el);
  }, delay);
}

// Passive generation loop
setInterval(() => {
  tick++;
  grassPoints += 1;
  animals.forEach(el => {
    const lv = +el.dataset.level;
    if (lv >= 10) grassPoints += 2;
    else if (lv >= 5) grassPoints += 1;
  });

  if (tick % 5 === 0) {
    animals.forEach(el => {
      const emoji = el.dataset.emoji;
      const lv = +el.dataset.level;
      if (lv >= 10) {
        if (emoji === '🐄') milkPoints++;
        if (emoji === '🐑') woolPoints++;
      }
    });
  }

  updateDisplay();
}, 1000);

// Initialize
createShopButtons();
updateDisplay();