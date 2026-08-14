/**
 * WebOS Window Management System
 */

let windowCounter = 0;
let activeWindowId = null;
let windows = {};
let zIndexCounter = 100;

// Open a new application window
function openApp(appName) {
    const windowId = 'window-' + (++windowCounter);
    const template = document.getElementById('window-template');
    const appTemplate = document.getElementById(appName + '-template');
    
    if (!template || !appTemplate) {
        console.error('Template not found for:', appName);
        return;
    }

    // Clone window template
    const windowEl = template.content.cloneNode(true).querySelector('.window');
    windowEl.dataset.windowId = windowId;
    windowEl.dataset.appName = appName;

    // Set window properties based on app
    const appConfig = getAppConfig(appName);
    windowEl.querySelector('.window-title-text').textContent = appConfig.title;
    windowEl.querySelector('.window-icon').className = 'window-icon fas ' + appConfig.icon;
    
    // Set initial position and size
    windowEl.style.width = appConfig.width + 'px';
    windowEl.style.height = appConfig.height + 'px';
    windowEl.style.left = (100 + (windowCounter % 5) * 30) + 'px';
    windowEl.style.top = (50 + (windowCounter % 5) * 30) + 'px';
    windowEl.style.zIndex = ++zIndexCounter;

    // Append app content
    const appContent = appTemplate.content.cloneNode(true);
    windowEl.querySelector('.window-body').appendChild(appContent);

    // Add to container
    document.getElementById('windows-container').appendChild(windowEl);

    // Setup window events
    setupWindowEvents(windowEl);

    // Add to taskbar
    addTaskbarApp(windowId, appName, appConfig);

    // Store window reference
    windows[windowId] = {
        element: windowEl,
        appName: appName,
        minimized: false,
        maximized: false
    };

    // Initialize app
    initializeApp(appName, windowId);

    // Focus the window
    focusWindow(windowId);

    // Hide start menu
    document.getElementById('start-menu').classList.add('hidden');

    return windowId;
}

function getAppConfig(appName) {
    const configs = {
        terminal: {
            title: 'Terminal',
            icon: 'fa-terminal',
            width: 800,
            height: 500
        },
        filemanager: {
            title: 'File Manager',
            icon: 'fa-folder',
            width: 900,
            height: 600
        },
        calculator: {
            title: 'Calculator',
            icon: 'fa-calculator',
            width: 320,
            height: 480
        },
        browser: {
            title: 'Browser',
            icon: 'fa-globe',
            width: 1000,
            height: 700
        },
        notepad: {
            title: 'Notepad',
            icon: 'fa-file-alt',
            width: 700,
            height: 500
        },
        settings: {
            title: 'Settings',
            icon: 'fa-cog',
            width: 800,
            height: 500
        }
    };

    return configs[appName] || { title: 'Application', icon: 'fa-window-maximize', width: 600, height: 400 };
}

function setupWindowEvents(windowEl) {
    const header = windowEl.querySelector('.window-header');
    const minimizeBtn = windowEl.querySelector('.window-btn.minimize');
    const maximizeBtn = windowEl.querySelector('.window-btn.maximize');
    const closeBtn = windowEl.querySelector('.window-btn.close');
    const resizeHandle = windowEl.querySelector('.window-resize-handle');

    // Drag functionality
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        
        isDragging = true;
        dragOffsetX = e.clientX - windowEl.offsetLeft;
        dragOffsetY = e.clientY - windowEl.offsetTop;
        
        focusWindow(windowEl.dataset.windowId);
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        let newX = e.clientX - dragOffsetX;
        let newY = e.clientY - dragOffsetY;

        // Keep window within bounds
        newX = Math.max(0, Math.min(newX, window.innerWidth - 100));
        newY = Math.max(0, Math.min(newY, window.innerHeight - 100));

        windowEl.style.left = newX + 'px';
        windowEl.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Resize functionality
    let isResizing = false;
    let resizeStartX = 0;
    let resizeStartY = 0;
    let resizeStartWidth = 0;
    let resizeStartHeight = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartWidth = windowEl.offsetWidth;
        resizeStartHeight = windowEl.offsetHeight;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const newWidth = resizeStartWidth + (e.clientX - resizeStartX);
        const newHeight = resizeStartHeight + (e.clientY - resizeStartY);

        windowEl.style.width = Math.max(300, newWidth) + 'px';
        windowEl.style.height = Math.max(200, newHeight) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

    // Button events
    minimizeBtn.addEventListener('click', () => {
        minimizeWindow(windowEl.dataset.windowId);
    });

    maximizeBtn.addEventListener('click', () => {
        toggleMaximize(windowEl.dataset.windowId);
    });

    closeBtn.addEventListener('click', () => {
        closeWindow(windowEl.dataset.windowId);
    });

    // Focus on click
    windowEl.addEventListener('mousedown', () => {
        focusWindow(windowEl.dataset.windowId);
    });

    // Double click on header to maximize
    header.addEventListener('dblclick', (e) => {
        if (e.target.closest('.window-controls')) return;
        toggleMaximize(windowEl.dataset.windowId);
    });
}

function focusWindow(windowId) {
    // Remove focus from all windows
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('focused');
    });

    // Add focus to target window
    const windowEl = document.querySelector(`[data-window-id="${windowId}"]`);
    if (windowEl) {
        windowEl.classList.add('focused');
        windowEl.style.zIndex = ++zIndexCounter;
        activeWindowId = windowId;
    }

    // Update taskbar
    document.querySelectorAll('.taskbar-app').forEach(app => {
        app.classList.toggle('active', app.dataset.windowId === windowId);
    });
}

function minimizeWindow(windowId) {
    const windowData = windows[windowId];
    if (!windowData) return;

    windowData.minimized = true;
    windowData.element.style.display = 'none';

    // Update taskbar
    const taskbarApp = document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
    if (taskbarApp) {
        taskbarApp.classList.remove('active');
    }
}

function restoreWindow(windowId) {
    const windowData = windows[windowId];
    if (!windowData) return;

    windowData.minimized = false;
    windowData.element.style.display = 'flex';
    focusWindow(windowId);
}

function toggleMaximize(windowId) {
    const windowData = windows[windowId];
    if (!windowData) return;

    const windowEl = windowData.element;

    if (windowData.maximized) {
        // Restore
        windowEl.style.top = windowData.prevTop;
        windowEl.style.left = windowData.prevLeft;
        windowEl.style.width = windowData.prevWidth;
        windowEl.style.height = windowData.prevHeight;
        windowEl.classList.remove('maximized');
        windowData.maximized = false;
    } else {
        // Maximize
        windowData.prevTop = windowEl.style.top;
        windowData.prevLeft = windowEl.style.left;
        windowData.prevWidth = windowEl.style.width;
        windowData.prevHeight = windowEl.style.height;
        
        windowEl.classList.add('maximized');
        windowData.maximized = true;
    }
}

function closeWindow(windowId) {
    const windowData = windows[windowId];
    if (!windowData) return;

    // Remove from DOM
    windowData.element.remove();

    // Remove from taskbar
    const taskbarApp = document.querySelector(`.taskbar-app[data-window-id="${windowId}"]`);
    if (taskbarApp) {
        taskbarApp.remove();
    }

    // Remove from windows object
    delete windows[windowId];

    // Focus next window
    const remainingWindows = Object.keys(windows);
    if (remainingWindows.length > 0) {
        focusWindow(remainingWindows[remainingWindows.length - 1]);
    } else {
        activeWindowId = null;
    }
}

function addTaskbarApp(windowId, appName, config) {
    const taskbarApps = document.getElementById('taskbar-apps');
    
    const taskbarApp = document.createElement('div');
    taskbarApp.className = 'taskbar-app active';
    taskbarApp.dataset.windowId = windowId;
    taskbarApp.innerHTML = `
        <i class="fas ${config.icon}"></i>
        <span>${config.title}</span>
    `;

    taskbarApp.addEventListener('click', () => {
        const windowData = windows[windowId];
        if (windowData.minimized) {
            restoreWindow(windowId);
        } else if (activeWindowId === windowId) {
            minimizeWindow(windowId);
        } else {
            focusWindow(windowId);
        }
    });

    taskbarApps.appendChild(taskbarApp);
}

function initializeApp(appName, windowId) {
    const windowEl = document.querySelector(`[data-window-id="${windowId}"]`);
    
    switch (appName) {
        case 'terminal':
            windowEl._terminalInstance = new Terminal(windowId);
            break;
        case 'filemanager':
            windowEl._fmInstance = new FileManager(windowId);
            break;
        case 'calculator':
            windowEl._calcInstance = new Calculator(windowId);
            break;
        case 'browser':
            windowEl._browserInstance = new Browser(windowId);
            break;
        case 'notepad':
            windowEl._notepadInstance = new Notepad(windowId);
            break;
        case 'settings':
            windowEl._settingsInstance = new Settings(windowId);
            break;
    }
}
