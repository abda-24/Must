/* ═══════════════════════════════════════════════════════════════
   MUST Admin Dashboard — admin.js
   Full CRUD for Events, News, Menu, Slider, Contacts, Settings
   ═══════════════════════════════════════════════════════════════ */

const API = 'https://must.runasp.net';
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
    else if (s === 'activities') loadActivities();
    else if (s === 'categories') loadCategories();
    else if (s === 'clubs') loadClubs();
    else if (s === 'competitions') loadCompetitions();
    else if (s === 'adminusers') loadAdminUsers();
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
  try { var d = await apiJSON('GET','/api/Activities'); document.getElementById('statActivities').textContent = Array.isArray(d)?d.length:0; } catch(e) { document.getElementById('statActivities').textContent = '?'; }
  try { var d = await apiJSON('GET','/api/Clubs'); document.getElementById('statClubs').textContent = Array.isArray(d)?d.length:0; } catch(e) { document.getElementById('statClubs').textContent = '?'; }
  try { var d = await apiJSON('GET','/api/Competitions'); document.getElementById('statCompetitions').textContent = Array.isArray(d)?d.length:0; } catch(e) { document.getElementById('statCompetitions').textContent = '?'; }
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
    
    // Auto-refresh live data correctly
    setInterval(loadEvents, 5000);
    setInterval(loadNews, 5000);
    setInterval(loadActivities, 5000);
    setInterval(loadClubs, 5000);
    setInterval(loadCompetitions, 5000);
});

// ═════════════════════════════════════════════════════════════
// ACTIVITY CATEGORIES CRUD
// ═════════════════════════════════════════════════════════════
var _categories = [];

async function loadCategories() {
  try {
    _categories = await apiJSON('GET', '/api/ActivityCategories') || [];
    var tb = document.getElementById('categoriesTable');
    if (!_categories.length) { tb.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-tags"></i><p>No categories found</p></div></td></tr>'; return; }
    tb.innerHTML = _categories.map(function(c) {
      return '<tr>' +
        '<td>' + c.id + '</td>' +
        '<td><strong>' + esc(c.name) + '</strong></td>' +
        '<td>' + (c.icon ? '<i class="fa-solid ' + esc(c.icon) + '"></i> ' + esc(c.icon) : '—') + '</td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editCategory(' + c.id + ')"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteCategory(' + c.id + ')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load categories: ' + e.message, 'error'); }
}

function openCategoryModal(cat) {
  document.getElementById('categoryModalTitle').textContent = cat ? 'Edit Category' : 'Add Category';
  document.getElementById('categoryId').value = cat ? cat.id : '';
  document.getElementById('categoryNameInput').value = cat ? cat.name : '';
  document.getElementById('categoryIconInput').value = cat ? cat.icon || '' : '';
  document.getElementById('categoryModalOverlay').classList.add('show');
}

window.editCategory = function(id) {
  var cat = _categories.find(function(c) { return c.id === id; });
  if (cat) openCategoryModal(cat);
};

window.deleteCategory = async function(id) {
  if (!confirm('Delete this category?')) return;
  try { await apiJSON('DELETE', '/api/ActivityCategories/' + id); toast('Category deleted'); loadCategories(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
};

document.getElementById('categoryForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id   = document.getElementById('categoryId').value;
  var body = {
    name: document.getElementById('categoryNameInput').value.trim(),
    icon: document.getElementById('categoryIconInput').value.trim() || null
  };
  try {
    if (id) await apiJSON('PUT', '/api/ActivityCategories/' + id, body);
    else    await apiJSON('POST', '/api/ActivityCategories', body);
    toast(id ? 'Category updated' : 'Category created');
    closeModal('categoryModalOverlay');
    loadCategories();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// ACTIVITIES CRUD
// ═════════════════════════════════════════════════════════════
var _activities = [];

async function loadActivities() {
  // Also refresh categories for the modal dropdown
  if (!_categories.length) {
    try { _categories = await apiJSON('GET', '/api/ActivityCategories') || []; } catch(e) {}
  }
  try {
    _activities = await apiJSON('GET', '/api/Activities') || [];
    var tb = document.getElementById('activitiesTable');
    if (!_activities.length) { tb.innerHTML = '<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-person-running"></i><p>No activities found</p></div></td></tr>'; return; }
    tb.innerHTML = _activities.map(function(a) {
      var imgSrc = a.imageUrl ? (a.imageUrl.startsWith('http') ? a.imageUrl : API + a.imageUrl) : '';
      var catName = '';
      if (a.activityCategoryId) {
        var cat = _categories.find(function(c) { return c.id === a.activityCategoryId; });
        catName = cat ? esc(cat.name) : a.activityCategoryId;
      }
      return '<tr>' +
        '<td>' + a.id + '</td>' +
        '<td>' + (imgSrc ? '<img src="' + esc(imgSrc) + '" onerror="this.style.display=\'none\'">' : '—') + '</td>' +
        '<td><strong>' + esc(a.title) + '</strong></td>' +
        '<td>' + esc((a.description || '').substring(0, 60)) + (a.description && a.description.length > 60 ? '…' : '') + '</td>' +
        '<td>' + esc(a.duration || '—') + '</td>' +
        '<td>' + esc(a.numberOfPlayers || '—') + '</td>' +
        '<td>' + (catName || '—') + '</td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editActivity(' + a.id + ')"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteActivity(' + a.id + ')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load activities: ' + e.message, 'error'); }
}

function openActivityModal(act) {
  document.getElementById('activityModalTitle').textContent = act ? 'Edit Activity' : 'Add Activity';
  document.getElementById('activityId').value = act ? act.id : '';
  document.getElementById('activityTitleInput').value = act ? act.title : '';
  document.getElementById('activityDescInput').value = act ? act.description || '' : '';
  document.getElementById('activityDurationInput').value = act ? act.duration || '' : '';
  document.getElementById('activityPlayersInput').value = act ? act.numberOfPlayers || '' : '';
  // Populate category dropdown
  var sel = document.getElementById('activityCategoryInput');
  sel.innerHTML = '<option value="">-- Select Category --</option>' +
    _categories.map(function(c) {
      var selected = act && act.activityCategoryId === c.id ? ' selected' : '';
      return '<option value="' + c.id + '"' + selected + '>' + esc(c.name) + '</option>';
    }).join('');
  document.getElementById('activityFileInput').value = '';
  document.getElementById('activityModalOverlay').classList.add('show');
}

window.editActivity = async function(id) {
  if (!_categories.length) {
    try { _categories = await apiJSON('GET', '/api/ActivityCategories') || []; } catch(e) {}
  }
  var act = _activities.find(function(a) { return a.id === id; });
  if (act) openActivityModal(act);
};

window.deleteActivity = async function(id) {
  if (!confirm('Delete this activity?')) return;
  try { await apiJSON('DELETE', '/api/Activities/' + id); toast('Activity deleted'); loadActivities(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
};

document.getElementById('activityForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id  = document.getElementById('activityId').value;
  var fd  = new FormData();
  fd.append('Title', document.getElementById('activityTitleInput').value.trim());
  fd.append('Description', document.getElementById('activityDescInput').value.trim());
  var dur = document.getElementById('activityDurationInput').value.trim();
  if (dur) fd.append('Duration', dur);
  var players = document.getElementById('activityPlayersInput').value.trim();
  if (players) fd.append('PlayersCount', players);
  var catId = document.getElementById('activityCategoryInput').value;
  if (catId) fd.append('CategoryId', parseInt(catId));
  var file = document.getElementById('activityFileInput').files[0];
  if (file) fd.append('Image', file);
  try {
    if (id) await apiForm('PUT', '/api/Activities/' + id, fd);
    else    await apiForm('POST', '/api/Activities', fd);
    toast(id ? 'Activity updated' : 'Activity created');
    closeModal('activityModalOverlay');
    loadActivities();
    loadDashboard();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// CLUBS CRUD
// ═════════════════════════════════════════════════════════════
var _clubs = [];

async function loadClubs() {
  try {
    _clubs = await apiJSON('GET', '/api/Clubs') || [];
    var tb = document.getElementById('clubsTable');
    if (!_clubs.length) { tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-shield-halved"></i><p>No clubs found</p></div></td></tr>'; return; }
    tb.innerHTML = _clubs.map(function(cl) {
      var imgSrc = cl.imageUrl ? (cl.imageUrl.startsWith('http') ? cl.imageUrl : API + cl.imageUrl) : '';
      return '<tr>' +
        '<td>' + cl.id + '</td>' +
        '<td>' + (imgSrc ? '<img src="' + esc(imgSrc) + '" onerror="this.style.display=\'none\'">' : '—') + '</td>' +
        '<td><strong>' + esc(cl.name) + '</strong></td>' +
        '<td>' + esc((cl.description || '').substring(0, 80)) + (cl.description && cl.description.length > 80 ? '…' : '') + '</td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editClub(' + cl.id + ')"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteClub(' + cl.id + ')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load clubs: ' + e.message, 'error'); }
}

function openClubModal(cl) {
  document.getElementById('clubModalTitle').textContent = cl ? 'Edit Club' : 'Add Club';
  document.getElementById('clubId').value = cl ? cl.id : '';
  document.getElementById('clubNameInput').value = cl ? cl.name : '';
  document.getElementById('clubDescInput').value = cl ? cl.description || '' : '';
  document.getElementById('clubFileInput').value = '';
  document.getElementById('clubModalOverlay').classList.add('show');
}

window.editClub = function(id) {
  var cl = _clubs.find(function(c) { return c.id === id; });
  if (cl) openClubModal(cl);
};

window.deleteClub = async function(id) {
  if (!confirm('Delete this club?')) return;
  try { await apiJSON('DELETE', '/api/Clubs/' + id); toast('Club deleted'); loadClubs(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
};

document.getElementById('clubForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id = document.getElementById('clubId').value;
  var fd = new FormData();
  fd.append('Name', document.getElementById('clubNameInput').value.trim());
  fd.append('Description', document.getElementById('clubDescInput').value.trim());
  var file = document.getElementById('clubFileInput').files[0];
  if (file) fd.append('File', file);
  try {
    if (id) await apiForm('PUT', '/api/Clubs/' + id, fd);
    else    await apiForm('POST', '/api/Clubs', fd);
    toast(id ? 'Club updated' : 'Club created');
    closeModal('clubModalOverlay');
    loadClubs();
    loadDashboard();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// COMPETITIONS CRUD
// ═════════════════════════════════════════════════════════════
var _competitions = [];

async function loadCompetitions() {
  try {
    _competitions = await apiJSON('GET', '/api/Competitions') || [];
    var tb = document.getElementById('competitionsTable');
    if (!_competitions.length) { tb.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-trophy"></i><p>No competitions found</p></div></td></tr>'; return; }
    tb.innerHTML = _competitions.map(function(comp) {
      var imgSrc = comp.imageUrl ? (comp.imageUrl.startsWith('http') ? comp.imageUrl : API + comp.imageUrl) : '';
      return '<tr>' +
        '<td>' + comp.id + '</td>' +
        '<td>' + (imgSrc ? '<img src="' + esc(imgSrc) + '" onerror="this.style.display=\'none\'">' : '—') + '</td>' +
        '<td><strong>' + esc(comp.title) + '</strong></td>' +
        '<td>' + esc((comp.description || '').substring(0, 60)) + (comp.description && comp.description.length > 60 ? '…' : '') + '</td>' +
        '<td>' + shortDate(comp.startDate) + '</td>' +
        '<td>' + shortDate(comp.endDate) + '</td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editCompetition(' + comp.id + ')"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="btn btn-sm btn-delete" onclick="deleteCompetition(' + comp.id + ')"><i class="fa-solid fa-trash"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load competitions: ' + e.message, 'error'); }
}

function openCompetitionModal(comp) {
  document.getElementById('competitionModalTitle').textContent = comp ? 'Edit Competition' : 'Add Competition';
  document.getElementById('competitionId').value = comp ? comp.id : '';
  document.getElementById('competitionTitleInput').value = comp ? comp.title : '';
  document.getElementById('competitionDescInput').value = comp ? comp.description || '' : '';
  document.getElementById('competitionStartInput').value = comp && comp.startDate ? comp.startDate.substring(0, 16) : '';
  document.getElementById('competitionEndInput').value = comp && comp.endDate ? comp.endDate.substring(0, 16) : '';
  document.getElementById('competitionFileInput').value = '';
  document.getElementById('competitionModalOverlay').classList.add('show');
}

window.editCompetition = function(id) {
  var comp = _competitions.find(function(c) { return c.id === id; });
  if (comp) openCompetitionModal(comp);
};

window.deleteCompetition = async function(id) {
  if (!confirm('Delete this competition?')) return;
  try { await apiJSON('DELETE', '/api/Competitions/' + id); toast('Competition deleted'); loadCompetitions(); loadDashboard(); }
  catch(e) { toast('Delete failed: ' + e.message, 'error'); }
};

document.getElementById('competitionForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var id = document.getElementById('competitionId').value;
  var fd = new FormData();
  fd.append('Title', document.getElementById('competitionTitleInput').value.trim());
  fd.append('Description', document.getElementById('competitionDescInput').value.trim());
  var startDate = document.getElementById('competitionStartInput').value;
  var endDate   = document.getElementById('competitionEndInput').value;
  if (startDate) fd.append('StartDate', startDate);
  if (endDate)   fd.append('EndDate', endDate);
  var file = document.getElementById('competitionFileInput').files[0];
  if (file) fd.append('File', file);
  try {
    if (id) await apiForm('PUT', '/api/Competitions/' + id, fd);
    else    await apiForm('POST', '/api/Competitions', fd);
    toast(id ? 'Competition updated' : 'Competition created');
    closeModal('competitionModalOverlay');
    loadCompetitions();
    loadDashboard();
  } catch(e) { toast('Save failed: ' + e.message, 'error'); }
});

// ═════════════════════════════════════════════════════════════
// ADMIN USERS MANAGEMENT
// ═════════════════════════════════════════════════════════════
var _adminUsers = [];

async function loadAdminUsers() {
  try {
    _adminUsers = await apiJSON('GET', '/api/AdminUsers') || [];
    var tb = document.getElementById('adminUsersTable');
    if (!_adminUsers.length) { tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-users-gear"></i><p>No admin users found</p></div></td></tr>'; return; }
    tb.innerHTML = _adminUsers.map(function(u) {
      var isActive = u.isActive !== false; // default active if field missing
      return '<tr>' +
        '<td>' + u.id + '</td>' +
        '<td><strong>' + esc(u.fullName || u.name || '—') + '</strong></td>' +
        '<td><a href="mailto:' + esc(u.email) + '">' + esc(u.email) + '</a></td>' +
        '<td><span class="badge ' + (isActive ? 'badge-green' : 'badge-red') + '">' + (isActive ? 'Active' : 'Inactive') + '</span></td>' +
        '<td><div class="actions">' +
          '<button class="btn btn-sm btn-toggle" onclick="toggleAdminUser(\'' + u.id + '\')" title="' + (isActive ? 'Deactivate' : 'Activate') + '"><i class="fa-solid fa-power-off"></i></button>' +
        '</div></td></tr>';
    }).join('');
  } catch(e) { toast('Failed to load admin users: ' + e.message, 'error'); }
}

window.toggleAdminUser = async function(id) {
  try {
    await fetch(API + '/api/AdminUsers/' + id + '/toggle-status', { method: 'PATCH', headers: authHeaders() });
    toast('User status toggled');
    loadAdminUsers();
  } catch(e) { toast('Toggle failed: ' + e.message, 'error'); }
};

// ═════════════════════════════════════════════════════════════
// PARTICIPANT ACTIONS (utility — called from console or future UI)
// ═════════════════════════════════════════════════════════════
window.participantJoinClub = async function(clubId) {
  try { var r = await apiJSON('POST', '/api/Participants/JoinClub', { clubId: clubId }); toast('Joined club successfully'); return r; }
  catch(e) { toast('Join club failed: ' + e.message, 'error'); }
};

window.participantRegisterActivity = async function(activityId) {
  try { var r = await apiJSON('POST', '/api/Participants/RegisterActivity', { activityId: activityId }); toast('Registered for activity'); return r; }
  catch(e) { toast('Register activity failed: ' + e.message, 'error'); }
};

window.participantRegisterCompetition = async function(competitionId) {
  try { var r = await apiJSON('POST', '/api/Participants/RegisterCompetition', { competitionId: competitionId }); toast('Registered for competition'); return r; }
  catch(e) { toast('Register competition failed: ' + e.message, 'error'); }
};

window.participantRegisterEvent = async function(eventId) {
  try { var r = await apiJSON('POST', '/api/Participants/RegisterEvent', { eventId: eventId }); toast('Registered for event'); return r; }
  catch(e) { toast('Register event failed: ' + e.message, 'error'); }
};
