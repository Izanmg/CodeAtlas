const DAY_WIDTH = 28;
const ROW_HEIGHT = 46;
const DEFAULT_CSV = 'gantt-projectlibre.csv';
const DONE_KEY = 'gantt-done-tasks';

const statusEl = document.getElementById('status');
const fileInput = document.getElementById('file-input');
const reloadBtn = document.getElementById('reload-default');
const exportPdfBtn = document.getElementById('export-pdf');
const toggleDeps = document.getElementById('toggle-deps');
const taskListEl = document.getElementById('task-list');
const timelineHeaderEl = document.getElementById('timeline-header');
const timelineBodyEl = document.getElementById('timeline-body');
const depLayerEl = document.getElementById('dep-layer');
const legendEl = document.getElementById('legend');

let currentTasks = [];
let currentCalendar = null;
let currentGroupColors = null;

// Persist done tasks across reloads
const doneTasks = new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]'));

function saveDone() {
  localStorage.setItem(DONE_KEY, JSON.stringify([...doneTasks]));
}

function showStatus(message, kind = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status show${kind === 'error' ? ' error' : ''}`;
}

function clearStatus() {
  statusEl.textContent = '';
  statusEl.className = 'status';
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((values) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = (values[index] || '').trim();
    });
    return item;
  });
}

function parseDuration(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function diffDays(start, end) {
  return Math.round((end - start) / 86400000);
}

function normalizeTasks(items) {
  const palette = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#475569'];
  const groupColors = new Map();

  const tasks = items
    .map((item, index) => {
      const start = parseDate(item['Start Date']);
      if (!start) return null;
      const duration = parseDuration(item['Duration']);
      const end = addDays(start, Math.max(duration - 1, 0));
      const group = item['Group'] || 'Sin grupo';
      if (!groupColors.has(group)) groupColors.set(group, palette[groupColors.size % palette.length]);
      const notes = item['Notes'] || '';
      const isMilestone = /hito/i.test(notes) || duration === 0;
      return {
        id: item['ID'] || String(index + 1),
        name: item['Task Name'] || `Tarea ${index + 1}`,
        start,
        end: isMilestone ? start : end,
        duration: Math.max(duration, 1),
        predecessors: String(item['Predecessors'] || '')
          .split(';')
          .map((v) => v.trim())
          .filter(Boolean),
        group,
        color: groupColors.get(group),
        notes,
        isMilestone,
      };
    })
    .filter(Boolean);

  return { tasks, groupColors };
}

function buildCalendar(tasks) {
  const minStart = tasks.reduce((min, task) => (task.start < min ? task.start : min), tasks[0].start);
  const maxEnd = tasks.reduce((max, task) => (task.end > max ? task.end : max), tasks[0].end);
  const start = addDays(minStart, -1);
  const end = addDays(maxEnd, 2);
  const days = [];

  for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
    days.push(new Date(d));
  }

  return { start, end, days };
}

function renderHeader(calendar) {
  timelineHeaderEl.innerHTML = '';

  const monthRow = document.createElement('div');
  monthRow.className = 'month-row';
  const dayRow = document.createElement('div');
  dayRow.className = 'day-row';

  let currentMonth = null;
  let monthSpan = 0;
  let monthStartIndex = 0;

  calendar.days.forEach((day, index) => {
    const monthKey = `${day.getFullYear()}-${day.getMonth()}`;
    if (currentMonth === null) {
      currentMonth = monthKey;
      monthSpan = 1;
      monthStartIndex = index;
    } else if (monthKey === currentMonth) {
      monthSpan++;
    } else {
      monthRow.appendChild(createMonthCell(calendar.days[monthStartIndex], monthSpan));
      currentMonth = monthKey;
      monthSpan = 1;
      monthStartIndex = index;
    }

    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    if (day.getDay() === 0 || day.getDay() === 6) dayCell.classList.add('weekend');
    if (isToday(day)) dayCell.classList.add('today');
    dayCell.textContent = String(day.getDate()).padStart(2, '0');
    dayRow.appendChild(dayCell);
  });

  if (monthSpan > 0) {
    monthRow.appendChild(createMonthCell(calendar.days[monthStartIndex], monthSpan));
  }

  timelineHeaderEl.append(monthRow, dayRow);
}

function createMonthCell(day, span) {
  const cell = document.createElement('div');
  cell.className = 'month-cell';
  cell.style.width = `${span * DAY_WIDTH}px`;
  cell.textContent = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(day);
  return cell;
}

function isToday(day) {
  const now = new Date();
  return day.getDate() === now.getDate() && day.getMonth() === now.getMonth() && day.getFullYear() === now.getFullYear();
}

function renderTasks(tasks, groupColors, calendar) {
  taskListEl.innerHTML = '';
  timelineBodyEl.querySelectorAll('.timeline-group-header, .timeline-row, .today-line').forEach((el) => el.remove());
  depLayerEl.innerHTML = '';

  let rowIndex = 0;
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const layoutMap = new Map();
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.group]) acc[task.group] = [];
    acc[task.group].push(task);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([group, groupTasks]) => {
    const header = document.createElement('div');
    header.className = 'group-header';
    header.innerHTML = `<span class="group-swatch" style="background:${groupColors.get(group)}"></span>${group}`;
    taskListEl.appendChild(header);

    const timelineHeader = document.createElement('div');
    timelineHeader.className = 'timeline-group-header';
    timelineHeader.style.width = `${calendar.days.length * DAY_WIDTH}px`;
    timelineBodyEl.appendChild(timelineHeader);
    rowIndex++;

    groupTasks.forEach((task) => {
      const isDone = doneTasks.has(task.id);

      // Panel row
      const row = document.createElement('div');
      row.className = `row${task.isMilestone ? ' is-milestone' : ''}${isDone ? ' done' : ''}`;
      row.dataset.taskId = task.id;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'task-done-cb';
      cb.checked = isDone;
      cb.dataset.taskId = task.id;
      cb.title = isDone ? 'Marcar como pendiente' : 'Marcar como hecha';

      const checkCell = document.createElement('span');
      checkCell.className = 'col-check';
      checkCell.appendChild(cb);

      row.appendChild(checkCell);
      row.insertAdjacentHTML('beforeend', `
        <span class="col-id">${task.id}</span>
        <span class="col-name" title="${task.name}">${task.name}</span>
        <span class="col-dates">${formatDate(task.start)} · ${task.isMilestone ? 'hito' : `${task.duration}d`}</span>
      `);
      taskListEl.appendChild(row);

      // Timeline row
      const timelineRow = document.createElement('div');
      timelineRow.className = 'timeline-row';
      timelineRow.style.width = `${calendar.days.length * DAY_WIDTH}px`;
      timelineBodyEl.appendChild(timelineRow);

      const startOffset = diffDays(calendar.start, task.start) * DAY_WIDTH;
      if (task.isMilestone) {
        const marker = document.createElement('div');
        marker.className = `milestone${isDone ? ' done' : ''}`;
        marker.style.left = `${startOffset + DAY_WIDTH / 2}px`;
        marker.title = `${task.name} (${formatDate(task.start)})`;
        marker.dataset.taskId = task.id;
        timelineRow.appendChild(marker);
      } else {
        const bar = document.createElement('div');
        bar.className = `bar${isDone ? ' done' : ''}`;
        bar.style.left = `${startOffset}px`;
        bar.style.width = `${Math.max(task.duration * DAY_WIDTH - 4, 16)}px`;
        bar.style.background = isDone ? undefined : task.color;
        bar.textContent = task.name;
        bar.title = `${task.name}\n${formatDate(task.start)} → ${formatDate(task.end)}`;
        bar.dataset.taskId = task.id;
        timelineRow.appendChild(bar);
      }

      layoutMap.set(task.id, {
        x: startOffset,
        y: rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2,
        width: task.isMilestone ? 0 : Math.max(task.duration * DAY_WIDTH - 4, 16),
      });
      rowIndex++;
    });
  });

  renderTodayLine(calendar, rowIndex);
  renderDependencies(tasks, taskMap, layoutMap);

  // Delegate checkbox clicks
  taskListEl.addEventListener('change', handleDoneToggle, { once: true });
}

function handleDoneToggle(e) {
  if (!e.target.classList.contains('task-done-cb')) return;
  const taskId = e.target.dataset.taskId;
  const isDone = e.target.checked;

  if (isDone) doneTasks.add(taskId);
  else doneTasks.delete(taskId);
  saveDone();

  // Update panel row
  const row = taskListEl.querySelector(`.row[data-task-id="${taskId}"]`);
  if (row) row.classList.toggle('done', isDone);

  // Update bar or milestone in timeline
  const barEl = timelineBodyEl.querySelector(`[data-task-id="${taskId}"]`);
  if (barEl) {
    barEl.classList.toggle('done', isDone);
    if (barEl.classList.contains('bar')) {
      const task = currentTasks.find((t) => t.id === taskId);
      barEl.style.background = isDone ? '' : (task ? task.color : '');
    }
  }

  // Re-attach listener (removed by once:true)
  taskListEl.addEventListener('change', handleDoneToggle, { once: true });
}

function renderTodayLine(calendar, rowCount) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today < calendar.start || today > calendar.end) return;
  const line = document.createElement('div');
  line.className = 'today-line';
  line.style.left = `${diffDays(calendar.start, today) * DAY_WIDTH + DAY_WIDTH / 2}px`;
  line.style.height = `${rowCount * ROW_HEIGHT}px`;
  timelineBodyEl.appendChild(line);
}

function renderDependencies(tasks, taskMap, layoutMap) {
  if (!toggleDeps.checked) return;
  depLayerEl.setAttribute('width', timelineBodyEl.scrollWidth || 1000);
  depLayerEl.setAttribute('height', timelineBodyEl.scrollHeight || 600);
  depLayerEl.innerHTML = `
    <defs>
      <marker id="dep-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"></path>
      </marker>
    </defs>
  `;

  tasks.forEach((task) => {
    const to = layoutMap.get(task.id);
    if (!to) return;
    task.predecessors.forEach((predId) => {
      const fromTask = taskMap.get(predId);
      const from = layoutMap.get(predId);
      if (!fromTask || !from) return;
      const x1 = from.x + (from.width || DAY_WIDTH / 2);
      const y1 = from.y;
      const x2 = to.x;
      const y2 = to.y;
      const midX = x1 + 16;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'dep-line');
      path.setAttribute('d', `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`);
      depLayerEl.appendChild(path);
    });
  });
}

function renderLegend(groupColors) {
  legendEl.innerHTML = '';
  [...groupColors.entries()].forEach(([group, color]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-swatch" style="background:${color}"></span>${group}`;
    legendEl.appendChild(item);
  });
  const milestone = document.createElement('div');
  milestone.className = 'legend-item';
  milestone.innerHTML = '<span class="legend-milestone"></span>Hito';
  legendEl.appendChild(milestone);

  const done = document.createElement('div');
  done.className = 'legend-item';
  done.innerHTML = '<span class="legend-swatch" style="background:#94a3b8"></span>Completada';
  legendEl.appendChild(done);
}

async function loadCsvFromText(text) {
  const items = parseCsv(text);
  if (!items.length) throw new Error('No se han encontrado tareas válidas en el CSV.');
  const { tasks, groupColors } = normalizeTasks(items);
  if (!tasks.length) throw new Error('No se han podido interpretar tareas con fecha válida.');
  const calendar = buildCalendar(tasks);
  currentTasks = tasks;
  currentCalendar = calendar;
  currentGroupColors = groupColors;
  renderHeader(calendar);
  renderTasks(tasks, groupColors, calendar);
  renderLegend(groupColors);
}

async function loadDefaultCsv() {
  clearStatus();
  try {
    const response = await fetch(DEFAULT_CSV);
    if (!response.ok) throw new Error('No se pudo cargar el CSV por defecto.');
    const text = await response.text();
    await loadCsvFromText(text);
  } catch (error) {
    showStatus(`${error.message} Puedes cargar un CSV manualmente.`, 'error');
  }
}

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  clearStatus();
  const text = await file.text();
  try {
    await loadCsvFromText(text);
  } catch (error) {
    showStatus(error.message, 'error');
  }
});

reloadBtn.addEventListener('click', () => {
  loadDefaultCsv();
});

exportPdfBtn.addEventListener('click', () => {
  window.print();
});

toggleDeps.addEventListener('change', () => {
  if (!currentTasks.length || !currentCalendar) return;
  renderTasks(currentTasks, currentGroupColors, currentCalendar);
});

loadDefaultCsv();
