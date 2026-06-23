const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7);
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#ef4444', '#84cc16'];
const KEY = 'coordinapp-final-state-v1';

const demoState = {
  theme: 'dark',
  activeGroupId: 'g1',
  mode: 'work',
  groups: [
    { id: 'g1', name: 'Proyecto de Control', members: [
      { id: 'm1', name: 'Yo', color: COLORS[0] }, { id: 'm2', name: 'María', color: COLORS[1] }, { id: 'm3', name: 'Juan', color: COLORS[2] }
    ], tasks: [
      { id: 't1', memberId: 'm1', title: 'Clase', day: 0, start: '08:30', end: '10:00' },
      { id: 't2', memberId: 'm2', title: 'Laboratorio', day: 0, start: '11:00', end: '13:00' },
      { id: 't3', memberId: 'm3', title: 'Reunión cliente', day: 1, start: '09:00', end: '10:30' },
      { id: 't4', memberId: 'm1', title: 'Estudio', day: 2, start: '15:00', end: '17:00' },
      { id: 't5', memberId: 'm2', title: 'Ayudantía', day: 3, start: '14:00', end: '15:30' },
      { id: 't6', memberId: 'm3', title: 'Entrega informe', day: 4, start: '12:00', end: '13:30' }
    ]},
    { id: 'g2', name: 'Amigos', members: [
      { id: 'm4', name: 'Yo', color: COLORS[0] }, { id: 'm5', name: 'Sofía', color: COLORS[3] }, { id: 'm6', name: 'Tomás', color: COLORS[4] }
    ], tasks: [
      { id: 't7', memberId: 'm4', title: 'Universidad', day: 4, start: '09:00', end: '13:00' },
      { id: 't8', memberId: 'm5', title: 'Gimnasio', day: 5, start: '11:00', end: '12:30' },
      { id: 't9', memberId: 'm6', title: 'Trabajo', day: 5, start: '15:00', end: '18:00' }
    ]},
    { id: 'g3', name: 'Familia', members: [
      { id: 'm7', name: 'Yo', color: COLORS[0] }, { id: 'm8', name: 'Mamá', color: COLORS[1] }
    ], tasks: [
      { id: 't10', memberId: 'm8', title: 'Médico', day: 2, start: '10:00', end: '11:00' }
    ]}
  ]
};

let state = loadState();
let textDialogMode = 'group';

function loadState(){
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(demoState); }
  catch { return structuredClone(demoState); }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function uid(prefix){ return prefix + Math.random().toString(36).slice(2, 9); }
function toMin(t){ const [h,m]=t.split(':').map(Number); return h*60+m; }
function toTime(min){ return `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`; }
function activeGroup(){ return state.groups.find(g => g.id === state.activeGroupId) || state.groups[0]; }
function memberName(id){ return activeGroup().members.find(m => m.id === id)?.name || 'Sin integrante'; }
function memberColor(id){ return activeGroup().members.find(m => m.id === id)?.color || '#64748b'; }

function render(){
  document.documentElement.dataset.theme = state.theme;
  const g = activeGroup();
  if(!g) return;
  document.getElementById('currentGroupTitle').textContent = g.name;
  document.getElementById('themeBtn').textContent = state.theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
  renderGroups(g); renderMembers(g); renderTasks(g); renderCalendar(g); renderFree(g); renderStats(g); fillTaskForm(g);
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === state.mode));
  document.getElementById('modeLabel').textContent = state.mode === 'work' ? 'Modo Trabajo' : state.mode === 'leisure' ? 'Modo Ocio' : 'Todo el día';
}

function renderGroups(g){
  const el = document.getElementById('groupList');
  el.innerHTML = '';
  state.groups.forEach(group => {
    const div = document.createElement('button');
    div.className = 'group-item' + (group.id === g.id ? ' active' : '');
    div.innerHTML = `<span>${group.name}</span><small>${group.members.length} personas</small>`;
    div.onclick = () => { state.activeGroupId = group.id; save(); render(); };
    el.appendChild(div);
  });
}

function renderMembers(g){
  const el = document.getElementById('memberList'); el.innerHTML = '';
  g.members.forEach(m => {
    const div = document.createElement('div'); div.className = 'member-item';
    div.innerHTML = `<div style="display:flex;gap:10px;align-items:center"><span class="avatar" style="background:${m.color}">${m.name.slice(0,2).toUpperCase()}</span><strong>${m.name}</strong></div><button class="delete-btn" title="Eliminar">×</button>`;
    div.querySelector('button').onclick = () => { g.members = g.members.filter(x=>x.id!==m.id); g.tasks = g.tasks.filter(t=>t.memberId!==m.id); save(); render(); };
    el.appendChild(div);
  });
}

function renderTasks(g){
  const el = document.getElementById('taskList'); el.innerHTML = '';
  const sorted = [...g.tasks].sort((a,b)=> a.day-b.day || toMin(a.start)-toMin(b.start));
  if(!sorted.length){ el.innerHTML = '<div class="empty">Todavía no hay ocupaciones.</div>'; return; }
  sorted.forEach(t => {
    const div = document.createElement('div'); div.className='task-item';
    div.innerHTML = `<div><strong>${t.title}</strong><span>${DAYS[t.day]} · ${t.start}–${t.end} · ${memberName(t.memberId)}</span></div><button class="delete-btn">×</button>`;
    div.querySelector('button').onclick = () => { g.tasks = g.tasks.filter(x=>x.id!==t.id); save(); render(); };
    el.appendChild(div);
  });
}

function renderStats(g){
  const free = computeFreeWindows(g);
  document.getElementById('tasksCount').textContent = g.tasks.length;
  document.getElementById('membersCount').textContent = g.members.length;
  document.getElementById('freeCount').textContent = free.length;
}

function renderCalendar(g){
  const el = document.getElementById('calendar'); el.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'calendar-grid';
  grid.appendChild(cell('', 'head-cell'));
  DAYS.forEach(d => grid.appendChild(cell(d, 'head-cell')));
  HOURS.forEach(hour => {
    grid.appendChild(cell(`${String(hour).padStart(2,'0')}:00`, 'time-cell'));
    DAYS.forEach((_, day) => {
      const c = cell('', 'cell');
      const from = hour*60, to = (hour+1)*60;
      const tasks = g.tasks.filter(t => t.day === day && toMin(t.start) < to && toMin(t.end) > from);
      tasks.forEach(t => {
        const chip = document.createElement('div'); chip.className = 'event-chip'; chip.style.background = memberColor(t.memberId);
        chip.innerHTML = `<strong>${t.title}</strong><br>${t.start}-${t.end} · ${memberName(t.memberId)}`;
        c.appendChild(chip);
      });
      const frees = computeFreeWindows(g).filter(f => f.day === day && f.start < to && f.end > from && f.start >= from);
      frees.slice(0,1).forEach(f => { const chip=document.createElement('div'); chip.className='free-chip'; chip.textContent = `Libre ${toTime(f.start)}-${toTime(f.end)}`; c.appendChild(chip); });
      grid.appendChild(c);
    });
  });
  el.appendChild(grid);
}
function cell(text, cls){ const d=document.createElement('div'); d.className=cls; d.textContent=text; return d; }

function modeRange(day){
  if(state.mode === 'work') return day <= 4 ? [9*60, 18*60] : null;
  if(state.mode === 'leisure') return day <= 4 ? [18*60, 22*60] : [10*60, 22*60];
  return [7*60, 22*60];
}
function computeFreeWindows(g){
  const windows = [];
  for(let day=0; day<7; day++){
    const range = modeRange(day); if(!range) continue;
    let intervals = g.tasks.filter(t=>t.day===day).map(t=>[Math.max(toMin(t.start), range[0]), Math.min(toMin(t.end), range[1])]).filter(([s,e])=>e>s).sort((a,b)=>a[0]-b[0]);
    const merged=[];
    intervals.forEach(([s,e])=>{ const last=merged[merged.length-1]; if(!last || s>last[1]) merged.push([s,e]); else last[1]=Math.max(last[1],e); });
    let cursor = range[0];
    merged.forEach(([s,e])=>{ if(s-cursor >= 45) windows.push({day,start:cursor,end:s}); cursor=Math.max(cursor,e); });
    if(range[1]-cursor >= 45) windows.push({day,start:cursor,end:range[1]});
  }
  return windows.sort((a,b)=>a.day-b.day || a.start-b.start);
}
function renderFree(g){
  const el = document.getElementById('freeWindows'); el.innerHTML='';
  const free = computeFreeWindows(g);
  if(!free.length){ el.innerHTML='<div class="empty">No hay ventanas disponibles con este filtro.</div>'; return; }
  free.slice(0,10).forEach(f => {
    const div = document.createElement('div'); div.className='free-item';
    const dur = Math.round((f.end-f.start)/60*10)/10;
    div.innerHTML = `<div><strong>${DAYS[f.day]} · ${toTime(f.start)}–${toTime(f.end)}</strong><span>${dur} horas libres para todo el grupo</span></div><span class="pill">Disponible</span>`;
    el.appendChild(div);
  });
}
function fillTaskForm(g){
  const sel = document.getElementById('taskMember'); sel.innerHTML='';
  g.members.forEach(m => sel.add(new Option(m.name, m.id)));
  const day = document.getElementById('taskDay'); day.innerHTML='';
  DAYS.forEach((d,i)=> day.add(new Option(d, i)));
}

function openTextDialog(mode){
  textDialogMode = mode;
  document.getElementById('textDialogTitle').textContent = mode === 'group' ? 'Nuevo grupo' : 'Nuevo integrante';
  document.getElementById('textLabel').firstChild.textContent = mode === 'group' ? 'Nombre del grupo' : 'Nombre del integrante';
  document.getElementById('textInput').value = '';
  document.getElementById('textDialog').showModal();
  setTimeout(()=>document.getElementById('textInput').focus(),50);
}

document.getElementById('newGroupBtn').onclick = () => openTextDialog('group');
document.getElementById('newMemberBtn').onclick = () => openTextDialog('member');
document.getElementById('addTaskBtn').onclick = () => document.getElementById('taskDialog').showModal();
document.getElementById('closeTaskModal').onclick = () => document.getElementById('taskDialog').close();
document.getElementById('cancelTask').onclick = () => document.getElementById('taskDialog').close();
document.getElementById('closeTextModal').onclick = () => document.getElementById('textDialog').close();
document.getElementById('cancelText').onclick = () => document.getElementById('textDialog').close();
document.getElementById('themeBtn').onclick = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); render(); };
document.getElementById('resetBtn').onclick = () => { if(confirm('¿Reiniciar todos los datos de demo?')){ state = structuredClone(demoState); save(); render(); }};
document.querySelectorAll('.mode-btn').forEach(btn => btn.onclick = () => { state.mode = btn.dataset.mode; save(); render(); });

document.getElementById('textForm').onsubmit = (e) => {
  e.preventDefault(); const name = document.getElementById('textInput').value.trim(); if(!name) return;
  if(textDialogMode === 'group'){
    const id = uid('g'); state.groups.push({ id, name, members:[{id:uid('m'),name:'Yo',color:COLORS[0]}], tasks:[] }); state.activeGroupId = id;
  } else {
    const g = activeGroup(); g.members.push({ id:uid('m'), name, color: COLORS[g.members.length % COLORS.length] });
  }
  save(); document.getElementById('textDialog').close(); render();
};

document.getElementById('taskForm').onsubmit = (e) => {
  e.preventDefault(); const g = activeGroup();
  const start = document.getElementById('startTime').value, end = document.getElementById('endTime').value;
  if(toMin(end) <= toMin(start)){ alert('La hora de fin debe ser posterior a la hora de inicio.'); return; }
  g.tasks.push({ id:uid('t'), memberId:document.getElementById('taskMember').value, title:document.getElementById('taskTitle').value.trim(), day:Number(document.getElementById('taskDay').value), start, end });
  document.getElementById('taskTitle').value = ''; save(); document.getElementById('taskDialog').close(); render();
};

render();
