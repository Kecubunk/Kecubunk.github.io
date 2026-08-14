/**
 * WebOS File Manager Application
 */

class FileManager {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentPath = '/home/user';
        this.history = ['/home/user'];
        this.historyIndex = 0;
        this.selectedItems = [];
        
        this.contentEl = null;
        this.pathInputEl = null;
        this.statusEl = null;
        
        setTimeout(() => this.init(), 50);
    }

    init() {
        const windowEl = document.querySelector(`[data-window-id="${this.windowId}"]`);
        if (!windowEl) {
            console.error('FileManager: Window not found');
            return;
        }
        
        this.contentEl = windowEl.querySelector('.filemanager-content');
        this.pathInputEl = windowEl.querySelector('.fm-path-input');
        this.statusEl = windowEl.querySelector('.fm-status-text');
        
        if (!this.contentEl) {
            console.error('FileManager: Content element not found');
            return;
        }
        
        this.navigate('/home/user');
    }

    navigate(path) {
        const normalizedPath = fs.normalizePath(path);
        const result = fs.listDir(normalizedPath);
        
        if (result.error) {
            this.showNotification(result.error, 'error');
            return;
        }

        this.currentPath = normalizedPath;
        if (this.pathInputEl) this.pathInputEl.value = normalizedPath;
        
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(normalizedPath);
        this.historyIndex = this.history.length - 1;
        
        this.selectedItems = [];
        this.render(result.items);
        this.updateStatus(result.items.length);
    }

    render(items) {
        if (!this.contentEl) return;
        
        this.contentEl.innerHTML = '';
        
        // Filter hidden files
        items = items.filter(item => !item.name.startsWith('.'));

        for (const item of items) {
            const itemEl = this.createItemElement(item);
            this.contentEl.appendChild(itemEl);
        }

        if (items.length === 0) {
            this.contentEl.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">Folder is empty</div>';
        }
    }

    createItemElement(item) {
        const itemEl = document.createElement('div');
        itemEl.className = 'fm-item';
        itemEl.dataset.path = item.path;

        const icon = this.getItemIcon(item);
        
        itemEl.innerHTML = `
            <div class="fm-item-icon ${icon.class}">
                <i class="${icon.icon}"></i>
            </div>
            <div class="fm-item-name">${item.name}</div>
        `;

        itemEl.addEventListener('click', () => {
            this.clearSelection();
            itemEl.classList.add('selected');
            this.updateSelectedItems();
        });

        itemEl.addEventListener('dblclick', () => {
            this.openItem(item);
        });

        return itemEl;
    }

    getItemIcon(item) {
        if (item.type === 'directory') {
            return { icon: 'fas fa-folder', class: 'folder' };
        }
        return { icon: 'fas fa-file', class: 'file' };
    }

    openItem(item) {
        if (item.type === 'directory') {
            this.navigate(item.path);
        } else {
            this.showNotification('Opening file: ' + item.name, 'info');
        }
    }

    clearSelection() {
        if (!this.contentEl) return;
        this.contentEl.querySelectorAll('.fm-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        this.selectedItems = [];
    }

    updateSelectedItems() {
        this.selectedItems = [];
        if (!this.contentEl) return;
        this.contentEl.querySelectorAll('.fm-item.selected').forEach(itemEl => {
            this.selectedItems.push({
                path: itemEl.dataset.path
            });
        });
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPath = this.history[this.historyIndex];
            if (this.pathInputEl) this.pathInputEl.value = this.currentPath;
            
            const result = fs.listDir(this.currentPath);
            if (result.items) {
                this.render(result.items);
                this.updateStatus(result.items.length);
            }
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentPath = this.history[this.historyIndex];
            if (this.pathInputEl) this.pathInputEl.value = this.currentPath;
            
            const result = fs.listDir(this.currentPath);
            if (result.items) {
                this.render(result.items);
                this.updateStatus(result.items.length);
            }
        }
    }

    goUp() {
        const parentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
        this.navigate(parentPath);
    }

    refresh() {
        const result = fs.listDir(this.currentPath);
        if (result.items) {
            this.render(result.items);
            this.updateStatus(result.items.length);
        }
    }

    goTo(path) {
        this.navigate(path);
    }

    createFolder() {
        const name = prompt('Enter folder name:');
        if (name) {
            const result = fs.mkdir(this.currentPath + '/' + name);
            if (result.error) {
                this.showNotification(result.error, 'error');
            } else {
                this.refresh();
            }
        }
    }

    createFile() {
        const name = prompt('Enter file name:');
        if (name) {
            const result = fs.touch(this.currentPath + '/' + name);
            if (result.error) {
                this.showNotification(result.error, 'error');
            } else {
                this.refresh();
            }
        }
    }

    showNotification(message, type) {
        console.log(`[${type}] ${message}`);
        alert(message);
    }

    updateStatus(count) {
        if (this.statusEl) {
            this.statusEl.textContent = `${count} items`;
        }
    }
}

// Global functions
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
