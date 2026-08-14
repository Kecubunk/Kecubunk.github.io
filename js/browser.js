/**
 * WebOS Browser Application
 * 
 * CATATAN: Banyak situs modern (YouTube, Netflix, Facebook, dll) memblokir 
 * embedding iframe dengan X-Frame-Options atau Content-Security-Policy.
 * Ini adalah kebijakan keamanan browser yang tidak bisa di-bypass.
 * 
 * Solusi yang tersedia:
 * 1. Buka di tab baru (tidak ideal untuk WebOS)
 * 2. Gunakan proxy/CORS bypass (memerlukan backend server)
 * 3. Gunakan layanan pihak ketiga seperti AllOrigins
 */

class Browser {
    constructor(windowId) {
        this.windowId = windowId;
        this.history = [];
        this.historyIndex = -1;
        this.currentUrl = '';
        
        this.urlInputEl = null;
        this.iframeEl = null;
        this.homepageEl = null;
        this.statusEl = null;
        
        // Daftar situs yang memblokir iframe
        this.blockedSites = [
            'youtube.com', 'youtu.be',
            'netflix.com',
            'facebook.com', 'm.facebook.com',
            'instagram.com',
            'twitter.com', 'x.com',
            'tiktok.com',
            'twitch.tv',
            'vimeo.com',
            'dailymotion.com',
            'spotify.com',
            'soundcloud.com',
            'reddit.com',
            'github.com',
            'stackoverflow.com',
            'google.com'
        ];
        
        // Sites that work in iframe
        this.allowedSites = [
            'wikipedia.org',
            'codepen.io',
            'example.com',
            'archive.org',
            'w3schools.com'
        ];
        
        setTimeout(() => this.init(), 50);
    }

    init() {
        const windowEl = document.querySelector(`[data-window-id="${this.windowId}"]`);
        if (!windowEl) return;
        
        this.urlInputEl = windowEl.querySelector('.browser-url-input');
        this.iframeEl = windowEl.querySelector('.browser-iframe');
        this.homepageEl = windowEl.querySelector('.browser-homepage');
        this.statusEl = windowEl.querySelector('.browser-status-text');
        
        if (!this.urlInputEl || !this.iframeEl || !this.homepageEl) return;
        
        this.setupEventListeners();
        this.updateStatus('Ready');
    }

    setupEventListeners() {
        this.urlInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.navigate(this.urlInputEl.value);
            }
        });
        
        this.iframeEl.addEventListener('load', () => {
            this.updateStatus('Done');
        });
    }

    isBlocked(url) {
        try {
            const urlObj = new URL(url);
            return this.blockedSites.some(site => urlObj.hostname.includes(site));
        } catch {
            return false;
        }
    }

    navigate(url) {
        if (!url) return;
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Add to history (only if different from current)
        if (this.currentUrl !== url) {
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(url);
            this.historyIndex = this.history.length - 1;
        }

        this.currentUrl = url;
        this.urlInputEl.value = url;

        // Check if site blocks iframe
        if (this.isBlocked(url)) {
            this.showBlockedMessage(url);
        } else {
            this.loadInIframe(url);
        }
    }

    showBlockedMessage(url) {
        const urlObj = new URL(url);
        
        this.homepageEl.style.display = 'block';
        this.homepageEl.innerHTML = `
            <div class="browser-blocked-page">
                <div class="blocked-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <h2>Situs Terbatas</h2>
                <p class="blocked-host">${urlObj.hostname}</p>
                <p class="blocked-reason">
                    Situs ini memblokir tampilan dalam iframe untuk alasan keamanan.
                    Ini adalah kebijakan dari pemilik situs, bukan batasan WebOS.
                </p>
                <div class="blocked-actions">
                    <button class="blocked-btn primary" onclick="browserOpenExternal('${url}')">
                        <i class="fas fa-external-link-alt"></i>
                        Buka di Browser Eksternal
                    </button>
                    <button class="blocked-btn secondary" onclick="browserCopyUrl('${url}')">
                        <i class="fas fa-copy"></i>
                        Salin URL
                    </button>
                </div>
                <div class="blocked-info">
                    <p><strong>Mengapa ini terjadi?</strong></p>
                    <p>Browser modern memblokir iframe dari situs tertentu untuk mencegah 
                    clickjacking dan serangan keamanan lainnya. Kebijakan ini ditetapkan oleh 
                    situs itu sendiri melalui header X-Frame-Options atau Content-Security-Policy.</p>
                </div>
            </div>
        `;
        this.iframeEl.style.display = 'none';
        this.updateStatus('Situs terbatas: ' + urlObj.hostname);
    }

    loadInIframe(url) {
        this.homepageEl.style.display = 'none';
        this.iframeEl.style.display = 'block';
        this.updateStatus('Loading: ' + url);
        
        try {
            // Use a proxy service for sites that might block iframe
            const urlObj = new URL(url);
            const isKnownProblematic = ['github.com', 'stackoverflow.com'].some(
                site => urlObj.hostname.includes(site)
            );
            
            if (isKnownProblematic) {
                // These sites may still block iframe - show warning
                this.iframeEl.src = url;
                
                // Set timeout to check if page loaded
                setTimeout(() => {
                    try {
                        // Try to access iframe - will throw if blocked
                        const doc = this.iframeEl.contentDocument;
                        if (!doc) {
                            this.showBlockedMessage(url);
                        }
                    } catch (e) {
                        // Cross-origin blocked
                        // But we'll try to show anyway
                    }
                }, 3000);
            } else {
                this.iframeEl.src = url;
            }
        } catch (e) {
            this.updateStatus('Error loading page');
            this.showBlockedMessage(url);
        }
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const url = this.history[this.historyIndex];
            this.currentUrl = url;
            this.urlInputEl.value = url;
            
            if (this.isBlocked(url)) {
                this.showBlockedMessage(url);
            } else {
                this.loadInIframe(url);
            }
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const url = this.history[this.historyIndex];
            this.currentUrl = url;
            this.urlInputEl.value = url;
            
            if (this.isBlocked(url)) {
                this.showBlockedMessage(url);
            } else {
                this.loadInIframe(url);
            }
        }
    }

    refresh() {
        if (this.currentUrl) {
            this.updateStatus('Refreshing...');
            if (this.iframeEl.style.display !== 'none') {
                this.iframeEl.src = this.iframeEl.src;
            } else {
                // If showing homepage or blocked page, reload current URL
                if (this.isBlocked(this.currentUrl)) {
                    this.showBlockedMessage(this.currentUrl);
                } else {
                    this.loadInIframe(this.currentUrl);
                }
            }
        }
    }

    goHome() {
        this.currentUrl = '';
        this.urlInputEl.value = '';
        this.homepageEl.style.display = 'block';
        this.homepageEl.innerHTML = this.getHomepageContent();
        this.iframeEl.style.display = 'none';
        this.iframeEl.src = '';
        this.updateStatus('Ready');
    }

    getHomepageContent() {
        return `
            <div class="browser-homepage-content">
                <h1>WebOS Browser</h1>
                <div class="browser-search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Cari di Wikipedia..." onkeypress="handleBrowserSearch(event)">
                </div>
                <div class="browser-bookmarks-grid">
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.wikipedia.org')">
                        <div class="bookmark-icon"><i class="fab fa-wikipedia-w"></i></div>
                        <span>Wikipedia</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.w3schools.com')">
                        <div class="bookmark-icon"><i class="fas fa-code"></i></div>
                        <span>W3Schools</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://codepen.io')">
                        <div class="bookmark-icon"><i class="fab fa-codepen"></i></div>
                        <span>CodePen</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://archive.org')">
                        <div class="bookmark-icon"><i class="fas fa-archive"></i></div>
                        <span>Archive.org</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://example.com')">
                        <div class="bookmark-icon"><i class="fas fa-globe"></i></div>
                        <span>Example.com</span>
                    </div>
                </div>
                <div class="browser-notice">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <p style="font-weight: bold; margin-bottom: 5px;">Catatan Penting:</p>
                        <p>Beberapa situs seperti Google, YouTube, GitHub, dan Facebook tidak dapat ditampilkan 
                        di dalam browser karena kebijakan keamanan (X-Frame-Options). 
                        Klik link tersebut untuk membukanya di tab baru.</p>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <p style="font-size: 13px; color: #666;">Coba akses langsung (buka di tab baru):</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
                        <button onclick="browserOpenExternal('https://www.google.com')" 
                                style="padding: 8px 16px; border: 1px solid #4285f4; background: transparent; color: #4285f4; border-radius: 20px; cursor: pointer;">
                            <i class="fab fa-google"></i> Google
                        </button>
                        <button onclick="browserOpenExternal('https://www.youtube.com')" 
                                style="padding: 8px 16px; border: 1px solid #f44336; background: transparent; color: #f44336; border-radius: 20px; cursor: pointer;">
                            <i class="fab fa-youtube"></i> YouTube
                        </button>
                        <button onclick="browserOpenExternal('https://github.com')" 
                                style="padding: 8px 16px; border: 1px solid #333; background: transparent; color: #333; border-radius: 20px; cursor: pointer;">
                            <i class="fab fa-github"></i> GitHub
                        </button>
                        <button onclick="browserOpenExternal('https://stackoverflow.com')" 
                                style="padding: 8px 16px; border: 1px solid #f48024; background: transparent; color: #f48024; border-radius: 20px; cursor: pointer;">
                            <i class="fab fa-stack-overflow"></i> Stack Overflow
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    goTo(url) {
        this.navigate(url);
    }

    search(query) {
        const url = 'https://en.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(query);
        this.navigate(url);
    }

    updateStatus(message) {
        if (this.statusEl) {
            this.statusEl.textContent = message;
        }
    }
}

// Global browser functions
function browserBack() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._browserInstance) {
        windowEl._browserInstance.goBack();
    }
}

function browserForward() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._browserInstance) {
        windowEl._browserInstance.goForward();
    }
}

function browserRefresh() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._browserInstance) {
        windowEl._browserInstance.refresh();
    }
}

function browserHome() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._browserInstance) {
        windowEl._browserInstance.goHome();
    }
}

function browserGo() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._browserInstance) {
        const url = windowEl._browserInstance.urlInputEl.value;
        windowEl._browserInstance.navigate(url);
    }
}

function browserGoTo(url) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._browserInstance) {
        windowEl._browserInstance.goTo(url);
    }
}

function browserOpenExternal(url) {
    window.open(url, '_blank');
}

function browserCopyUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        showNotification('URL disalin ke clipboard', 'success');
    });
}

function browserBookmarks() {
    console.log('Bookmarks clicked');
}

function browserMenu() {
    console.log('Menu clicked');
}

function handleBrowserUrl(event) {
    if (event.key === 'Enter') {
        browserGo();
    }
}

function handleBrowserSearch(event) {
    if (event.key === 'Enter') {
        const windowEl = document.querySelector('.window.focused');
        if (windowEl && windowEl._browserInstance) {
            windowEl._browserInstance.search(event.target.value);
        }
    }
}
