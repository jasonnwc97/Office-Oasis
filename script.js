
const animalEmojis = ['🐄','🐑','🐔','🐇','🐖','🐐','🐝','🐒'];
const animals = [];
const purchaseCounts = {};
const MAX_PURCHASE = 4;
const SPEED = 80;
let grassPoints = 0;
let tick = 0;
const itemCounts = {
  '🥛': 0, '🧶': 0, '🥚': 0, '🥕': 0, '🍄': 0, '🧀': 0, '🍯': 0, '🍌': 0
};

// DOM references
const shopButton = document.getElementById('shopButton');
const shopPanel = document.getElementById('shopPanel');
const shopButtons = document.getElementById('shopButtons');
const animalZone = document.getElementById('animalZone');
const grassEl = document.getElementById('grassPoints');
const rateEl = document.getElementById('grassRate');
const itemEls = {
  '🥛': document.getElementById('milkPoints'),
  '🧶': document.getElementById('woolPoints'),
  '🥚': document.getElementById('eggPoints'),
  '🥕': document.getElementById('carrotPoints'),
  '🍄': document.getElementById('trufflePoints'),
  '🧀': document.getElementById('cheesePoints'),
  '🍯': document.getElementById('honeyPoints'),
  '🍌': document.getElementById('bananaPoints')
};

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
  updateButtons();
  updateGrassRate();
  for (const icon in itemCounts) {
    itemEls[icon].textContent = itemCounts[icon];
  }
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
  let total = 1;
  animals.forEach(el => {
    const lv = +el.dataset.level;
    if (lv >= 10) total += 2;
    else if (lv >= 5) total += 1;
  });
  rateEl.textContent = total;
}

// Resource pop effect
function showResourcePop(icon, x, y) {
  const el = document.createElement('div');
  el.className = 'resourcePop';
  el.textContent = icon;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  animalZone.appendChild(el);
  setTimeout(() => el.remove(), 1000);
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
  let tipText = `Feed me! Cost: 1 grass\n +0/sec grass`;
  const itemMap = {
    '🐄': '🥛', '🐑': '🧶', '🐔': '🥚', '🐇': '🥕',
    '🐖': '🍄', '🐐': '🧀', '🐝': '🍯', '🐒': '🍌'
  };
  if (itemMap[emoji]) tipText += `\n +0/sec ${itemMap[emoji]}`;
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

    const gRate = lv >= 10 ? 2 : lv >= 5 ? 1 : 0;
    const item = itemMap[el.dataset.emoji];

    let tipText = lv >= 10
      ? `Max lv\n +${gRate}/sec grass`
      : `Feed me! Cost: ${lv + 1} grass\n +${gRate}/sec grass`;
    if (item) tipText += `\n +${(1/5).toFixed(2)}/sec ${item}`;

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
      const itemMap = {
        '🐄': '🥛', '🐑': '🧶', '🐔': '🥚', '🐇': '🥕',
        '🐖': '🍄', '🐐': '🧀', '🐝': '🍯', '🐒': '🍌'
      };
      const item = itemMap[emoji];
      if (lv >= 10 && item) {
        itemCounts[item]++;
        const rect = el.getBoundingClientRect();
        const zoneRect = animalZone.getBoundingClientRect();
        const x = rect.left - zoneRect.left + rect.width / 2;
        const y = rect.top - zoneRect.top;
        showResourcePop(item, x, y);
      }
    });
  }

  updateDisplay();
}, 1000);

// Initialize
createShopButtons();
updateDisplay();
