/**
 * WebOS Settings Application
 */

class Settings {
    constructor(windowId) {
        this.windowId = windowId;
        this.settings = this.loadSettings();
        
        this.contentEl = null;
        
        setTimeout(() => this.init(), 50);
    }

    init() {
        const windowEl = document.querySelector(`[data-window-id="${this.windowId}"]`);
        if (!windowEl) return;
        
        this.contentEl = windowEl.querySelector('.settings-content');
        
        this.showPage('personalization');
    }

    loadSettings() {
        const stored = localStorage.getItem('webos_settings');
        return stored ? JSON.parse(stored) : {
            wallpaper: 'gradient1',
            theme: 'dark',
            username: 'User'
        };
    }

    saveSettings() {
        localStorage.setItem('webos_settings', JSON.stringify(this.settings));
    }

    showPage(page) {
        if (!this.contentEl) return;
        
        const pages = {
            personalization: this.getPersonalizationPage(),
            display: this.getDisplayPage(),
            sound: this.getSoundPage(),
            network: this.getNetworkPage(),
            user: this.getUserPage(),
            about: this.getAboutPage()
        };

        this.contentEl.innerHTML = pages[page] || pages['personalization'];
    }

    getPersonalizationPage() {
        return `
            <div class="settings-section">
                <h2>Personalisasi</h2>
                <div class="settings-group">
                    <h3>Wallpaper</h3>
                    <div class="settings-color-grid">
                        <div class="settings-color-item ${this.settings.wallpaper === 'gradient1' ? 'active' : ''}" 
                             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
                             onclick="changeWallpaper('gradient1')"></div>
                        <div class="settings-color-item ${this.settings.wallpaper === 'gradient2' ? 'active' : ''}" 
                             style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"
                             onclick="changeWallpaper('gradient2')"></div>
                        <div class="settings-color-item ${this.settings.wallpaper === 'gradient3' ? 'active' : ''}" 
                             style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"
                             onclick="changeWallpaper('gradient3')"></div>
                        <div class="settings-color-item ${this.settings.wallpaper === 'gradient4' ? 'active' : ''}" 
                             style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);"
                             onclick="changeWallpaper('gradient4')"></div>
                        <div class="settings-color-item ${this.settings.wallpaper === 'gradient5' ? 'active' : ''}" 
                             style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);"
                             onclick="changeWallpaper('gradient5')"></div>
                        <div class="settings-color-item ${this.settings.wallpaper === 'gradient6' ? 'active' : ''}" 
                             style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);"
                             onclick="changeWallpaper('gradient6')"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getDisplayPage() {
        return `
            <div class="settings-section">
                <h2>Tampilan</h2>
                <div class="settings-group">
                    <h3>Teks</h3>
                    <div class="settings-item">
                        <label>Ukuran Font</label>
                        <select class="settings-select">
                            <option value="12">Kecil</option>
                            <option value="14" selected>Normal</option>
                            <option value="16">Besar</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    getSoundPage() {
        return `
            <div class="settings-section">
                <h2>Suara</h2>
                <div class="settings-group">
                    <h3>Pengaturan</h3>
                    <div class="settings-item">
                        <label>Efek Suara</label>
                        <div class="settings-toggle active"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getNetworkPage() {
        return `
            <div class="settings-section">
                <h2>Jaringan</h2>
                <div class="settings-group">
                    <h3>Koneksi</h3>
                    <div class="settings-item">
                        <label>Wi-Fi</label>
                        <span style="color: #4caf50;">Terhubung</span>
                    </div>
                    <div class="settings-item">
                        <label>IP Address</label>
                        <span>192.168.1.100</span>
                    </div>
                </div>
            </div>
        `;
    }

    getUserPage() {
        return `
            <div class="settings-section">
                <h2>Pengguna</h2>
                <div class="settings-group">
                    <h3>Profil</h3>
                    <div class="settings-item">
                        <label>Nama</label>
                        <input type="text" class="settings-input" value="${this.settings.username}" onchange="changeUsername(this.value)">
                    </div>
                </div>
            </div>
        `;
    }

    getAboutPage() {
        return `
            <div class="settings-section">
                <h2>Tentang WebOS</h2>
                <div class="settings-group">
                    <div class="about-logo">
                        <i class="fas fa-desktop" style="font-size: 48px; color: #0078d4;"></i>
                        <div>
                            <h1 style="font-size: 24px;">WebOS</h1>
                            <p class="about-version" style="color: #666;">Versi 1.0.0</p>
                        </div>
                    </div>
                </div>
                <div class="settings-group">
                    <h3>Informasi Sistem</h3>
                    <div class="settings-item">
                        <label>Kernel</label>
                        <span>5.15.0-webos</span>
                    </div>
                    <div class="settings-item">
                        <label>Memori</label>
                        <span>8 GB</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global functions
function showSettingsPage(page) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._settingsInstance) {
        windowEl._settingsInstance.showPage(page);
    }
}

function changeWallpaper(wallpaper) {
    const desktop = document.getElementById('desktop');
    const gradients = {
        'gradient1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient6': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    };
    
    if (desktop && gradients[wallpaper]) {
        desktop.style.background = gradients[wallpaper];
    }
    
    // Update active state
    document.querySelectorAll('.settings-color-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
}

function changeUsername(name) {
    document.querySelectorAll('#username, #start-username, #lock-username').forEach(el => {
        if (el) el.textContent = name;
    });
}
