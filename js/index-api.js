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
    function initContactForm() {
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
    }
    initContactForm();

    // ════════════════════════════════════════
    // EVENTS  (index.html shows first 3)
    // ════════════════════════════════════════
    function initEvents() {
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

                    // Resolve image URL
                    let evtImg = event.imageUrl || event.image || '';
                    if (evtImg && evtImg.startsWith('/')) evtImg = 'https://must.runasp.net' + evtImg;
                    if (!evtImg) evtImg = 'img/event2.png';

                    const card = `
                        <div class="event-card" onclick="openApiEventModal(${index})" style="cursor:pointer;">
                            <div class="image-box">
                                <img src="${evtImg}" alt="${escHtml(event.title)}" onerror="this.src='img/event2.png'">
                                <div class="date-box">
                                    <div class="day">${day}</div>
                                    <div class="month">${month}</div>
                                </div>
                            </div>
                            <div class="event-info">
                                <div class="meta">
                                    <span>📅 ${date ? date.toLocaleDateString() : 'TBA'}</span>
                                    ${event.location ? `<span>📍 ${escHtml(event.location)}</span>` : ''}
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
    }
    initEvents();

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

        let mEvtImg = event.imageUrl || event.image || '';
        if (mEvtImg && mEvtImg.startsWith('/')) mEvtImg = 'https://must.runasp.net' + mEvtImg;
        if (!mEvtImg) mEvtImg = 'img/event2.png';
        if (modalImg)   modalImg.src           = mEvtImg;
        if (modalTitle) modalTitle.innerText   = event.title || '';
        if (modalDesc)  modalDesc.innerText    = event.description || '';
        if (modalTime)  modalTime.innerText    = '📅 ' + date;
        if (modalLoc)   modalLoc.innerText     = event.location ? '📍 ' + event.location : '';
        if (modal)      modal.style.display    = 'flex';
    };

    // ════════════════════════════════════════
    // NEWS  (index.html shows first 3)
    // ════════════════════════════════════════
    function initNews() {
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
                    let imgSrc = item.imageUrl || item.image || '';
                    if (imgSrc && imgSrc.startsWith('/')) imgSrc = 'https://must.runasp.net' + imgSrc;
                    if (!imgSrc) imgSrc = 'img/news5.jpg';

                    const card = `
                        <div class="card" onclick="openApiNewsModal(${index})" style="cursor:pointer;">
                            <img src="${escHtml(imgSrc)}" alt="${escHtml(item.title)}" onerror="this.src='img/news5.jpg'" style="width:100%;height:200px;object-fit:cover;">
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
    }
    initNews();
    setInterval(initNews, 5000);

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

        let imgSrc = item.imageUrl || item.image || '';
        if (imgSrc && imgSrc.startsWith('/')) imgSrc = 'https://must.runasp.net' + imgSrc;
        if (!imgSrc) imgSrc = 'img/news5.jpg';

        if (newsImg)    newsImg.src          = imgSrc;
        if (newsTitle)  newsTitle.innerText  = item.title || '';
        if (newsAuthor) newsAuthor.innerText = 'MUST Admin';
        if (newsDate)   newsDate.innerText   = date;
        if (newsDesc)   newsDesc.innerText   = item.content || item.description || '';
        if (modal)      modal.style.display  = 'flex';
    };

    // ════════════════════════════════════════
    // SLIDER (optional – load from API if available)
    // ════════════════════════════════════════
    function initSlider() {
        // Only update slides if we have active ones from the API
        MustAPI.getSlider()
            .then(function (data) {
                if (!data || !Array.isArray(data) || data.length === 0) return;

                // Filter only active slides
                const active = data.filter(function (s) { return s.isActive === true; });
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
                    const isActive = i === 0 ? " active" : "";
                    div.className = 'carousel-slide' + isActive;
                    
                    let imgPath = slide.imageUrl || slide.image;
                    if (imgPath) {
                        const BASE_URL = "https://must.runasp.net";
                        const fullImageUrl = imgPath.startsWith('http') ? imgPath : BASE_URL + imgPath;
                        div.style.backgroundImage = `url('${fullImageUrl}')`;
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
    }
    initSlider();

    // ════════════════════════════════════════
    // ACTIVITIES  (index.html #activitiesContainer)
    // ════════════════════════════════════════
    function initActivities() {
        const container = document.getElementById('activitiesContainer');
        if (!container) return; // Only run on index.html

        fetch('https://must.runasp.net/api/Activities')
            .then(function(res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function(data) {
                console.log('[index-api] Activities API response:', data);
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn('[index-api] No activities returned from API');
                    return;
                }

                container.innerHTML = '';

                data.forEach(function(activity) {
                    // Fix image URL — prepend base URL if path is relative
                    var imgUrl = activity.imageUrl || activity.image || '';
                    if (imgUrl && imgUrl.startsWith('/')) {
                        imgUrl = 'https://must.runasp.net' + imgUrl;
                    }
                    if (!imgUrl) imgUrl = 'img/OIP.webp';

                    var desc = (activity.description || '').length > 120
                        ? activity.description.slice(0, 120) + '\u2026'
                        : (activity.description || '');

                    container.innerHTML += `
                        <div class="card" style="cursor:pointer;" onclick="window.location.href='activity-details.html?id=${activity.id}'">
                            <img src="${imgUrl}" alt="${escHtml(activity.title || '')}" onerror="this.src='img/OIP.webp'">
                            <h3>${escHtml(activity.title || '')}</h3>
                            <p>${escHtml(desc)}</p>
                            <button onclick="event.stopPropagation(); window.location.href='activity-details.html?id=${activity.id}'">Explore</button>
                        </div>`;
                });

                console.log('[index-api] Activities rendered:', data.length);
            })
            .catch(function(err) {
                console.error('[index-api] Activities fetch error:', err);
            });
    }
    initActivities();

    // ════════════════════════════════════════
    // CLUBS
    // ════════════════════════════════════════
    function initClubs() {
        // Try both possible container IDs (index.html uses #clubs section, clubs.html has #clubsContainer)
        const grid = document.getElementById('clubsContainer') ||
                     document.querySelector('#clubs .clubs-grid') ||
                     document.querySelector('.clubs-section .clubs-grid');
        if (!grid) return;

        MustAPI.getClubs()
            .then(function (data) {
                if (!data || !Array.isArray(data) || data.length === 0) return;
                grid.innerHTML = '';
                data.forEach(function (club) {
                    let imgSrc = club.imageUrl || club.image || '';
                    if (imgSrc && imgSrc.startsWith('/')) imgSrc = 'https://must.runasp.net' + imgSrc;
                    if (!imgSrc) imgSrc = 'img/event2.png';
                    grid.innerHTML += `
                        <div class="club-card">
                            <img src="${escHtml(imgSrc)}" alt="${escHtml(club.name)}" class="club-img"
                                 onerror="this.src='img/event2.png'">
                            <h3>${escHtml(club.name)}</h3>
                            <p>${escHtml((club.description || '').slice(0, 180))}${club.description && club.description.length > 180 ? '\u2026' : ''}</p>
                            <button class="join-btn"><a href="./registerClub.html">Registration</a></button>
                        </div>`;
                });
                console.log('Clubs loaded from API:', data.length);
            })
            .catch(function (err) { console.error('Clubs API error:', err); });
    }
    initClubs();

    // ════════════════════════════════════════
    // COMPETITIONS
    // ════════════════════════════════════════
    function initCompetitions() {
        // Try both index.html slider-track and a standalone container
        const track = document.getElementById('competitionsContainer') ||
                      document.querySelector('#competitions .slider-track');
        if (!track) return;

        MustAPI.getCompetitions()
            .then(function (data) {
                if (!data || !Array.isArray(data) || data.length === 0) return;
                track.innerHTML = '';
                data.forEach(function (comp) {
                    let imgSrc = comp.imageUrl || comp.image || '';
                    if (imgSrc && imgSrc.startsWith('/')) imgSrc = 'https://must.runasp.net' + imgSrc;
                    if (!imgSrc) imgSrc = 'img/event2.png';
                    const dateStr = comp.startDate
                        ? '\ud83d\udcc5 Starts: ' + new Date(comp.startDate).toLocaleDateString()
                        : (comp.endDate ? '\ud83c\udfc1 Deadline: ' + new Date(comp.endDate).toLocaleDateString() : '');
                    track.innerHTML += `
                        <div class="slide">
                            <div class="competition-card">
                                <img src="${escHtml(imgSrc)}" class="comp-img"
                                     onerror="this.src='img/event2.png'">
                                <h3>${escHtml(comp.title || comp.name)}</h3>
                                <p class="comp-desc">${escHtml((comp.description || '').slice(0, 180))}${comp.description && comp.description.length > 180 ? '\u2026' : ''}</p>
                                ${dateStr ? `<div class="comp-date">${escHtml(dateStr)}</div>` : ''}
                                <button class="join-btn"><a href="./registerClub.html">Registration</a></button>
                            </div>
                        </div>`;
                });
                console.log('Competitions loaded from API:', data.length);
            })
            .catch(function (err) { console.error('Competitions API error:', err); });
    }
    initCompetitions();

    // ════════════════════════════════════════
    // AUTO-REFRESH LIVE DATA (5 seconds)
    // ════════════════════════════════════════
    setInterval(initActivities, 5000);
    setInterval(initEvents, 5000);
    setInterval(initNews, 5000);
    setInterval(initSlider, 5000);
    setInterval(initClubs, 5000);
    setInterval(initCompetitions, 5000);

    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
})();
