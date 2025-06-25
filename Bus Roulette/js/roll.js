// roll.js
const resultEl = document.getElementById('result');
const rollBtn = document.getElementById('rollBtn');

// Set your desired range here (e.g., 2–12)
const MIN = 2;
const MAX = 12;

function rollDice() {
  const number = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  resultEl.textContent = `🚌 Take ${number} stops!`;

  resultEl.classList.add('animate');
  setTimeout(() => resultEl.classList.remove('animate'), 200);
}


rollBtn.addEventListener('click', rollDice);
