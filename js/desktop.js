/**
 * WebOS Desktop System
 */

// Desktop initialization
function initDesktop() {
    updateClock();
    setInterval(updateClock, 1000);
    
    setupDesktopEvents();
    setupDesktopIcons();
    setupSidebarEvents();
    setupContextMenu();
    setupStartMenu();
    
    // Initialize sidebar
    initSidebar();
}

// Clock update
function updateClock() {
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        const now = new Date();
        const options = { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        };
        clockEl.textContent = now.toLocaleDateString('id-ID', options);
    }
}

// Desktop icon events
function setupDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    
    icons.forEach(icon => {
        // Single click to select
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            icons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });
        
        // Double click to open app
        icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const appName = icon.dataset.app;
            console.log('Opening app:', appName);
            if (appName) {
                openApp(appName);
            }
        });
    });
    
    // Click on desktop to deselect icons
    const desktop = document.getElementById('desktop');
    if (desktop) {
        desktop.addEventListener('click', (e) => {
            if (e.target.id === 'desktop' || e.target.id === 'desktop-icons' || e.target.closest('#desktop-icons') === null) {
                icons.forEach(i => i.classList.remove('selected'));
            }
        });
    }
}

// Sidebar events
function setupSidebarEvents() {
    const sidebarApps = document.querySelectorAll('.sidebar-app');
    
    sidebarApps.forEach(app => {
        app.addEventListener('click', () => {
            const appName = app.dataset.app;
            if (appName) {
                openApp(appName);
                document.getElementById('sidebar').classList.remove('visible');
            }
        });
    });
}

// Desktop events
function setupDesktopEvents() {
    const desktop = document.getElementById('desktop');
    const taskbar = document.getElementById('taskbar');
    
    // Click on desktop to close menus
    desktop.addEventListener('click', (e) => {
        if (e.target === desktop || e.target.id === 'desktop-icons') {
            document.getElementById('start-menu').classList.add('hidden');
            document.getElementById('context-menu').classList.add('hidden');
        }
    });
    
    // Desktop context menu
    desktop.addEventListener('contextmenu', (e) => {
        if (e.target === desktop || e.target.id === 'desktop-icons' || e.target.closest('#desktop-icons')) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY);
        }
    });
    
    // Taskbar events
    taskbar.addEventListener('click', () => {
        document.getElementById('context-menu').classList.add('hidden');
    });
}

// Context menu
function setupContextMenu() {
    document.addEventListener('click', () => {
        document.getElementById('context-menu').classList.add('hidden');
    });
}

function showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');
}

// Start menu
function setupStartMenu() {
    document.addEventListener('click', (e) => {
        const startMenu = document.getElementById('start-menu');
        const startButton = document.getElementById('start-button');
        
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.classList.add('hidden');
        }
    });
}

function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    menu.classList.toggle('hidden');
}

// Sidebar
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    let sidebarTimeout;
    
    // Show sidebar on edge hover
    document.addEventListener('mousemove', (e) => {
        if (e.clientX <= 10) {
            clearTimeout(sidebarTimeout);
            sidebar.classList.add('visible');
        } else if (!sidebar.contains(e.target) && sidebar.classList.contains('visible')) {
            sidebarTimeout = setTimeout(() => {
                sidebar.classList.remove('visible');
            }, 300);
        }
    });
    
    sidebar.addEventListener('mouseenter', () => {
        clearTimeout(sidebarTimeout);
    });
    
    sidebar.addEventListener('mouseleave', () => {
        sidebarTimeout = setTimeout(() => {
            sidebar.classList.remove('visible');
        }, 300);
    });
}

// Lock screen
function lockScreen() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('lock-screen').classList.remove('hidden');
    updateLockScreenTime();
}

function updateLockScreenTime() {
    const timeEl = document.getElementById('lock-time');
    const dateEl = document.getElementById('lock-date');
    
    if (timeEl && dateEl) {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
}

function handleLockPassword(event) {
    if (event.key === 'Enter') {
        unlockScreen();
    }
}

function unlockScreen() {
    document.getElementById('lock-screen').classList.add('hidden');
    document.getElementById('lock-password').value = '';
}

// Shutdown/Restart
function shutdownOS() {
    document.getElementById('start-menu').classList.add('hidden');
    document.getElementById('lock-screen').classList.add('hidden');
    document.getElementById('shutdown-screen').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('shutdown-screen').innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-power-off" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <p style="opacity: 0.5;">WebOS telah dimatikan</p>
                <button onclick="restartOS()" style="margin-top: 20px; padding: 10px 20px; background: #0078d4; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Nyalakan Kembali
                </button>
            </div>
        `;
    }, 2000);
}

function restartOS() {
    document.getElementById('shutdown-screen').classList.add('hidden');
    document.getElementById('boot-screen').classList.remove('hidden');
    document.getElementById('desktop').classList.add('hidden');
    
    setTimeout(() => {
        document.getElementById('boot-screen').classList.add('hidden');
        document.getElementById('desktop').classList.remove('hidden');
    }, 3500);
}

function refreshDesktop() {
    // Refresh desktop icons
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.style.animation = 'none';
        icon.offsetHeight; // Trigger reflow
        icon.style.animation = 'fadeIn 0.3s ease';
    });
    
    showNotification('Desktop refreshed', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <div class="notification-content">
            <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
            <p>${message}</p>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Toggle functions for taskbar
function toggleVolume() {
    showNotification('Volume controls', 'info');
}

function toggleWifi() {
    showNotification('Wi-Fi connected', 'success');
}

function toggleBattery() {
    showNotification('Battery: 85%', 'info');
}

// File manager global functions
function fileManagerGoBack() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._fmInstance) {
        windowEl._fmInstance.goBack();
    }
}

function fileManagerGoForward() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._fmInstance) {
        windowEl._fmInstance.goForward();
    }
}

function fileManagerGoUp() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._fmInstance) {
        windowEl._fmInstance.goUp();
    }
}

function fileManagerRefresh() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._fmInstance) {
        windowEl._fmInstance.refresh();
    }
}

function fileManagerGoTo(path) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._fmInstance) {
        windowEl._fmInstance.goTo(path);
    }
}

function fileManagerCreateFolder() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._fmInstance) {
        windowEl._fmInstance.createFolder();
    }
}

function fileManagerCreateFile() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._fmInstance) {
        windowEl._fmInstance.createFile();
    }
}
