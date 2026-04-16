/* ═══════════════════════════════════════════════════════════════
   MUST Admin Dashboard — admin.js
   Full CRUD for Events, News, Menu, Slider, Contacts, Settings
   ═══════════════════════════════════════════════════════════════ */

const API = 'http://must.runasp.net';
const TOKEN_KEY = 'must_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function getEmail() { return localStorage.getItem('must_email') || 'Admin'; }
function clearToken() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem('must_email'); }

function authHeaders() {
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t } : {};
}

// ── INIT SECURE ACCESS ──────────────────────────────────────
(function checkAccess() {
  if (!getToken() || !getEmail().endsWith('@must.edu.eg')) {
    window.location.href = '../login.html'; // Redirect non-admins or unauthenticated
  }
})();

// ── UI Helpers ──────────────────────────────────────
function toast(msg, type) {
  var c = document.getElementById('toasts');
  var d = document.createElement('div');
  d.className = 'toast toast-' + (type || 'success');
  d.innerHTML = (type === 'error' ? '<i class="fa-solid fa-circle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>') + ' <span>' + msg + '</span>';
  c.appendChild(d);
  setTimeout(function() { d.style.opacity = '0'; setTimeout(()=>d.remove(), 300); }, 3500);
}

document.getElementById('adminNameDisplay').textContent = getEmail().split('@')[0];
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// ── Generic API helpers ──────────────────────────────────────
async function apiJSON(method, path, body) {
  var headers = Object.assign({ 'Content-Type': 'application/json' }, authHeaders());
  var opts = { method: method, headers: headers };
  if (body) opts.body = JSON.stringify(body);
  var res = await fetch(API + path, opts);
  if (method === 'DELETE' && res.ok) return true; // Sometimes deletes return no content
  var text = await res.text();
  var data = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
  if (!res.ok) {
    var msg = (data && (data.message || data.title || (typeof data === 'string' ? data : JSON.stringify(data)))) || res.statusText;
    throw new Error(msg);
  }
  return data;
}

async function apiForm(method, path, formData) {
  var headers = authHeaders();
  var res = await fetch(API + path, { method: method, headers: headers, body: formData });
  var text = await res.text();
  var data = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }
  if (!res.ok) {
    var msg = (data && (data.message || data.title || (typeof data === 'string' ? data : JSON.stringify(data)))) || res.statusText;
    throw new Error(msg);
  }
  return data;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function shortDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

// ═════════════════════════════════════════════════════════════
// AUTH NO-LOGIN-VIEW LOGIC (It is handled in login.html)
// ═════════════════════════════════════════════════════════════

document.getElementById('logoutBtn').addEventListener('click', function(e) {
  e.preventDefault();
  clearToken();
  window.location.href = '../login.html';
});

// ═════════════════════════════════════════════════════════════
// NAVIGATION
// ═════════════════════════════════════════════════════════════
document.querySelectorAll('.sidebar-nav a').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.sidebar-nav a').forEach(function(a) { a.classList.remove('active'); });
    link.classList.add('active');
    var s = link.getAttribute('data-section');
    document.querySelectorAll('.section').forEach(function(sec) { sec.classList.remove('active'); });
    document.getElementById('sec-' + s).classList.add('active');
    
    // Load section data
    if (s === 'dashboard') loadDashboard();
    else if (s === 'events') loadEvents();
    else if (s === 'news') loadNews();
    else if (s === 'menu') loadMenu();
    else if (s === 'contact') loadContacts();
    else if (s === 'slider') loadSlider();
    else if (s === 'settings') loadSettings();
  });
});

// ═════════════════════════════════════════════════════════════
// DASHBOARD
// ═════════════════════════════════════════════════════════════
async function loadDashboard() {
  try { var d = await apiJSON('GET','/api/Events'); document.getElementById('statEvents').textContent = Array.isArray(d)?d.length:0; } catch(e) { document.getElementById('statEvents').textContent = '?'; }
  try { var d = await apiJSON('GET','/api/News'); document.getElementById('statNews').textContent = Array.isArray(d)?d.length:0; } catch(e) { document.getElementById('statNews').textContent = '?'; }
  try { var d = await apiJSON('GET','/api/Contact'); document.getElementById('statContact').textContent = Array.isArray(d)?d.length:0; } catch(e) { document.getElementById('statContact').textContent = '?'; }
  try { var d = await apiJSON('GET','/api/Slider'); document.getElementById('statSlider').textContent = Array.isArray(d)?d.length:0; } catch(e) { document.getElementById('statSlider').textContent = '?'; }
}

// ═════════════════════════════════════════════════════════════
// EVENTS CRUD
// ═════════════════════════════════════════════════════════════
var _events = [];

async function loadEvents() {
  try {
    _events = await apiJSON('GET', '/api/Events') || [];
    var tb = document.getElementById('eventsTable');
    if (!_events.length) { tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><p>No events found</p></div></td></tr>'; return; }
    tb.innerHTML = _events.map(function(ev) {
      return '<tr>' +
        '<td>' + ev.id + '</td>' +
        '<td><strong>' + esc(ev.title) + '</strong></td>' +
        '<td>' + esc((ev.description||'').substring(0,80)) + (ev.description && ev.description.length > 80 ? '…' : '') + '</td>' +
        '<td>' + shortDate(ev.eventDate) + '</td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editEvent('+ev.id+')"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteEvent('+ev.id+')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load events: ' + e.message, 'error'); }
}

function openEventModal(ev) {
  document.getElementById('eventModalTitle').textContent = ev ? 'Edit Event' : 'Add Event';
  document.getElementById('eventId').value = ev ? ev.id : '';
  document.getElementById('eventTitleInput').value = ev ? ev.title : '';
  document.getElementById('eventDescInput').value = ev ? ev.description || '' : '';
  document.getElementById('eventDateInput').value = ev && ev.eventDate ? ev.eventDate.substring(0,16) : '';
  document.getElementById('eventModalOverlay').classList.add('show');
}

window.editEvent = function(id) {
  var ev = _events.find(function(e){return e.id===id;});
  if (ev) openEventModal(ev);
}

window.deleteEvent = async function(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  try { await apiJSON('DELETE', '/api/Events/' + id); toast('Event deleted'); loadEvents(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
}

document.getElementById('eventForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id   = document.getElementById('eventId').value;
  var body = {
    title:       document.getElementById('eventTitleInput').value.trim(),
    description: document.getElementById('eventDescInput').value.trim(),
    eventDate:   document.getElementById('eventDateInput').value
  };
  try {
    if (id) await apiJSON('PUT', '/api/Events/' + id, body);
    else    await apiJSON('POST', '/api/Events', body);
    toast(id ? 'Event updated successfully' : 'Event created successfully');
    closeModal('eventModalOverlay');
    loadEvents();
    loadDashboard();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// NEWS CRUD
// ═════════════════════════════════════════════════════════════
var _news = [];

async function loadNews() {
  try {
    _news = await apiJSON('GET', '/api/News') || [];
    var tb = document.getElementById('newsTable');
    if (!_news.length) { tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-newspaper"></i><p>No news found</p></div></td></tr>'; return; }
    tb.innerHTML = _news.map(function(n) {
      var imgSrc = n.imageUrl ? (n.imageUrl.startsWith('http') ? n.imageUrl : API + n.imageUrl) : '';
      return '<tr>' +
        '<td>' + n.id + '</td>' +
        '<td>' + (imgSrc ? '<img src="'+esc(imgSrc)+'" onerror="this.style.display=\'none\'">' : '—') + '</td>' +
        '<td><strong>' + esc(n.title) + '</strong></td>' +
        '<td>' + esc((n.content||'').substring(0,80)) + (n.content && n.content.length > 80 ? '…' : '') + '</td>' +
        '<td>' + shortDate(n.createdAt) + '</td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editNews('+n.id+')"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteNews('+n.id+')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load news: ' + e.message, 'error'); }
}

function openNewsModal(n) {
  document.getElementById('newsModalTitle').textContent = n ? 'Edit News' : 'Add News';
  document.getElementById('newsId').value = n ? n.id : '';
  document.getElementById('newsExistingImg').value = n ? n.imageUrl || '' : '';
  document.getElementById('newsTitleInput').value = n ? n.title : '';
  document.getElementById('newsContentInput').value = n ? n.content || '' : '';
  document.getElementById('newsFileInput').value = '';
  document.getElementById('newsFileInput').required = !n; // Require file only on add
  document.getElementById('newsModalOverlay').classList.add('show');
}

window.editNews = function(id) {
  var n = _news.find(function(x){return x.id===id;});
  if (n) openNewsModal(n);
}

window.deleteNews = async function(id) {
  if (!confirm('Are you sure you want to delete this news article?')) return;
  try { await apiJSON('DELETE', '/api/News/' + id); toast('News article deleted'); loadNews(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
}

document.getElementById('newsForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id = document.getElementById('newsId').value;
  var fd = new FormData();
  fd.append('Title', document.getElementById('newsTitleInput').value.trim());
  fd.append('Content', document.getElementById('newsContentInput').value.trim());
  var file = document.getElementById('newsFileInput').files[0];
  if (file) fd.append('File', file);
  if (id) {
    var existImg = document.getElementById('newsExistingImg').value;
    if (existImg) fd.append('ExistingImageUrl', existImg);
  }
  try {
    if (id) await apiForm('PUT', '/api/News/' + id, fd);
    else    await apiForm('POST', '/api/News', fd);
    toast(id ? 'News updated successfully' : 'News created successfully');
    closeModal('newsModalOverlay');
    loadNews();
    loadDashboard();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// MENU CRUD
// ═════════════════════════════════════════════════════════════
var _menu = [];

async function loadMenu() {
  try {
    _menu = await apiJSON('GET', '/api/Menu') || [];
    var tb = document.getElementById('menuTable');
    if (!_menu.length) { tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-bars"></i><p>No menu items found</p></div></td></tr>'; return; }
    tb.innerHTML = _menu.map(function(m) {
      return '<tr>' +
        '<td>' + m.id + '</td>' +
        '<td><strong>' + esc(m.name) + '</strong></td>' +
        '<td>' + esc(m.url || '—') + '</td>' +
        '<td>' + (m.order || 0) + '</td>' +
        '<td>' + (m.parentId || '—') + '</td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editMenu('+m.id+')"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteMenu('+m.id+')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load menu: ' + e.message, 'error'); }
}

function openMenuModal(m) {
  document.getElementById('menuModalTitle').textContent = m ? 'Edit Menu Item' : 'Add Menu Item';
  document.getElementById('menuId').value = m ? m.id : '';
  document.getElementById('menuNameInput').value = m ? m.name : '';
  document.getElementById('menuUrlInput').value = m ? m.url || '' : '';
  document.getElementById('menuOrderInput').value = m ? m.order || 0 : 0;
  document.getElementById('menuParentInput').value = m ? m.parentId || '' : '';
  document.getElementById('menuModalOverlay').classList.add('show');
}

window.editMenu = function(id) {
  var m = _menu.find(function(x){return x.id===id;});
  if (m) openMenuModal(m);
}

window.deleteMenu = async function(id) {
  if (!confirm('Are you sure you want to delete this menu item?')) return;
  try { await apiJSON('DELETE', '/api/Menu/' + id); toast('Menu item deleted'); loadMenu(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
}

document.getElementById('menuForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id   = document.getElementById('menuId').value;
  var body = {
    name:     document.getElementById('menuNameInput').value.trim(),
    url:      document.getElementById('menuUrlInput').value.trim(),
    order:    parseInt(document.getElementById('menuOrderInput').value) || 0,
    parentId: parseInt(document.getElementById('menuParentInput').value) || null
  };
  try {
    if (id) await apiJSON('PUT', '/api/Menu/' + id, body);
    else    await apiJSON('POST', '/api/Menu', body);
    toast(id ? 'Menu item updated' : 'Menu item created');
    closeModal('menuModalOverlay');
    loadMenu();
    loadDashboard();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// CONTACTS MANAGEMENT
// ═════════════════════════════════════════════════════════════
async function loadContacts() {
  try {
    var _contacts = await apiJSON('GET', '/api/Contact') || [];
    var tb = document.getElementById('contactTable');
    if (!_contacts.length) { tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-envelope-open-text"></i><p>No messages found</p></div></td></tr>'; return; }
    tb.innerHTML = _contacts.map(function(c) {
      return '<tr>' +
        '<td>' + c.id + '</td>' +
        '<td><strong>' + esc(c.name) + '</strong></td>' +
        '<td><a href="mailto:'+esc(c.email)+'">'+esc(c.email)+'</a></td>' +
        '<td>' + esc(c.message) + '</td>' +
        '<td><button class="btn btn-sm btn-delete" onclick="deleteContact('+c.id+')"><i class="fa-solid fa-trash"></i></button></td>' +
      '</tr>';
    }).join('');
  } catch(e) { toast('Failed to load contacts: ' + e.message, 'error'); }
}

window.deleteContact = async function(id) {
  if (!confirm('Delete this contact message?')) return;
  try { await apiJSON('DELETE', '/api/Contact/' + id); toast('Contact message deleted'); loadContacts(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
}

// ═════════════════════════════════════════════════════════════
// SLIDER CRUD
// ═════════════════════════════════════════════════════════════
var _slider = [];

async function loadSlider() {
  try {
    _slider = await apiJSON('GET', '/api/Slider') || [];
    var tb = document.getElementById('sliderTable');
    if (!_slider.length) { tb.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-images"></i><p>No slides found</p></div></td></tr>'; return; }
    tb.innerHTML = _slider.map(function(s) {
      var imgSrc = s.imageUrl ? (s.imageUrl.startsWith('http') ? s.imageUrl : API + s.imageUrl) : '';
      return '<tr>' +
        '<td>' + s.id + '</td>' +
        '<td>' + (imgSrc ? '<img src="'+esc(imgSrc)+'" onerror="this.style.display=\'none\'">' : '—') + '</td>' +
        '<td><strong>' + esc(s.title) + '</strong></td>' +
        '<td>' + esc(s.subTitle || '—') + '</td>' +
        '<td>' + (s.order || 0) + '</td>' +
        '<td><span class="badge ' + (s.isActive ? 'badge-green' : 'badge-red') + '">' + (s.isActive ? 'Active' : 'Inactive') + '</span></td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-toggle" onclick="toggleSlider('+s.id+')" title="Toggle Status"><i class="fa-solid fa-power-off"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteSlider('+s.id+')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load slider: ' + e.message, 'error'); }
}

function openSliderModal() {
  document.getElementById('sliderModalTitle').textContent = 'Add Slide';
  document.getElementById('sliderTitleInput').value = '';
  document.getElementById('sliderSubInput').value = '';
  document.getElementById('sliderOrderInput').value = 0;
  document.getElementById('sliderFileInput').value = '';
  document.getElementById('sliderModalOverlay').classList.add('show');
}

window.toggleSlider = async function(id) {
  try {
    await fetch(API + '/api/Slider/' + id + '/toggle', { method: 'PATCH', headers: authHeaders() });
    toast('Slide status toggled');
    loadSlider();
  } catch(e) { toast('Toggle failed: ' + e.message, 'error'); }
}

window.deleteSlider = async function(id) {
  if (!confirm('Are you sure you want to delete this slide?')) return;
  try { await apiJSON('DELETE', '/api/Slider/' + id); toast('Slide deleted'); loadSlider(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
}

document.getElementById('sliderForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var fd = new FormData();
  fd.append('Title', document.getElementById('sliderTitleInput').value.trim());
  fd.append('SubTitle', document.getElementById('sliderSubInput').value.trim());
  fd.append('Order', parseInt(document.getElementById('sliderOrderInput').value) || 0);
  var file = document.getElementById('sliderFileInput').files[0];
  if (file) fd.append('File', file);
  try {
    await apiForm('POST', '/api/Slider', fd);
    toast('Slide created successfully');
    closeModal('sliderModalOverlay');
    loadSlider();
    loadDashboard();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// SETTINGS MANAGEMENT
// ═════════════════════════════════════════════════════════════
async function loadSettings() {
  try {
    var sets = await apiJSON('GET', '/api/Settings');
    if (sets) {
       document.getElementById('setUnivEmail').value = sets.universityEmail || '';
       document.getElementById('setPhone').value = sets.phoneNumber || '';
       document.getElementById('setFb').value = sets.facebookLink || '';
       document.getElementById('setAddress').value = sets.address || '';
       document.getElementById('setMap').value = sets.mapLocationUrl || '';
    }
  } catch(e) { toast('Failed to load settings: ' + e.message, 'error'); }
}

window.saveSettings = async function() {
    var body = {
        universityEmail: document.getElementById('setUnivEmail').value.trim(),
        phoneNumber: document.getElementById('setPhone').value.trim(),
        facebookLink: document.getElementById('setFb').value.trim(),
        address: document.getElementById('setAddress').value.trim(),
        mapLocationUrl: document.getElementById('setMap').value.trim()
    };
    try {
        await apiJSON('PUT', '/api/Settings', body);
        toast('Settings saved successfully');
    } catch(e) {
        toast('Failed to save settings: ' + e.message, 'error');
    }
}

// ═════════════════════════════════════════════════════════════
// INITIAL LOAD
// ═════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});
