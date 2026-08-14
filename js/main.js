/**
 * WebOS Main Entry Point
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Start boot sequence
    startBoot();
});

// Boot sequence
function startBoot() {
    const bootScreen = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');
    
    // Simulate boot process
    setTimeout(() => {
        bootScreen.classList.add('hidden');
        desktop.classList.remove('hidden');
        
        // Initialize desktop
        initDesktop();
        
        console.log('WebOS initialized');
        console.log('Type "help" in terminal for available commands');
        
    }, 3500);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + F4 to close window
    if (e.altKey && e.key === 'F4') {
        e.preventDefault();
        if (typeof activeWindowId !== 'undefined' && activeWindowId) {
            closeWindow(activeWindowId);
        }
    }
    
    // Escape to close start menu
    if (e.key === 'Escape') {
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('context-menu').classList.add('hidden');
    }
    
    // Ctrl + Alt + T for terminal
    if (e.ctrlKey && e.altKey && e.key === 't') {
        e.preventDefault();
        openApp('terminal');
    }
    
    // Ctrl + Alt + F for file manager
    if (e.ctrlKey && e.altKey && e.key === 'f') {
        e.preventDefault();
        openApp('filemanager');
    }
});

// Window resize handler
window.addEventListener('resize', () => {
    document.querySelectorAll('.window').forEach(windowEl => {
        const rect = windowEl.getBoundingClientRect();
        
        if (rect.right > window.innerWidth) {
            windowEl.style.left = (window.innerWidth - rect.width - 20) + 'px';
        }
        
        if (rect.bottom > window.innerHeight - 48) {
            windowEl.style.top = (window.innerHeight - rect.height - 60) + 'px';
        }
    });
});

// Console welcome message
console.log('%c Welcome to WebOS! ', 'background: #0078d4; color: white; font-size: 20px; padding: 10px;');
