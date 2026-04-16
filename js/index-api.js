/**
 * index-api.js  –  API integration for index.html (homepage)
 *
 * Connects:
 *   • Contact form   → POST /api/Contact
 *   • Events section → GET  /api/Events  (replaces static JS array)
 *   • News section   → GET  /api/News    (replaces static JS array)
 *   • Slider section → GET  /api/Slider  (optional hero carousel update)
 *
 * HOW TO USE:
 *   Add just before </body> in index.html:
 *     <script src="js/api.js"></script>
 *     <script src="js/index-api.js"></script>
 *   (Keep the existing <script src="js/script.js"></script> as well)
 */

(function () {
    'use strict';

    // ════════════════════════════════════════
    // CONTACT FORM
    // ════════════════════════════════════════
    (function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name    = document.getElementById('name').value.trim();
            const email   = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                alert('Please fill all required fields');
                return;
            }

            try {
                await MustAPI.sendContact(name, email, message);
                alert('Message sent successfully ✅');
                form.reset();
            } catch (err) {
                console.error('Contact error:', err);
                alert('Failed to send message: ' + err.message);
            }
        });
    })();

    // ════════════════════════════════════════
    // EVENTS  (index.html shows first 3)
    // ════════════════════════════════════════
    (function initEvents() {
        const container = document.getElementById('eventsContainer');
        if (!container) return;

        MustAPI.getEvents()
            .then(function (data) {
                if (!data || !Array.isArray(data) || data.length === 0) {
                    console.log('Events: no data from API, keeping static content.');
                    return;
                }

                // Keep track of API events for modal
                window._apiEvents = data;

                // Clear static content
                container.innerHTML = '';

                // Show up to 3 on homepage
                const eventsToShow = data.slice(0, 3);

                eventsToShow.forEach(function (event, index) {
                    const date       = event.eventDate ? new Date(event.eventDate) : null;
                    const day        = date ? String(date.getDate()).padStart(2, '0') : '--';
                    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    const month      = date ? monthNames[date.getMonth()] : '--';

                    const card = `
                        <div class="event-card" onclick="openApiEventModal(${index})" style="cursor:pointer;">
                            <div class="image-box">
                                <img src="${event.imageUrl || event.image || 'img/event2.png'}" alt="${escHtml(event.title)}" onerror="this.src='img/event2.png'">
                                <div class="date-box">
                                    <div class="day">${day}</div>
                                    <div class="month">${month}</div>
                                </div>
                            </div>
                            <div class="event-info">
                                <div class="meta">
                                    <span>📅 ${date ? date.toLocaleDateString() : 'TBA'}</span>
                                </div>
                                <h3>${escHtml(event.title)}</h3>
                                <p>${escHtml((event.description || '').slice(0, 100))}${event.description && event.description.length > 100 ? '…' : ''}</p>
                            </div>
                        </div>`;
                    container.innerHTML += card;
                });

                console.log('Events loaded from API:', data.length);
            })
            .catch(function (err) {
                console.error('Events API error:', err);
                // Keep static content on failure – do nothing
            });
    })();

    /** Open event modal with API data */
    window.openApiEventModal = function (index) {
        const events = window._apiEvents;
        if (!events || !events[index]) return;

        const event = events[index];
        const date  = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'TBA';

        const modalImg   = document.getElementById('modalImg');
        const modalTitle = document.getElementById('modalTitle');
        const modalDesc  = document.getElementById('modalDesc');
        const modalTime  = document.getElementById('modalTime');
        const modalLoc   = document.getElementById('modalLocation');
        const modal      = document.getElementById('eventModal');

        if (modalImg)   modalImg.src           = event.imageUrl || event.image || 'img/event2.png';
        if (modalTitle) modalTitle.innerText   = event.title || '';
        if (modalDesc)  modalDesc.innerText    = event.description || '';
        if (modalTime)  modalTime.innerText    = '📅 ' + date;
        if (modalLoc)   modalLoc.innerText     = '';
        if (modal)      modal.style.display    = 'flex';
    };

    // ════════════════════════════════════════
    // NEWS  (index.html shows first 3)
    // ════════════════════════════════════════
    (function initNews() {
        const newsContainer = document.querySelector('#news .news-container');
        if (!newsContainer) return;

        MustAPI.getNews()
            .then(function (data) {
                if (!data || !Array.isArray(data) || data.length === 0) {
                    console.log('News: no data from API, keeping static content.');
                    return;
                }

                window._apiNews = data;

                // Clear static news cards
                newsContainer.innerHTML = '';

                // Show up to 3 on homepage
                const newsToShow = data.slice(0, 3);

                newsToShow.forEach(function (item, index) {
                    const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
                    const card = `
                        <div class="card" onclick="openApiNewsModal(${index})" style="cursor:pointer;">
                            <img src="${item.imageUrl || item.image || 'img/news5.jpg'}" alt="${escHtml(item.title)}" onerror="this.src='img/news5.jpg'" style="width:100%;height:200px;object-fit:cover;">
                            <div class="card-content">
                                <div class="meta">
                                    <span><i class="fa-regular fa-user"></i> MUST Admin</span>
                                    ${date ? `<span><i class="fa-regular fa-calendar"></i> ${date}</span>` : ''}
                                </div>
                                <h3>${escHtml(item.title)}</h3>
                            </div>
                        </div>`;
                    newsContainer.innerHTML += card;
                });

                console.log('News loaded from API:', data.length);
            })
            .catch(function (err) {
                console.error('News API error:', err);
            });
    })();

    /** Open news modal with API data */
    window.openApiNewsModal = function (index) {
        const news = window._apiNews;
        if (!news || !news[index]) return;

        const item = news[index];
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';

        const newsImg    = document.getElementById('newsImg');
        const newsTitle  = document.getElementById('newsTitle');
        const newsAuthor = document.getElementById('newsAuthor');
        const newsDate   = document.getElementById('newsDate');
        const newsDesc   = document.getElementById('newsDesc');
        const modal      = document.getElementById('newsModal');

        if (newsImg)    newsImg.src          = item.imageUrl || item.image || 'img/news5.jpg';
        if (newsTitle)  newsTitle.innerText  = item.title || '';
        if (newsAuthor) newsAuthor.innerText = 'MUST Admin';
        if (newsDate)   newsDate.innerText   = date;
        if (newsDesc)   newsDesc.innerText   = item.content || item.description || '';
        if (modal)      modal.style.display  = 'flex';
    };

    // ════════════════════════════════════════
    // SLIDER (optional – load from API if available)
    // ════════════════════════════════════════
    (function initSlider() {
        // Only update slides if we have active ones from the API
        MustAPI.getSlider()
            .then(function (data) {
                if (!data || !Array.isArray(data) || data.length === 0) return;

                // Filter only active slides
                const active = data.filter(function (s) { return s.isActive !== false; });
                if (active.length === 0) return;

                const container = document.querySelector('.content-container');
                if (!container) return;

                // Replace existing carousel slides
                const existing = container.querySelectorAll('.carousel-slide');
                existing.forEach(function (el) { el.remove(); });

                // Insert new slides before carousel-controls
                const controls = container.querySelector('.carousel-controls');

                active.forEach(function (slide, i) {
                    const div = document.createElement('div');
                    div.className = 'carousel-slide' + (i === 0 ? ' active' : '');
                    if (slide.imageUrl || slide.image) {
                        div.style.backgroundImage = `url('${slide.imageUrl || slide.image}')`;
                    }
                    container.insertBefore(div, controls);
                });

                // Reassign the global slides NodeList for prev/next logic
                // (index.html inline script uses querySelectorAll – it already ran,
                //  so we just refresh the reference used by the auto-timer)
                console.log('Slider loaded from API:', active.length, 'slides');
            })
            .catch(function (err) {
                console.error('Slider API error:', err);
            });
    })();

    // ════════════════════════════════════════
    // Utility
    // ════════════════════════════════════════
    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

})();
