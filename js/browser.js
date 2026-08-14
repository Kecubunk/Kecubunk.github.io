/**
 * WebOS Browser Application
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
        
        setTimeout(() => this.init(), 50);
    }

    init() {
        const windowEl = document.querySelector(`[data-window-id="${this.windowId}"]`);
        if (!windowEl) {
            console.error('Browser: Window not found');
            return;
        }
        
        this.urlInputEl = windowEl.querySelector('.browser-url-input');
        this.iframeEl = windowEl.querySelector('.browser-iframe');
        this.homepageEl = windowEl.querySelector('.browser-homepage');
        this.statusEl = windowEl.querySelector('.browser-status-text');
        
        if (!this.urlInputEl || !this.iframeEl || !this.homepageEl) {
            console.error('Browser: Elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.updateStatus('Ready');
    }

    setupEventListeners() {
        // URL input enter key
        this.urlInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.navigate(this.urlInputEl.value);
            }
        });
        
        // iframe load
        this.iframeEl.addEventListener('load', () => {
            this.updateStatus('Done');
        });
    }

    navigate(url) {
        if (!url) return;
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        this.currentUrl = url;
        this.urlInputEl.value = url;
        
        // Add to history
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(url);
        this.historyIndex = this.history.length - 1;

        // Check if site blocks iframe embedding
        const blockedSites = ['youtube.com', 'www.youtube.com', 'youtu.be', 'netflix.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com'];
        const urlObj = new URL(url);
        const isBlocked = blockedSites.some(site => urlObj.hostname.includes(site));
        
        if (isBlocked) {
            // Show info message instead of iframe
            this.homepageEl.style.display = 'block';
            this.homepageEl.innerHTML = `
                <div class="browser-homepage-content">
                    <h1>🔒 Situs Dibatasi</h1>
                    <div class="browser-search-box" style="background: #f5f5f5; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                        <p style="margin-bottom: 15px; color: #333;">
                            <strong>${urlObj.hostname}</strong> tidak mengizinkan tampilan dalam iframe untuk alasan keamanan.
                        </p>
                        <p style="margin-bottom: 20px; color: #666;">
                            Klik tombol di bawah untuk membuka di tab baru:
                        </p>
                        <button onclick="window.open('${url}', '_blank')" style="
                            padding: 12px 30px;
                            background: #0078d4;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas fa-external-link-alt"></i>
                            Buka ${urlObj.hostname} di Tab Baru
                        </button>
                    </div>
                    <p style="color: #888; font-size: 13px;">
                        Tip: Anda juga bisa menyalin URL dan membukanya di browser utama Anda.
                    </p>
                </div>
            `;
            this.iframeEl.style.display = 'none';
            this.updateStatus('Situs dibatasi - ' + url);
        } else {
            // Try to load in iframe
            this.homepageEl.style.display = 'none';
            this.iframeEl.style.display = 'block';
            this.updateStatus('Loading ' + url + '...');
            
            try {
                this.iframeEl.src = url;
            } catch (e) {
                this.updateStatus('Error loading page');
            }
        }
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.navigate(this.history[this.historyIndex]);
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.navigate(this.history[this.historyIndex]);
        }
    }

    refresh() {
        if (this.currentUrl) {
            this.updateStatus('Refreshing...');
            this.iframeEl.src = this.currentUrl;
        }
    }

    goHome() {
        this.currentUrl = '';
        this.urlInputEl.value = '';
        this.homepageEl.style.display = 'block';
        this.homepageEl.innerHTML = `
            <div class="browser-homepage-content">
                <h1>WebOS Browser</h1>
                <div class="browser-search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Cari di web..." onkeypress="handleBrowserSearch(event)">
                </div>
                <div class="browser-bookmarks-grid">
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.google.com')">
                        <div class="bookmark-icon"><i class="fab fa-google"></i></div>
                        <span>Google</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.youtube.com')">
                        <div class="bookmark-icon"><i class="fab fa-youtube"></i></div>
                        <span>YouTube</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.github.com')">
                        <div class="bookmark-icon"><i class="fab fa-github"></i></div>
                        <span>GitHub</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.wikipedia.org')">
                        <div class="bookmark-icon"><i class="fab fa-wikipedia-w"></i></div>
                        <span>Wikipedia</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.stackoverflow.com')">
                        <div class="bookmark-icon"><i class="fab fa-stack-overflow"></i></div>
                        <span>Stack Overflow</span>
                    </div>
                    <div class="browser-bookmark" onclick="browserGoTo('https://www.reddit.com')">
                        <div class="bookmark-icon"><i class="fab fa-reddit"></i></div>
                        <span>Reddit</span>
                    </div>
                </div>
            </div>
        `;
        this.iframeEl.style.display = 'none';
        this.iframeEl.src = '';
        this.updateStatus('Ready');
    }

    goTo(url) {
        this.navigate(url);
    }

    search(query) {
        const url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
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
