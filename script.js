/* Stellar Todo — vanilla JS front-end (static)
   Features: add/edit/delete tasks, subtasks, tags, priority, due date, localStorage persistence,
   search, filters, sort, export/import JSON, simple drag to reorder, dark mode, AI integration hooks.
*/

const STORAGE_KEY = 'stellar-todo-v1';

function uid(prefix='id') { return prefix + '-' + Math.random().toString(36).slice(2,9); }

let state = {
  tasks: [],
  useProxy: true
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  state.tasks = raw ? JSON.parse(raw) : [];
  state.tasks.sort((a,b)=> (a.order||0)-(b.order||0));
}

function formatDate(iso) {
  if(!iso) return '';
  try{ return new Date(iso).toLocaleDateString(); }catch(e){return iso;}
}

function render() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  const q = document.getElementById('search').value.toLowerCase();
  const priorityFilter = document.getElementById('filterPriority').value;
  const sortBy = document.getElementById('sortBy').value;

  let tasks = state.tasks.slice();

  if(q) tasks = tasks.filter(t => (t.title + ' ' + (t.description||'') + ' ' + (t.tags||[]).join(' ')).toLowerCase().includes(q));

  if(priorityFilter !== 'all') tasks = tasks.filter(t=>t.priority===priorityFilter);

  if(sortBy === 'dueDate') tasks.sort((a,b)=> (a.dueDate||'').localeCompare(b.dueDate||''));
  else if(sortBy === 'priority') tasks.sort((a,b)=> priorityScore(b.priority)-priorityScore(a.priority));
  else tasks.sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));

  for(const t of tasks) {
    const li = document.createElement('li');
    li.className = 'p-3 border rounded bg-gray-50 dark:bg-gray-900 flex items-start justify-between';
    li.draggable = true;
    li.dataset.id = t.id;

    const left = document.createElement('div');
    left.className = 'flex-1';

    const titleRow = document.createElement('div');
    titleRow.className = 'flex items-center gap-3';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!t.completed;
    cb.addEventListener('change', ()=>{ t.completed = cb.checked; save(); render(); });
    titleRow.appendChild(cb);

    const title = document.createElement('div');
    title.innerHTML = '<strong>' + escapeHtml(t.title) + '</strong>' + (t.dueDate ? (' <span class="text-xs text-gray-500">due ' + escapeHtml(formatDate(t.dueDate)) + '</span>') : '');
    titleRow.appendChild(title);
    left.appendChild(titleRow);

    if(t.description) {
      const p = document.createElement('p');
      p.className = 'text-sm text-gray-600 dark:text-gray-300 mt-2';
      p.textContent = t.description;
      left.appendChild(p);
    }

    if(t.subtasks && t.subtasks.length) {
      const sub = document.createElement('ul');
      sub.className = 'mt-2 text-sm space-y-1';
      for(const s of t.subtasks) {
        const sli = document.createElement('li');
        sli.innerHTML = (s.done ? '✓ ' : '◻︎ ') + escapeHtml(s.text);
        sub.appendChild(sli);
      }
      left.appendChild(sub);
    }

    const meta = document.createElement('div');
    meta.className = 'mt-2 text-xs text-gray-500';
    meta.textContent = 'Priority: ' + t.priority + (t.tags && t.tags.length ? ' • Tags: '+t.tags.join(', ') : '');
    left.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'flex flex-col gap-2 items-end';

    const btns = document.createElement('div');
    btns.className = 'flex gap-2';
    const edit = document.createElement('button');
    edit.className = 'px-2 py-1 border rounded';
    edit.textContent = 'Edit';
    edit.onclick = ()=> editTask(t.id);
    btns.appendChild(edit);

    const del = document.createElement('button');
    del.className = 'px-2 py-1 border rounded text-red-600';
    del.textContent = 'Delete';
    del.onclick = ()=>{ if(confirm('Delete this task?')){ state.tasks = state.tasks.filter(x=>x.id!==t.id); save(); render(); } };
    btns.appendChild(del);

    right.appendChild(btns);

    li.appendChild(left);
    li.appendChild(right);

    addDragHandlers(li);
    list.appendChild(li);
  }
}

function priorityScore(p) {
  return p==='high'?3:(p==='medium'?2:1);
}

function escapeHtml(s='') {
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

/* Drag & drop simple reordering */
let dragSrc = null;
function addDragHandlers(li) {
  li.addEventListener('dragstart', e => {
    dragSrc = li;
    li.classList.add('opacity-50');
  });
  li.addEventListener('dragend', e=>{
    li.classList.remove('opacity-50');
    dragSrc = null;
    // recompute order
    const nodes = Array.from(document.querySelectorAll('#taskList > li'));
    nodes.forEach((n, idx)=>{
      const id = n.dataset.id;
      const t = state.tasks.find(x=>x.id===id);
      if(t) t.order = idx;
    });
    save();
    render();
  });
  li.addEventListener('dragover', e=> e.preventDefault());
  li.addEventListener('drop', e=>{
    e.preventDefault();
    if(!dragSrc) return;
    if(dragSrc === li) return;
    const list = li.parentNode;
    list.insertBefore(dragSrc, li.nextSibling);
  });
}

/* Form handlers */
document.getElementById('taskForm').addEventListener('submit', e=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  if(!title) return alert('Add a title');
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('dueDate').value || null;
  const priority = document.getElementById('priority').value;
  const tags = document.getElementById('tags').value.split(',').map(s=>s.trim()).filter(Boolean);
  const task = {
    id: uid('task'), title, description, dueDate, priority, tags,
    subtasks: [], completed: false, createdAt: new Date().toISOString(),
    order: state.tasks.length
  };
  state.tasks.push(task);
  save();
  render();
  document.getElementById('taskForm').reset();
});

document.getElementById('clearForm').addEventListener('click', ()=>document.getElementById('taskForm').reset());
document.getElementById('search').addEventListener('input', render);
document.getElementById('filterPriority').addEventListener('change', render);
document.getElementById('sortBy').addEventListener('change', render);

document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(state.tasks, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stellar-tasks.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{
    try{
      const imported = JSON.parse(ev.target.result);
      if(Array.isArray(imported)){
        state.tasks = imported;
        save();
        render();
        alert('Imported '+imported.length+' tasks');
      } else alert('Imported file must be a JSON array of tasks.');
    }catch(err){ alert('Invalid JSON'); }
  }
  reader.readAsText(f);
});

/* Edit task */
function editTask(id) {
  const t = state.tasks.find(x=>x.id===id);
  if(!t) return;
  const newTitle = prompt('Edit title', t.title);
  if(newTitle===null) return;
  t.title = newTitle;
  const newDesc = prompt('Edit description', t.description||'');
  if(newDesc!==null) t.description = newDesc;
  save();
  render();
}

/* AI Assistant: uses either a serverless proxy (/api/ai) or direct key (unsafe) */
async function callAI(prompt, openaiKey=null) {
  const useProxy = state.useProxy;
  if(useProxy) {
    try{
      const res = await fetch('/api/ai', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt, tasks: state.tasks})});
      if(!res.ok) throw new Error('Proxy error: '+res.status);
      const data = await res.json();
      // Try to find assistant content
      const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);
      return text;
    }catch(err){ return 'AI proxy error: '+err.message; }
  } else {
    if(!openaiKey) return 'No API key provided for direct call.';
    try{
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+openaiKey},
        body: JSON.stringify({model:'gpt-4o-mini', messages:[{role:'user', content: prompt}], max_tokens: 300})
      });
      const json = await r.json();
      const text = json?.choices?.[0]?.message?.content || json?.choices?.[0]?.text || JSON.stringify(json);
      return text;
    }catch(e){ return 'Direct AI error: '+e.message; }
  }
}

document.getElementById('aiGenerate').addEventListener('click', async ()=>{
  const key = document.getElementById('openaiKey').value.trim() || null;
  const prompt = document.getElementById('aiPrompt').value.trim();
  if(!prompt) return alert('Add a prompt for the AI');
  document.getElementById('aiGenerate').textContent = 'Thinking...';
  const res = await callAI(prompt, key);
  document.getElementById('aiGenerate').textContent = 'Generate subtasks';
  try{
    // Expecting AI returns a bullet list or JSON list; we try to be polite and robust.
    const lines = res.split(/\n|\r/).map(s=>s.replace(/^[-*\d\.\)\s]+/,'').trim()).filter(Boolean);
    const subtasks = lines.slice(0,10).map(s=>({id: uid('sub'), text: s, done: false}));
    // Add subtasks to the last created task (or create a new task)
    let target = state.tasks[state.tasks.length-1];
    if(!target) {
      target = {id: uid('task'), title: 'AI generated task', description:'From AI', subtasks: [], priority:'medium', createdAt:new Date().toISOString(), order: state.tasks.length, tags:[]};
      state.tasks.push(target);
    }
    target.subtasks = target.subtasks.concat(subtasks);
    save();
    render();
    alert('AI returned ' + subtasks.length + ' subtask(s).');
  }catch(e){ alert('Could not parse AI reply. Raw:\n' + res); }
});

/* Proxy toggle (for clarity) */
document.getElementById('aiUsingProxy').addEventListener('click', ()=>{
  state.useProxy = !state.useProxy;
  document.getElementById('aiUsingProxy').textContent = state.useProxy ? 'Using serverless proxy' : 'Using direct key (unsafe)';
});

/* Theme toggle */
document.getElementById('themeToggle').addEventListener('click', ()=>{
  document.documentElement.classList.toggle('dark');
});

/* Keyboard shortcuts: n = new task focus, / = focus search, t = toggle theme */
document.addEventListener('keydown', (e)=>{
  if(e.key==='n'){ document.getElementById('title').focus(); e.preventDefault(); }
  if(e.key==='/'){ document.getElementById('search').focus(); e.preventDefault(); }
  if(e.key==='t'){ document.documentElement.classList.toggle('dark'); }
});

/* Init */
load();
render();
