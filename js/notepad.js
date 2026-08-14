/**
 * WebOS Notepad Application
 */

class Notepad {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentFile = null;
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
            if (confirm('Save changes?')) {
                this.save();
            }
        }
        if (this.textareaEl) this.textareaEl.value = '';
        this.currentFile = null;
        this.modified = false;
        this.updateStatus();
    }

    open() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.md,.json,.js,.html,.css';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (this.textareaEl) {
                        this.textareaEl.value = event.target.result;
                    }
                    this.currentFile = file.name;
                    this.modified = false;
                    this.updateStatus();
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    save() {
        if (!this.currentFile) {
            this.saveAs();
        } else {
            this.downloadFile(this.currentFile);
        }
    }

    saveAs() {
        const filename = prompt('Enter filename:', 'untitled.txt');
        if (filename) {
            this.currentFile = filename;
            this.downloadFile(filename);
        }
    }

    downloadFile(filename) {
        if (!this.textareaEl) return;
        
        const blob = new Blob([this.textareaEl.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.modified = false;
        this.updateStatus();
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
