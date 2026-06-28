// graphs.js – All interactive graphs using Canvas API

function drawAxes(ctx, W, H, xmin, xmax, ymin, ymax, labelX, labelY) {
  const pad = 40;
  const sx = x => pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad);
  const sy = y => H - pad - (y - ymin) / (ymax - ymin) * (H - 2 * pad);

  ctx.clearRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = '#21262d';
  ctx.lineWidth = 1;
  for (let x = Math.ceil(xmin); x <= xmax; x++) {
    ctx.beginPath(); ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), H - pad); ctx.stroke();
  }
  for (let y = Math.ceil(ymin); y <= ymax; y++) {
    ctx.beginPath(); ctx.moveTo(pad, sy(y)); ctx.lineTo(W - pad, sy(y)); ctx.stroke();
  }

  // axes
  ctx.strokeStyle = '#484f58'; ctx.lineWidth = 1.5;
  if (ymin < 0 && ymax > 0) {
    ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(W - pad, sy(0)); ctx.stroke();
  }
  if (xmin < 0 && xmax > 0) {
    ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), H - pad); ctx.stroke();
  }

  // tick labels
  ctx.fillStyle = '#8b949e'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
  for (let x = Math.ceil(xmin); x <= Math.floor(xmax); x++) {
    if (x === 0) continue;
    ctx.fillText(x, sx(x), sy(0) > H - pad ? H - pad + 14 : sy(0) + 14);
  }
  ctx.textAlign = 'right';
  for (let y = Math.ceil(ymin); y <= Math.floor(ymax); y++) {
    if (y === 0) continue;
    ctx.fillText(y, sx(0) < pad ? pad - 4 : sx(0) - 4, sy(y) + 4);
  }

  // axis labels
  ctx.fillStyle = '#8b949e'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
  if (labelX) ctx.fillText(labelX, W - 10, sy(0) > H - pad ? H - pad + 14 : sy(0) - 6);
  if (labelY) { ctx.save(); ctx.translate(14, pad); ctx.rotate(-Math.PI / 2); ctx.fillText(labelY, 0, 0); ctx.restore(); }

  return { sx, sy, pad };
}

function plotFunction(ctx, fn, xmin, xmax, ymin, ymax, sx, sy, color, lineWidth) {
  ctx.strokeStyle = color || '#58a6ff';
  ctx.lineWidth = lineWidth || 2.5;
  ctx.beginPath();
  let started = false;
  const steps = 600;
  for (let i = 0; i <= steps; i++) {
    const x = xmin + i / steps * (xmax - xmin);
    let y;
    try { y = fn(x); } catch (e) { started = false; continue; }
    if (!isFinite(y) || isNaN(y)) { started = false; continue; }
    if (y < ymin - 50 || y > ymax + 50) { started = false; continue; }
    const px = sx(x), py = sy(y);
    if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
  }
  ctx.stroke();
}

function drawPoint(ctx, sx, sy, x, y, color, label) {
  ctx.fillStyle = color || '#f85149';
  ctx.beginPath(); ctx.arc(sx(x), sy(y), 5, 0, 2 * Math.PI); ctx.fill();
  if (label) {
    ctx.fillStyle = '#e6edf3'; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(label, sx(x) + 8, sy(y) - 6);
  }
}

function drawAsymptote(ctx, sx, sy, x, xmin, xmax, ymin, ymax, W, H, pad, isVertical) {
  ctx.strokeStyle = '#f7816660'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
  ctx.beginPath();
  if (isVertical) { ctx.moveTo(sx(x), pad); ctx.lineTo(sx(x), H - pad); }
  else { ctx.moveTo(pad, sy(x)); ctx.lineTo(W - pad, sy(x)); }
  ctx.stroke(); ctx.setLineDash([]);
}

// ─── GRAPH 1: Logarithm and Exponential ───
function initGraph_logexp() {
  const c = document.getElementById('graph-logexp'); if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const { sx, sy, pad } = drawAxes(ctx, W, H, -0.5, 4, -3, 3, 'x', 'y');
  plotFunction(ctx, x => Math.log(x), 0.01, 4, -3, 3, sx, sy, '#58a6ff');
  plotFunction(ctx, x => Math.exp(x), -0.5, 1.1, -3, 3, sx, sy, '#3fb950');
  plotFunction(ctx, x => x, -0.5, 3, -3, 3, sx, sy, '#484f58', 1.5);
  // labels
  ctx.fillStyle = '#58a6ff'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('y = ln(x)', sx(2.2), sy(0.85));
  ctx.fillStyle = '#3fb950'; ctx.fillText('y = eˣ', sx(0.7), sy(2.2));
  ctx.fillStyle = '#484f58'; ctx.fillText('y = x', sx(2.2), sy(2.4));
}

// ─── GRAPH 2: Domain sign chart visualizer ───
function initGraph_signChart() {
  const c = document.getElementById('graph-signchart'); if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const { sx, sy, pad } = drawAxes(ctx, W, H, -3, 3, -4, 4, 'x', 'f(x)');
  plotFunction(ctx, x => x * x * x - x, -2.5, 2.5, -4, 4, sx, sy, '#58a6ff');
  // critical points
  drawPoint(ctx, sx, sy, -1, 0, '#e3b341', 'x=−1');
  drawPoint(ctx, sx, sy, 0, 0, '#e3b341', 'x=0');
  drawPoint(ctx, sx, sy, 1, 0, '#e3b341', 'x=1');
  ctx.fillStyle = '#c9d1d9'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('f(x) = x³ − x', W / 2, pad - 8);
}

// ─── GRAPH 3: Derivative sign chart → shape ───
function initGraph_exerciseA(canvasId, fn, fprime, fsecond, xmin, xmax, ymin, ymax, title) {
  const c = document.getElementById(canvasId); if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const { sx, sy, pad } = drawAxes(ctx, W, H, xmin, xmax, ymin, ymax, 'x', 'y');
  // draw asymptotes first
  if (fn.asymptotes) fn.asymptotes.forEach(a => drawAsymptote(ctx, sx, sy, a, xmin, xmax, ymin, ymax, W, H, pad, true));
  if (fn.hasymp) drawAsymptote(ctx, sx, sy, fn.hasymp, xmin, xmax, ymin, ymax, W, H, pad, false);
  plotFunction(ctx, fn, xmin, xmax, ymin, ymax, sx, sy, '#58a6ff');
  if (fn.maxima) fn.maxima.forEach(([x, y]) => drawPoint(ctx, sx, sy, x, y, '#3fb950', `max`));
  if (fn.minima) fn.minima.forEach(([x, y]) => drawPoint(ctx, sx, sy, x, y, '#f85149', `min`));
  if (fn.inflections) fn.inflections.forEach(([x, y]) => drawPoint(ctx, sx, sy, x, y, '#d2a8ff', `inf`));
  ctx.fillStyle = '#c9d1d9'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, pad - 8);
}

// ─── GRAPH 4: 2D function contour (critical points) ───
function initContourGraph(canvasId, fn, xmin, xmax, ymin, ymax, title, critPoints) {
  const c = document.getElementById(canvasId); if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const pad = 30;
  const sx = x => pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad);
  const sy = y => H - pad - (y - ymin) / (ymax - ymin) * (H - 2 * pad);

  // compute z range
  let zmin = Infinity, zmax = -Infinity;
  const steps = 60;
  const vals = [];
  for (let i = 0; i <= steps; i++) {
    vals.push([]);
    for (let j = 0; j <= steps; j++) {
      const x = xmin + i / steps * (xmax - xmin);
      const y = ymin + j / steps * (ymax - ymin);
      const z = fn(x, y);
      vals[i].push(z);
      if (isFinite(z)) { if (z < zmin) zmin = z; if (z > zmax) zmax = z; }
    }
  }

  // draw heatmap
  const cellW = (W - 2 * pad) / steps;
  const cellH = (H - 2 * pad) / steps;
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps; j++) {
      const z = vals[i][j];
      if (!isFinite(z)) continue;
      const t = (z - zmin) / (zmax - zmin);
      const r = Math.round(30 + t * 40);
      const g = Math.round(40 + t * 100);
      const b = Math.round(80 + t * 80);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(pad + i * cellW, pad + j * cellH, cellW + 1, cellH + 1);
    }
  }

  // axes lines
  ctx.strokeStyle = '#484f58'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sx(0), pad); ctx.lineTo(sx(0), H - pad); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad, sy(0)); ctx.lineTo(W - pad, sy(0)); ctx.stroke();

  // critical points
  const colors = { min: '#3fb950', max: '#f85149', saddle: '#ffa657' };
  if (critPoints) critPoints.forEach(([x, y, type]) => {
    ctx.fillStyle = colors[type] || '#58a6ff';
    ctx.beginPath(); ctx.arc(sx(x), sy(y), 6, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = '#0d1117'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx(x), sy(y), 6, 0, 2 * Math.PI); ctx.stroke();
  });

  // title
  ctx.fillStyle = '#c9d1d9'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, 16);

  // legend
  const legend = [['#3fb950', 'min'], ['#f85149', 'max'], ['#ffa657', 'saddle']];
  legend.forEach(([color, label], i) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(pad + i * 70 + 8, H - 10, 4, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = '#8b949e'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(label, pad + i * 70 + 16, H - 7);
  });
}

// ─── ALL EXERCISE A FUNCTIONS ───
const exA_functions = {
  jan2025: {
    fn: x => (5 * x * x - 2 * x) / Math.exp(x),
    title: 'Jan 2025: f(x) = (5x²−2x)/eˣ',
    xmin: -1.5, xmax: 8, ymin: -2, ymax: 4,
    maxima: [[0.293, 0.108]], minima: [[5.707, -0.382]], inflections: [[1.414, 0.5]]
  },
  mar2025: {
    fn: x => Math.pow(x, 4) - 2 * Math.pow(x, 3) + 1,
    title: 'Mar 2025: f(x) = x⁴ − 2x³ + 1',
    xmin: -1.5, xmax: 2.5, ymin: -1, ymax: 4,
    minima: [[1.5, -0.6875]], inflections: [[0, 1], [1, 0]]
  },
  may2025: {
    fn: x => {
      if (x <= 2 || x >= 4) return NaN;
      return Math.log((4 - x) / (x - 2));
    },
    title: 'May 2025: f(x) = ln((4−x)/(x−2))',
    xmin: 1, xmax: 5, ymin: -4, ymax: 4,
    asymptotes: [2, 4]
  },
  jul2025: {
    fn: x => {
      if (x <= -1 || x >= 1) return NaN;
      return Math.log((1 - x) / (1 + x));
    },
    title: 'Jul 2025: f(x) = ln((1−x)/(1+x))',
    xmin: -2, xmax: 2, ymin: -4, ymax: 4,
    asymptotes: [-1, 1]
  },
  nov2025: {
    fn: x => {
      if (x <= 2 || x >= 4) return NaN;
      return Math.log((4 - x) / (x - 2));
    },
    title: 'Nov 2025: f(x) = ln((4−x)/(x−2))',
    xmin: 1, xmax: 5, ymin: -4, ymax: 4,
    asymptotes: [2, 4]
  },
  dec2025: {
    fn: x => Math.pow(x, 5) - Math.pow(x, 3),
    title: 'Dec 2025: f(x) = x⁵ − x³',
    xmin: -1.8, xmax: 1.8, ymin: -0.6, ymax: 0.6,
    maxima: [[-0.775, 0.1]],
    minima: [[0.775, -0.1]],
    inflections: [[-1, -0], [0, 0], [1, 0]]
  },
  jan2026: {
    fn: x => {
      if (x <= -1 || x >= 1) return NaN;
      return 1 / (1 - x * x);
    },
    title: 'Jan 2026: f(x) = 1/(1−x²)',
    xmin: -2.5, xmax: 2.5, ymin: -6, ymax: 6,
    asymptotes: [-1, 1],
    hasymp: 0
  },
  mar2026: {
    fn: x => {
      if (Math.abs(x) >= 1) return NaN;
      return 1 / (1 - x * x);
    },
    title: 'Mar 2026: f(x) = 1/(1−x²)',
    xmin: -2, xmax: 2, ymin: -6, ymax: 6,
    asymptotes: [-1, 1]
  },
  may2026: {
    fn: x => {
      if (x === 1 || x === -1) return NaN;
      return x / (x * x - 1);
    },
    title: 'May 2026: f(x) = x/(x²−1)',
    xmin: -4, xmax: 4, ymin: -5, ymax: 5,
    asymptotes: [-1, 1],
    hasymp: 0
  }
};

// ─── INIT ALL GRAPHS ───
function initAllGraphs() {
  initGraph_logexp();
  initGraph_signChart();

  Object.entries(exA_functions).forEach(([key, cfg]) => {
    const fn = cfg.fn;
    fn.asymptotes = cfg.asymptotes;
    fn.hasymp = cfg.hasymp;
    fn.maxima = cfg.maxima;
    fn.minima = cfg.minima;
    fn.inflections = cfg.inflections;
    initGraph_exerciseA('graph-' + key, fn, null, null, cfg.xmin, cfg.xmax, cfg.ymin, cfg.ymax, cfg.title);
  });

  // Contour graphs for Exercise B
  initContourGraph('contour-jan2025', (x, y) => x*x*x - 3*x + y*y*y - 3*y, -2.5, 2.5, -2.5, 2.5,
    'g(x,y) = x³−3x+y³−3y', [[-1,-1,'min'],[1,1,'min'],[-1,1,'saddle'],[1,-1,'saddle']]);

  initContourGraph('contour-dec2025', (x, y) => Math.log(x*x + y*y + 1), -2.5, 2.5, -2.5, 2.5,
    'g(x,y) = log(x²+y²+1)', [[0,0,'min']]);

  initContourGraph('contour-jan2026', (x, y) => Math.exp(x*x + y*y + 1), -2.5, 2.5, -2.5, 2.5,
    'g(x,y) = e^(x²+y²+1)', [[0,0,'min']]);

  initContourGraph('contour-may2026', (x, y) => x*x + y*y - 2*x - 4*y, -1, 4, -1, 6,
    'g(x,y) = x²+y²−2x−4y', [[1,2,'min']]);
}

window.addEventListener('load', () => {
  setTimeout(initAllGraphs, 300);
});
