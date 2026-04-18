/**
 * allNews-api.js  –  API integration for allNews.html
 *
 * Replaces the static news cards with live data from GET /api/News.
 * Existing card CSS classes and structure are reused.
 *
 * HOW TO USE:
 *   Add just before </body> in allNews.html:
 *     <script src="js/api.js"></script>
 *     <script src="js/allNews-api.js"></script>
 */

(function () {
    'use strict';

    const newsContainer = document.querySelector('.news-container');
    if (!newsContainer) return;

    // Global store for modal usage
    window._apiAllNews = [];

    function initAllNews() {
        MustAPI.getNews()
        .then(function (data) {
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.log('allNews: no API data, keeping static content.');
                return;
            }

            window._apiAllNews = data;

            // Clear static hardcoded cards
            newsContainer.innerHTML = '';

            data.forEach(function (item, index) {
                const date   = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
                const imgSrc = item.imageUrl || item.image || 'img/news5.jpg';

                newsContainer.innerHTML += `
                    <div class="card" onclick="window.location.href='news-details.html?id=${item.id}'" style="cursor:pointer;">
                        <img src="${escHtml(imgSrc)}" alt="${escHtml(item.title)}" onerror="this.src='img/news5.jpg'">
                        <div class="card-content">
                            <div class="meta">
                                <span><i class="fa-regular fa-user"></i> MUST Admin</span>
                                ${date ? `<span><i class="fa-regular fa-calendar"></i> ${date}</span>` : ''}
                            </div>
                            <h3>${escHtml(item.title)}</h3>
                        </div>
                    </div>`;
            });

            console.log('allNews loaded from API:', data.length, 'items');
        })
        .catch(function (err) {
            console.error('allNews API error:', err);
        });
    }

    initAllNews();

    /**
     * Simple detail view: alert or inject into an existing modal if present.
     * allNews.html does not have a modal in the static HTML, so we show an alert.
     */
    window.openApiNewsDetail = function (index) {
        const news = window._apiAllNews;
        if (!news || !news[index]) return;

        const item  = news[index];
        const date  = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
        const extra = date ? ` (${date})` : '';

        // Check if a modal exists in this page (copied from index.html pattern)
        const modal      = document.getElementById('newsModal');
        const newsImg    = document.getElementById('newsImg');
        const newsTitle  = document.getElementById('newsTitle');
        const newsAuthor = document.getElementById('newsAuthor');
        const newsDate   = document.getElementById('newsDate');
        const newsDesc   = document.getElementById('newsDesc');

        if (modal) {
            if (newsImg)    newsImg.src          = item.imageUrl || item.image || 'img/news5.jpg';
            if (newsTitle)  newsTitle.innerText  = item.title || '';
            if (newsAuthor) newsAuthor.innerText = 'MUST Admin';
            if (newsDate)   newsDate.innerText   = date;
            if (newsDesc)   newsDesc.innerText   = item.content || item.description || '';
            modal.style.display = 'flex';
        } else {
            // Fallback for pages without a modal
            alert(`${item.title}${extra}\n\n${item.content || item.description || ''}`);
        }
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
    setInterval(initAllNews, 5000);
})();
