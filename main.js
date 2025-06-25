let grassPoints = 0;

function updateDisplay() {
  document.getElementById('grassPoints').textContent = grassPoints;
}

// Updates the grass/sec rate shown in the bottom-right corner
function updateGrassRateDisplay() {
  let total = 0;
  for (const el of animals) {
    const lv = parseInt(el.dataset.level);
    if (lv >= 10) total += 2;
    else if (lv >= 5) total += 1;
  }
  document.getElementById('grassRate').textContent = total;
}

// Adds grass periodically based on animal levels
setInterval(() => {
  for (const el of animals) {
    const lv = parseInt(el.dataset.level) || 0;
    if (lv >= 10) grassPoints += 2;
    else if (lv >= 5) grassPoints += 1;
  }
  updateDisplay();
  updateGrassRateDisplay();
}, 1000);

// Adds grass manually (e.g. on animal click reward)
function generateGrass(amount) {
  grassPoints += amount;
  updateDisplay();
  updateGrassRateDisplay();
}