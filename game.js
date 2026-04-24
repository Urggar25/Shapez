const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const TILE = 32;
const W = Math.floor(canvas.width / TILE);
const H = Math.floor(canvas.height / TILE);

const resourceCatalog = [
  'minerai', 'cuivre', 'charbon', 'sable', 'pétrole', 'cristaux', 'biomasse', 'eau',
  'uranium', 'titane', 'données quantiques', 'énergie pure',
  'ferraffiné', 'silicium', 'plastique', 'circuits', 'alliage', 'nanotube', 'carburant', 'module ia'
];

const machineCatalog = {
  extractor: { key: '1', name: 'Extracteur', cost: 20, color: '#4aa6ff' },
  belt: { key: '2', name: 'Tapis', cost: 1, color: '#f4d35e' },
  arm: { key: '3', name: 'Bras robotisé', cost: 8, color: '#f49fbc' },
  furnace: { key: '4', name: 'Four', cost: 30, color: '#ff7f50' },
  cutter: { key: '5', name: 'Découpeuse', cost: 32, color: '#9bc53d' },
  assembler: { key: '6', name: 'Assembleur', cost: 60, color: '#7dd3fc' },
  sorter: { key: '7', name: 'Trieur', cost: 26, color: '#a78bfa' },
  storage: { key: '8', name: 'Stockage', cost: 16, color: '#9ca3af' },
  refinery: { key: '9', name: 'Raffinerie', cost: 80, color: '#fb7185' },
  lab: { key: '0', name: 'Laboratoire', cost: 90, color: '#34d399' }
};

const techs = [
  { id: 'mk2', name: 'Industrie: Machines MK2', price: 80, done: false },
  { id: 'logi', name: 'Logistique: Tapis rapides', price: 120, done: false },
  { id: 'solar', name: 'Énergie: Solaire', price: 160, done: false },
  { id: 'ai', name: 'Informatique: Tri intelligent', price: 220, done: false },
  { id: 'exp', name: 'Expansion: Zone distante', price: 300, done: false },
  { id: 'prestige', name: 'Prestige alpha', price: 500, done: false }
];

const world = Array.from({ length: H }, () => Array.from({ length: W }, () => ({ machine: null, item: null })));
const deposits = [];

function placeDeposit(type, n, color) {
  for (let i = 0; i < n; i++) {
    const x = 2 + Math.floor(Math.random() * (W - 4));
    const y = 2 + Math.floor(Math.random() * (H - 4));
    deposits.push({ x, y, type, color });
  }
}

placeDeposit('minerai', 7, '#95a3b3');
placeDeposit('cuivre', 6, '#e58e49');
placeDeposit('charbon', 5, '#3f3f46');
placeDeposit('sable', 5, '#e7c27d');
placeDeposit('pétrole', 4, '#111827');
placeDeposit('eau', 4, '#3ba7ff');

const state = {
  selected: 'extractor',
  rotation: 1,
  credits: 180,
  science: 0,
  power: 100,
  pollution: 0,
  tick: 0,
  delivered: {},
  contract: null,
  deleteMode: false,
};

const dirs = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];

function setContract() {
  const target = ['circuits','ferraffiné','plastique','silicium'][Math.floor(Math.random()*4)];
  const amount = 60 + Math.floor(Math.random()*140);
  const reward = Math.floor(amount * 1.9);
  state.contract = { target, amount, reward, progress: 0 };
}
setContract();

const toolbar = document.getElementById('toolbar');
Object.entries(machineCatalog).forEach(([id, m]) => {
  const btn = document.createElement('button');
  btn.textContent = `${m.key} ${m.name}`;
  btn.onclick = () => { state.selected = id; renderToolbar(); };
  btn.dataset.id = id;
  toolbar.appendChild(btn);
});

function renderToolbar() {
  [...toolbar.children].forEach(b => b.classList.toggle('active', b.dataset.id === state.selected));
}
renderToolbar();

const keyToMachine = Object.fromEntries(Object.entries(machineCatalog).map(([id,m]) => [m.key, id]));
document.addEventListener('keydown', (e) => {
  if (keyToMachine[e.key]) { state.selected = keyToMachine[e.key]; renderToolbar(); }
  if (e.key.toLowerCase() === 'r') state.rotation = (state.rotation + 1) % 4;
  if (e.key.toLowerCase() === 'c') state.deleteMode = !state.deleteMode;
});

document.getElementById('newContract').onclick = setContract;

function saveGame() {
  const data = {
    world,
    state: { ...state, contract: state.contract },
    techs
  };
  localStorage.setItem('forgefront-save', JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem('forgefront-save');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (data.world && data.state && data.techs) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) world[y][x] = data.world[y][x] || world[y][x];
      Object.assign(state, data.state);
      data.techs.forEach((t, i) => techs[i] && Object.assign(techs[i], t));
    }
  } catch (_) {
    localStorage.removeItem('forgefront-save');
  }
}

loadGame();
setInterval(saveGame, 3000);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) * canvas.width / rect.width / TILE);
  const y = Math.floor((e.clientY - rect.top) * canvas.height / rect.height / TILE);
  if (x < 0 || y < 0 || x >= W || y >= H) return;

  if (state.deleteMode || window.event?.ctrlKey || window.event?.shiftKey) {
    world[y][x].machine = null;
    return;
  }

  const m = machineCatalog[state.selected];
  if (state.credits < m.cost) return;
  world[y][x].machine = { type: state.selected, rot: state.rotation, cd: 0, storage: [] };
  state.credits -= m.cost;
});

function isDeposit(x, y) {
  return deposits.find(d => d.x === x && d.y === y);
}

function processCell(x, y) {
  const cell = world[y][x];
  if (!cell.machine) return;
  const m = cell.machine;
  m.cd--;
  if (m.cd > 0) return;

  if (m.type === 'extractor') {
    const dep = isDeposit(x, y);
    if (!dep) return;
    const d = dirs[m.rot];
    const nx = x + d.x, ny = y + d.y;
    if (!world[ny]?.[nx] || world[ny][nx].item) return;
    world[ny][nx].item = { type: dep.type, age: 0 };
    m.cd = 18;
    state.power -= 0.1;
    state.pollution += dep.type === 'charbon' || dep.type === 'pétrole' ? 0.05 : 0.01;
  }

  if (m.type === 'furnace' || m.type === 'cutter' || m.type === 'assembler' || m.type === 'refinery') {
    if (!cell.item) return;
    const map = {
      furnace: { minerai: 'ferraffiné', cuivre: 'cuivre' },
      cutter: { cristaux: 'silicium', ferraffiné: 'alliage' },
      assembler: { ferraffiné: 'circuits', silicium: 'module ia' },
      refinery: { pétrole: 'plastique', biomasse: 'carburant' }
    };
    const out = map[m.type][cell.item.type];
    if (out) cell.item.type = out;
    m.cd = 24;
    state.power -= 0.2;
  }

  if (m.type === 'lab' && cell.item) {
    state.science += 1;
    cell.item = null;
    m.cd = 15;
  }
}

function moveItems() {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cell = world[y][x];
      if (!cell.item) continue;
      cell.item.age++;
      if (cell.item.age < 3) continue;
      cell.item.age = 0;
      const machine = cell.machine;
      let dir = {x: 1, y: 0};
      if (machine) dir = dirs[machine.rot] || dir;
      const nx = x + dir.x;
      const ny = y + dir.y;
      const next = world[ny]?.[nx];
      if (!next || next.item) continue;
      next.item = cell.item;
      cell.item = null;

      if (nx >= W - 1) {
        const t = next.item?.type;
        if (!t) continue;
        state.delivered[t] = (state.delivered[t] || 0) + 1;
        state.credits += 3;
        if (state.contract.target === t) {
          state.contract.progress += 1;
          if (state.contract.progress >= state.contract.amount) {
            state.credits += state.contract.reward;
            state.science += Math.floor(state.contract.reward / 15);
            setContract();
          }
        }
        next.item = null;
      }
    }
  }
}

function tickTech() {
  techs.forEach(t => {
    if (!t.done && state.science >= t.price) {
      t.done = true;
      state.power += 30;
      state.credits += 25;
    }
  });
}

function update() {
  state.tick++;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) processCell(x, y);
  moveItems();
  tickTech();
  if (state.tick % 30 === 0) state.power = Math.max(0, state.power - 0.2);
}

function drawCell(x, y, cell) {
  const px = x * TILE, py = y * TILE;
  ctx.fillStyle = '#101826';
  ctx.fillRect(px, py, TILE - 1, TILE - 1);

  const dep = isDeposit(x, y);
  if (dep) {
    ctx.fillStyle = dep.color;
    ctx.beginPath();
    ctx.arc(px + TILE/2, py + TILE/2, 9, 0, Math.PI*2);
    ctx.fill();
  }

  if (cell.machine) {
    const m = machineCatalog[cell.machine.type];
    ctx.fillStyle = m.color;
    ctx.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
    const d = dirs[cell.machine.rot];
    ctx.strokeStyle = '#0b0f14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + TILE/2, py + TILE/2);
    ctx.lineTo(px + TILE/2 + d.x * 10, py + TILE/2 + d.y * 10);
    ctx.stroke();
  }

  if (cell.item) {
    const c = ['#94a3b8', '#fb7185', '#facc15', '#34d399', '#60a5fa'][cell.item.type.length % 5];
    ctx.fillStyle = c;
    ctx.fillRect(px + 11, py + 11, 10, 10);
  }
}

function renderUI() {
  const stats = document.getElementById('stats');
  const throughput = Object.values(state.delivered).reduce((a,b)=>a+b,0);
  stats.innerHTML = `
    <li>Crédits: <span class="progress">${Math.floor(state.credits)}</span></li>
    <li>Science: <span class="progress">${state.science}</span></li>
    <li>Énergie: ${state.power.toFixed(1)}</li>
    <li>Pollution: ${state.pollution.toFixed(1)}</li>
    <li>Débit livré: ${throughput}</li>
    <li>Catalogue ressources: ${resourceCatalog.length}</li>
  `;

  document.getElementById('contract').textContent =
    `${state.contract.target}: ${state.contract.progress}/${state.contract.amount} (récompense ${state.contract.reward} crédits)`;

  const tt = document.getElementById('techTree');
  tt.innerHTML = techs.map(t => `<li>${t.done ? '✅' : '⬜'} ${t.name} (${t.price} science)</li>`).join('');

  document.getElementById('objectives').innerHTML = `
    <li>Automatiser 3 lignes indépendantes.</li>
    <li>Atteindre 500 crédits/minute.</li>
    <li>Débloquer 6 technologies.</li>
    <li>Réduire la pollution sous 25.</li>
  `;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) drawCell(x, y, world[y][x]);
  renderUI();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
