/**
 * MUST University – API Integration Module
 * Base URL: http://must.runasp.net
 * ----------------------------------------
 * This file contains ALL API calls. It is the single source of truth for
 * every network request. Individual pages import the functions they need.
 */

const BASE_URL = 'http://must.runasp.net';

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
async function createEvent(title, description, eventDate) {
    return jsonRequest('POST', '/api/Events', { title, description, eventDate }, true);
}

/** PUT /api/Events/:id (requires auth) */
async function updateEvent(id, title, description, eventDate) {
    return jsonRequest('PUT', `/api/Events/${id}`, { title, description, eventDate }, true);
}

/** DELETE /api/Events/:id (requires auth) */
async function deleteEvent(id) {
    return jsonRequest('DELETE', `/api/Events/${id}`, null, true);
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
    fd.append('File', file);
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
};
