/**
 * allEvents-api.js  –  API integration for allEvents.html
 *
 * Replaces the static `events` array with live data from GET /api/Events.
 * The existing card template and modal structure remain untouched.
 *
 * HOW TO USE:
 *   Add just before </body> in allEvents.html:
 *     <script src="js/api.js"></script>
 *     <script src="js/allEvents-api.js"></script>
 */

(function () {
    'use strict';

    const container = document.getElementById('eventsContainer');
    if (!container) return;

    // Global store for API events (used by openModal / click handlers)
    window._apiAllEvents = [];

    // ── Load Events from API ──────────────────────────────────────
    function initAllEvents() {
        MustAPI.getEvents()
        .then(function (data) {
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.log('allEvents: no API data, keeping static content.');
                return;
            }

            window._apiAllEvents = data;

            // Clear static hardcoded cards
            container.innerHTML = '';

            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

            data.forEach(function (event, index) {
                const date  = event.eventDate ? new Date(event.eventDate) : null;
                const day   = date ? String(date.getDate()).padStart(2, '0') : '--';
                const month = date ? monthNames[date.getMonth()] : '--';
                const dateStr = date ? date.toLocaleDateString() : 'TBA';

                const imgSrc = event.imageUrl || event.image || 'img/event2.png';

                container.innerHTML += `
                    <div class="event-card" onclick="openApiModal(${index})">
                        <div class="image-box">
                            <img src="${escHtml(imgSrc)}" alt="${escHtml(event.title)}" onerror="this.src='img/event2.png'">
                            <div class="date-box">
                                <div class="day">${day}</div>
                                <div class="month">${month}</div>
                            </div>
                        </div>
                        <div class="event-info">
                            <div class="meta">
                                <span>📅 ${dateStr}</span>
                            </div>
                            <h3>${escHtml(event.title)}</h3>
                            <p>${escHtml((event.description || '').slice(0, 120))}${event.description && event.description.length > 120 ? '…' : ''}</p>
                        </div>
                    </div>`;
            });

            console.log('allEvents loaded from API:', data.length, 'events');
        })
        .catch(function (err) {
            console.error('allEvents API error:', err);
            // Static content remains as fallback
        });
    }
    
    initAllEvents();

    // ── Modal opener (overrides the static one when API data available) ──
    window.openApiModal = function (index) {
        const events = window._apiAllEvents;
        if (!events || !events[index]) return;

        const event = events[index];
        const date  = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBA';

        const el = function (id) { return document.getElementById(id); };

        const img = el('modalImg');
        if (img) img.src = event.imageUrl || event.image || 'img/event2.png';

        const title = el('modalTitle');
        if (title) title.innerText = event.title || '';

        const desc = el('modalDesc');
        if (desc) desc.innerText = event.description || '';

        const time = el('modalTime');
        if (time) time.innerText = '📅 ' + date;

        const loc = el('modalLocation');
        if (loc) loc.innerText = '';

        const modal = el('eventModal');
        if (modal) modal.style.display = 'flex';
    };

    // ── Utility ──────────────────────────────────────────────────
    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ════════════════════════════════════════
    // AUTO-REFRESH LIVE DATA (5 seconds)
    // ════════════════════════════════════════
    setInterval(initAllEvents, 5000);
})();
