/**
 * MUST University – API Integration Module
 * Base URL: https://must.runasp.net
 * ----------------------------------------
 * This file contains ALL API calls. It is the single source of truth for
 * every network request. Individual pages import the functions they need.
 */

const BASE_URL = 'https://must.runasp.net';

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

/** Return the stored JWT token (or null) */
function getToken() {
    return localStorage.getItem('must_token');
}

/** Save token to localStorage */
function saveToken(token) {
    localStorage.setItem('must_token', token);
}

/** Remove token (logout) */
function removeToken() {
    localStorage.removeItem('must_token');
}

/** Build Authorization header object */
function authHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/** Generic JSON request helper */
async function jsonRequest(method, path, body = null, requiresAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth) Object.assign(headers, authHeaders());

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${path}`, options);
    const text = await res.text();

    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }

    if (!res.ok) {
        const msg = (data && (data.message || data.title || JSON.stringify(data))) || res.statusText;
        throw new Error(msg);
    }
    return data;
}

/** Generic multipart/form-data request helper */
async function formRequest(method, path, formData, requiresAuth = false) {
    const headers = {};
    if (requiresAuth) Object.assign(headers, authHeaders());

    const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: formData });
    const text = await res.text();

    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }

    if (!res.ok) {
        const msg = (data && (data.message || data.title || JSON.stringify(data))) || res.statusText;
        throw new Error(msg);
    }
    return data;
}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

/**
 * Register a new user.
 * @param {string} fullName
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>} API response
 */
async function registerUser(fullName, email, password) {
    return jsonRequest('POST', '/api/Auth/register', { fullName, email, password });
}

/**
 * Verify OTP after registration.
 * @param {string} email
 * @param {string} otpCode
 * @returns {Promise<any>} API response (may include token)
 */
async function verifyOtp(email, otpCode) {
    const data = await jsonRequest('POST', '/api/Auth/verify-otp', { email, otpCode });
    // Some backends return the token on OTP verification
    if (data && data.token) saveToken(data.token);
    return data;
}

/**
 * Login a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>} API response with token
 */
async function loginUser(email, password) {
    const data = await jsonRequest('POST', '/api/Auth/login', { email, password });
    // Save token if returned
    if (data && data.token) saveToken(data.token);
    else if (data && data.accessToken) saveToken(data.accessToken);
    else if (typeof data === 'string' && data.length > 20) saveToken(data);
    return data;
}

// ─────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────

/** GET /api/Events */
async function getEvents() {
    return jsonRequest('GET', '/api/Events');
}

/** GET /api/Events/:id */
async function getEventById(id) {
    return jsonRequest('GET', `/api/Events/${id}`);
}

/** POST /api/Events (requires auth) */
async function createEvent(title, description, eventDate, location, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('EventDate', eventDate);
    fd.append('Location', location);
    if (file) fd.append('Image', file);
    return formRequest('POST', '/api/Events', fd, true);
}

/** PUT /api/Events/:id (requires auth) */
async function updateEvent(id, title, description, eventDate, location, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('EventDate', eventDate);
    fd.append('Location', location);
    if (file) fd.append('Image', file);
    return formRequest('PUT', `/api/Events/${id}`, fd, true);
}

/** DELETE /api/Events/:id (requires auth) */
async function deleteEvent(id) {
    return jsonRequest('DELETE', `/api/Events/${id}`, null, true);
}

// ─────────────────────────────────────────
// CLUBS & COMPETITIONS
// ─────────────────────────────────────────

/** GET /api/Clubs */
async function getClubs() {
    return jsonRequest('GET', '/api/Clubs');
}

/** POST /api/Clubs (requires auth) */
async function createClub(name, description, file) {
    const fd = new FormData();
    fd.append('Name', name);
    fd.append('Description', description);
    if (file) fd.append('Image', file);
    return formRequest('POST', '/api/Clubs', fd, true);
}

/** PUT /api/Clubs/:id (requires auth) */
async function updateClub(id, name, description, file) {
    const fd = new FormData();
    fd.append('Name', name);
    fd.append('Description', description);
    if (file) fd.append('Image', file);
    return formRequest('PUT', `/api/Clubs/${id}`, fd, true);
}

/** DELETE /api/Clubs/:id (requires auth) */
async function deleteClub(id) {
    return jsonRequest('DELETE', `/api/Clubs/${id}`, null, true);
}

/** GET /api/Competitions */
async function getCompetitions() {
    return jsonRequest('GET', '/api/Competitions');
}

/** POST /api/Competitions (requires auth) */
async function createCompetition(title, description, registrationDeadline, startDate, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('RegistrationDeadline', registrationDeadline);
    fd.append('StartDate', startDate);
    if (file) fd.append('Image', file);
    return formRequest('POST', '/api/Competitions', fd, true);
}

/** PUT /api/Competitions/:id (requires auth) */
async function updateCompetition(id, title, description, registrationDeadline, startDate, file) {
    const fd = new FormData();
    fd.append('Title', title);
    fd.append('Description', description);
    fd.append('RegistrationDeadline', registrationDeadline);
    fd.append('StartDate', startDate);
    if (file) fd.append('Image', file);
    return formRequest('PUT', `/api/Competitions/${id}`, fd, true);
}

/** DELETE /api/Competitions/:id (requires auth) */
async function deleteCompetition(id) {
    return jsonRequest('DELETE', `/api/Competitions/${id}`, null, true);
}

// ─────────────────────────────────────────
// NEWS
// ─────────────────────────────────────────

/** GET /api/News */
async function getNews() {
    return jsonRequest('GET', '/api/News');
}

/** GET /api/News/:id */
async function getNewsById(id) {
    return jsonRequest('GET', `/api/News/${id}`);
}

/**
 * POST /api/News  (multipart/form-data, requires auth)
 * @param {File|null} file
 * @param {string} title
 * @param {string} content
 */
async function createNews(file, title, content) {
    const fd = new FormData();
    if (file) fd.append('File', file);
    fd.append('Title', title);
    fd.append('Content', content);
    return formRequest('POST', '/api/News', fd, true);
}

/**
 * PUT /api/News/:id  (multipart/form-data, requires auth)
 * @param {number} id
 * @param {File|null} file
 * @param {string} title
 * @param {string} content
 * @param {string} existingImageUrl
 */
async function updateNews(id, file, title, content, existingImageUrl = '') {
    const fd = new FormData();
    if (file) fd.append('File', file);
    fd.append('Title', title);
    fd.append('Content', content);
    if (existingImageUrl) fd.append('ExistingImageUrl', existingImageUrl);
    return formRequest('PUT', `/api/News/${id}`, fd, true);
}

/** DELETE /api/News/:id (requires auth) */
async function deleteNews(id) {
    return jsonRequest('DELETE', `/api/News/${id}`, null, true);
}

// ─────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────

/**
 * POST /api/Contact
 * @param {string} name
 * @param {string} email
 * @param {string} message
 */
async function sendContact(name, email, message) {
    return jsonRequest('POST', '/api/Contact', { name, email, message });
}

/** GET /api/Contact (requires auth) */
async function getContacts() {
    return jsonRequest('GET', '/api/Contact', null, true);
}

/** DELETE /api/Contact/:id (requires auth) */
async function deleteContact(id) {
    return jsonRequest('DELETE', `/api/Contact/${id}`, null, true);
}

// ─────────────────────────────────────────
// SLIDER
// ─────────────────────────────────────────

/** GET /api/Slider */
async function getSlider() {
    return jsonRequest('GET', '/api/Slider');
}

/**
 * POST /api/Slider  (multipart/form-data, requires auth)
 * @param {File} file
 * @param {string} title
 * @param {string} subTitle
 * @param {number} order
 */
async function createSlider(file, title, subTitle, order) {
    const fd = new FormData();
    fd.append('Image', file);
    fd.append('Title', title);
    fd.append('SubTitle', subTitle);
    fd.append('Order', order);
    return formRequest('POST', '/api/Slider', fd, true);
}

/** PATCH /api/Slider/:id/toggle (requires auth) */
async function toggleSlider(id) {
    return jsonRequest('PATCH', `/api/Slider/${id}/toggle`, null, true);
}

/** DELETE /api/Slider/:id (requires auth) */
async function deleteSlider(id) {
    return jsonRequest('DELETE', `/api/Slider/${id}`, null, true);
}

// ─────────────────────────────────────────
// MENU
// ─────────────────────────────────────────

/** GET /api/Menu */
async function getMenu() {
    return jsonRequest('GET', '/api/Menu');
}

/** GET /api/Menu/:id */
async function getMenuById(id) {
    return jsonRequest('GET', `/api/Menu/${id}`);
}

/** POST /api/Menu (requires auth) */
async function createMenu(name, url, order, parentId = null) {
    return jsonRequest('POST', '/api/Menu', { name, url, order, parentId }, true);
}

/** PUT /api/Menu/:id (requires auth) */
async function updateMenu(id, name, url, order, parentId = null) {
    return jsonRequest('PUT', `/api/Menu/${id}`, { name, url, order, parentId }, true);
}

/** DELETE /api/Menu/:id (requires auth) */
async function deleteMenu(id) {
    return jsonRequest('DELETE', `/api/Menu/${id}`, null, true);
}

// ─────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────

/** GET /api/Settings */
async function getSettings() {
    return jsonRequest('GET', '/api/Settings');
}

/**
 * PUT /api/Settings (requires auth)
 * @param {object} settingsObj  { universityEmail, phoneNumber, facebookLink, address, mapLocationUrl }
 */
async function updateSettings(settingsObj) {
    return jsonRequest('PUT', '/api/Settings', settingsObj, true);
}

// ─────────────────────────────────────────
// Export (so other scripts can use these)
// ─────────────────────────────────────────
window.MustAPI = {
    // token helpers
    getToken, saveToken, removeToken,
    // auth
    registerUser, verifyOtp, loginUser,
    // events
    getEvents, getEventById, createEvent, updateEvent, deleteEvent,
    // news
    getNews, getNewsById, createNews, updateNews, deleteNews,
    // contact
    sendContact, getContacts, deleteContact,
    // slider
    getSlider, createSlider, toggleSlider, deleteSlider,
    // menu
    getMenu, getMenuById, createMenu, updateMenu, deleteMenu,
    // settings
    getSettings, updateSettings,
    // clubs & competitions
    getClubs, createClub, updateClub, deleteClub,
    getCompetitions, createCompetition, updateCompetition, deleteCompetition
};

// ─────────────────────────────────────────
// PARTICIPANT INTEGRATION
// ─────────────────────────────────────────
window.joinClub = async function(clubId) {
    if (!getToken()) { alert("Please login first"); return; }
    return jsonRequest('POST', '/api/Participants/JoinClub', { clubId }, true)
        .then(res => { alert("Joined club successfully!"); return res; })
        .catch(err => { alert("Failed to join club: " + err.message); throw err; });
};

window.registerActivity = async function(activityId) {
    if (!getToken()) { alert("Please login first"); return; }
    return jsonRequest('POST', '/api/Participants/RegisterActivity', { activityId }, true)
        .then(res => { alert("Registered for activity successfully!"); return res; })
        .catch(err => { alert("Failed to register for activity: " + err.message); throw err; });
};

window.registerCompetition = async function(competitionId) {
    if (!getToken()) { alert("Please login first"); return; }
    return jsonRequest('POST', '/api/Participants/RegisterCompetition', { competitionId }, true)
        .then(res => { alert("Registered for competition successfully!"); return res; })
        .catch(err => { alert("Failed to register for competition: " + err.message); throw err; });
};

window.registerEvent = async function(eventId) {
    if (!getToken()) { alert("Please login first"); return; }
    return jsonRequest('POST', '/api/Participants/RegisterEvent', { eventId }, true)
        .then(res => { alert("Registered for event successfully!"); return res; })
        .catch(err => { alert("Failed to register for event: " + err.message); throw err; });
};

// ─────────────────────────────────────────
// GLOBAL AUTH STATE & NAVIGATION FIXES
// ─────────────────────────────────────────
window.logout = function() {
    localStorage.removeItem("must_token");
    window.location.href = "login.html";
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Maintain User Authentication State
    const token = getToken();
    const loginBtns = document.querySelectorAll('a[href*="login.html"], a.btn-login');
    const signupBtns = document.querySelectorAll('a[href*="signup.html"], a.btn-register');
    const navIcons = document.querySelector('.nav-icons');

    if (token) {
        // User must be treated as logged in -> Hide Login / Signup buttons
        loginBtns.forEach(btn => btn.style.display = 'none');
        signupBtns.forEach(btn => btn.style.display = 'none');

        // Dynamically add logout button if missing
        if (!document.getElementById('mustLogoutBtn') && navIcons) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'mustLogoutBtn';
            logoutBtn.href = '#';
            logoutBtn.className = 'btn-login';
            logoutBtn.textContent = 'Logout';
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
            navIcons.appendChild(logoutBtn);
        }
    } else {
        // Not logged in
        loginBtns.forEach(btn => btn.style.display = 'inline-block');
        signupBtns.forEach(btn => btn.style.display = 'inline-block');
        const logoutBtn = document.getElementById('mustLogoutBtn');
        if (logoutBtn) logoutBtn.remove();
    }

    // 2. Fix Navigation Links Dynamically (avoids changing HTML structure)
    document.querySelectorAll('a').forEach(a => {
        const text = a.textContent.trim().toLowerCase();
        const href = a.getAttribute('href');
        
        if (!href) return; // Skip anchors without href

        // Map requirements:
        if (text === 'home') a.href = 'index.html';
        else if (text.includes('activities')) a.href = 'index.html'; // fallback if activities.html missing
        else if (text.includes('events') || href.includes('#events')) a.href = 'allEvents.html';
        else if (text.includes('news') || href.includes('#news')) a.href = 'allNews.html';
        else if (text.includes('competitions')) a.href = 'index.html'; // fallback
        else if (text.includes('clubs')) a.href = 'clubs.html'; // fallback 
        else if (text.includes('contact us') || text.includes('contact')) a.href = 'index.html'; // fallback
        
        // Ensure no "Cannot GET" errors by redirecting # links that do nothing
        if (a.getAttribute('href') === '#') {
            a.addEventListener('click', (e) => {
                // If it's just a dropdown toggle, don't do anything specific
                if (!a.querySelector('.fa-angle-down')) {
                    e.preventDefault();
                }
            });
        }
    });
});

