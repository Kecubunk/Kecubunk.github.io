/**
 * WebOS Notepad Application
 * Uses virtual filesystem (filesystem.js)
 */

class Notepad {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentFile = null;
        this.currentPath = '/home/user';
        this.modified = false;
        
        this.textareaEl = null;
        this.statusEl = null;
        
        setTimeout(() => this.init(), 50);
    }

    init() {
        const windowEl = document.querySelector(`[data-window-id="${this.windowId}"]`);
        if (!windowEl) return;
        
        this.textareaEl = windowEl.querySelector('.notepad-textarea');
        this.statusEl = windowEl.querySelector('.np-status-text');
        
        if (this.textareaEl) {
            this.textareaEl.addEventListener('input', () => {
                this.modified = true;
                this.updateStatus();
            });
            
            this.textareaEl.addEventListener('click', () => this.updateStatus());
            this.textareaEl.addEventListener('keyup', () => this.updateStatus());
        }
        
        this.updateStatus();
    }

    newFile() {
        if (this.modified) {
            if (confirm('Simpan perubahan?')) {
                this.save();
            }
        }
        if (this.textareaEl) this.textareaEl.value = '';
        this.currentFile = null;
        this.modified = false;
        this.updateStatus();
    }

    open() {
        // Show file browser dialog
        this.showOpenDialog();
    }

    showOpenDialog() {
        // Create modal dialog
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.innerHTML = `
            <div class="dialog-modal" style="min-width: 500px;">
                <div class="dialog-header">
                    <h3><i class="fas fa-folder-open"></i> Buka File</h3>
                    <button class="dialog-close" onclick="this.closest('.dialog-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="dialog-body">
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <input type="text" class="dialog-path-input" placeholder="Path file..." 
                               style="flex: 1; padding: 8px; background: #1e1e1e; border: 1px solid #3d3d3d; border-radius: 4px; color: #f0f0f0;">
                    </div>
                    <div class="dialog-file-list" style="height: 250px; overflow-y: auto; background: #1e1e1e; border-radius: 4px; padding: 10px;">
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn secondary" onclick="this.closest('.dialog-overlay').remove()">Batal</button>
                    <button class="dialog-btn primary" onclick="notepadDialogOpen()">Buka</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Store reference
        window._notepadOpenDialog = {
            instance: this,
            pathInput: overlay.querySelector('.dialog-path-input'),
            fileList: overlay.querySelector('.dialog-file-list'),
            overlay: overlay
        };
        
        // Load initial directory
        this.loadFileDialog('/home/user');
    }

    loadFileDialog(path) {
        if (!window._notepadOpenDialog) return;
        
        const dialog = window._notepadOpenDialog;
        dialog.pathInput.value = path;
        
        const result = fs.listDir(path);
        if (result.error) {
            dialog.fileList.innerHTML = `<div style="color: #f44336; padding: 10px;">${result.error}</div>`;
            return;
        }
        
        let html = '';
        
        // Add parent directory
        if (path !== '/') {
            html += `<div class="dialog-file-item" onclick="notepadFileDialogNavigate('${path}/..')" 
                     style="padding: 8px 10px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; gap: 10px;">
                     <i class="fas fa-folder" style="color: #ffc107;"></i>
                     <span>..</span>
                     </div>`;
        }
        
        result.items.forEach(item => {
            const icon = item.type === 'directory' ? 'fa-folder' : 'fa-file';
            const color = item.type === 'directory' ? '#ffc107' : '#888';
            const fullPath = path === '/' ? '/' + item.name : path + '/' + item.name;
            
            if (item.type === 'directory') {
                html += `<div class="dialog-file-item" onclick="notepadFileDialogNavigate('${fullPath}')" 
                         style="padding: 8px 10px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; gap: 10px;">
                         <i class="fas ${icon}" style="color: ${color};"></i>
                         <span>${item.name}</span>
                         </div>`;
            } else {
                html += `<div class="dialog-file-item" onclick="notepadFileDialogSelect('${fullPath}')" 
                         style="padding: 8px 10px; cursor: pointer; border-radius: 4px; display: flex; align-items: center; gap: 10px;">
                         <i class="fas ${icon}" style="color: ${color};"></i>
                         <span>${item.name}</span>
                         </div>`;
            }
        });
        
        dialog.fileList.innerHTML = html;
    }

    openFile(path) {
        const result = fs.readFile(path);
        if (result.error) {
            alert(result.error);
            return;
        }
        
        if (this.textareaEl) {
            this.textareaEl.value = result.content;
        }
        this.currentFile = path;
        this.modified = false;
        this.updateStatus();
        
        showNotification(`File dibuka: ${path}`, 'success');
    }

    save() {
        if (!this.currentFile) {
            this.saveAs();
        } else {
            this.saveFile(this.currentFile);
        }
    }

    saveAs() {
        // Show save dialog
        const filename = prompt('Masukkan nama file:', this.currentFile || 'untitled.txt');
        if (filename) {
            // Determine path
            let path = filename;
            if (!filename.startsWith('/')) {
                path = this.currentPath + '/' + filename;
            }
            this.saveFile(path);
            this.currentFile = path;
        }
    }

    saveFile(path) {
        if (!this.textareaEl) return;
        
        const content = this.textareaEl.value;
        const result = fs.writeFile(path, content);
        
        if (result.error) {
            alert(result.error);
            return;
        }
        
        this.modified = false;
        this.updateStatus();
        showNotification(`File disimpan: ${path}`, 'success');
    }

    cut() {
        if (!this.textareaEl) return;
        
        const start = this.textareaEl.selectionStart;
        const end = this.textareaEl.selectionEnd;
        const selected = this.textareaEl.value.substring(start, end);
        
        navigator.clipboard.writeText(selected);
        this.textareaEl.value = this.textareaEl.value.substring(0, start) + this.textareaEl.value.substring(end);
        this.textareaEl.selectionStart = this.textareaEl.selectionEnd = start;
        this.modified = true;
        this.updateStatus();
    }

    copy() {
        if (!this.textareaEl) return;
        
        const selected = this.textareaEl.value.substring(this.textareaEl.selectionStart, this.textareaEl.selectionEnd);
        navigator.clipboard.writeText(selected);
    }

    paste() {
        navigator.clipboard.readText().then(text => {
            if (!this.textareaEl) return;
            
            const start = this.textareaEl.selectionStart;
            const end = this.textareaEl.selectionEnd;
            
            this.textareaEl.value = this.textareaEl.value.substring(0, start) + text + this.textareaEl.value.substring(end);
            this.textareaEl.selectionStart = this.textareaEl.selectionEnd = start + text.length;
            this.modified = true;
            this.updateStatus();
        });
    }

    setFontSize(size) {
        if (this.textareaEl) {
            this.textareaEl.style.fontSize = size + 'px';
        }
    }

    setFontColor(color) {
        if (this.textareaEl) {
            this.textareaEl.style.color = color;
        }
    }

    setBgColor(color) {
        if (this.textareaEl) {
            this.textareaEl.style.backgroundColor = color;
        }
    }

    updateStatus() {
        if (!this.statusEl || !this.textareaEl) return;
        
        const lines = this.textareaEl.value.substring(0, this.textareaEl.selectionStart).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        const chars = this.textareaEl.value.length;
        
        let status = `Baris: ${line} | Kolom: ${col} | Karakter: ${chars}`;
        if (this.currentFile) {
            status = `${this.currentFile}${this.modified ? '*' : ''} | ` + status;
        }
        
        this.statusEl.textContent = status;
    }
}

// Global functions
function notepadNew() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.newFile();
    }
}

function notepadOpen() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.open();
    }
}

function notepadSave() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.save();
    }
}

function notepadCut() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.cut();
    }
}

function notepadCopy() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.copy();
    }
}

function notepadPaste() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.paste();
    }
}

function notepadFontSize(size) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.setFontSize(size);
    }
}

function notepadFontColor(color) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.setFontColor(color);
    }
}

function notepadBgColor(color) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._notepadInstance) {
        windowEl._notepadInstance.setBgColor(color);
    }
}

// Dialog helper functions
function notepadFileDialogNavigate(path) {
    if (window._notepadOpenDialog) {
        window._notepadOpenDialog.instance.loadFileDialog(path);
    }
}

function notepadFileDialogSelect(path) {
    if (window._notepadOpenDialog) {
        window._notepadOpenDialog.pathInput.value = path;
        // Highlight selected
        const items = window._notepadOpenDialog.fileList.querySelectorAll('.dialog-file-item');
        items.forEach(item => item.style.background = '');
        event.target.closest('.dialog-file-item').style.background = 'rgba(0, 120, 212, 0.2)';
    }
}

function notepadDialogOpen() {
    if (window._notepadOpenDialog) {
        const path = window._notepadOpenDialog.pathInput.value;
        window._notepadOpenDialog.instance.openFile(path);
        window._notepadOpenDialog.overlay.remove();
        delete window._notepadOpenDialog;
    }
}
