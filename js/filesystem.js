/**
 * WebOS Virtual File System
 * Simulates a Linux-like file system with localStorage persistence
 */

class FileSystem {
    constructor() {
        this.storageKey = 'webos_filesystem';
        this.initializeFileSystem();
    }

    // Initialize the file system with default structure
    initializeFileSystem() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.files = JSON.parse(stored);
        } else {
            // Create default directory structure (Linux-like)
            this.files = {
                '/': {
                    type: 'directory',
                    name: '/',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var']
                },
                '/bin': {
                    type: 'directory',
                    name: 'bin',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['bash', 'cat', 'chmod', 'chown', 'cp', 'date', 'echo', 'grep', 'kill', 'ls', 'mkdir', 'mv', 'ps', 'pwd', 'rm', 'rmdir', 'sh', 'sleep', 'touch']
                },
                '/bin/bash': {
                    type: 'executable',
                    name: 'bash',
                    permissions: '-rwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: 1183448,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '#!/bin/bash'
                },
                '/bin/cat': {
                    type: 'executable',
                    name: 'cat',
                    permissions: '-rwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: 43416,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '#!/bin/sh'
                },
                '/bin/ls': {
                    type: 'executable',
                    name: 'ls',
                    permissions: '-rwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    size: 142144,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '#!/bin/sh'
                },
                '/boot': {
                    type: 'directory',
                    name: 'boot',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/dev': {
                    type: 'directory',
                    name: 'dev',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['null', 'zero', 'random', 'tty', 'console']
                },
                '/dev/null': {
                    type: 'character-device',
                    name: 'null',
                    permissions: 'crw-rw-rw-',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: ''
                },
                '/etc': {
                    type: 'directory',
                    name: 'etc',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['passwd', 'shadow', 'group', 'hosts', 'hostname', 'profile', 'bash.bashrc', 'fstab', 'issue', 'motd']
                },
                '/etc/passwd': {
                    type: 'file',
                    name: 'passwd',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 1234,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash'
                },
                '/etc/hostname': {
                    type: 'file',
                    name: 'hostname',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 6,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'webos'
                },
                '/etc/hosts': {
                    type: 'file',
                    name: 'hosts',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 256,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '127.0.0.1   localhost\n::1         localhost\n127.0.1.1   webos'
                },
                '/etc/motd': {
                    type: 'file',
                    name: 'motd',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 150,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '\nWelcome to WebOS!\nVersion 1.0.0\n\nType "help" for available commands.\n'
                },
                '/etc/profile': {
                    type: 'file',
                    name: 'profile',
                    permissions: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 512,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '# /etc/profile: system-wide .profile file for the Bourne shell\nexport PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"\nexport PS1="\\u@\\h:\\w\\$ "\n'
                },
                '/home': {
                    type: 'directory',
                    name: 'home',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['user']
                },
                '/home/user': {
                    type: 'directory',
                    name: 'user',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['Documents', 'Downloads', 'Pictures', 'Music', 'Videos', 'Desktop', '.bashrc', '.profile', '.config']
                },
                '/home/user/Documents': {
                    type: 'directory',
                    name: 'Documents',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['readme.txt', 'notes.txt']
                },
                '/home/user/Documents/readme.txt': {
                    type: 'file',
                    name: 'readme.txt',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: 256,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'Welcome to WebOS!\n\nThis is a web-based operating system simulation.\n\nFeatures:\n- Terminal with Linux commands\n- File Manager\n- Calculator\n- Web Browser\n- Notepad\n- Settings\n\nEnjoy exploring!'
                },
                '/home/user/Documents/notes.txt': {
                    type: 'file',
                    name: 'notes.txt',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: 50,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'My Notes\n========\n\n- Learn WebOS\n- Explore features'
                },
                '/home/user/Downloads': {
                    type: 'directory',
                    name: 'Downloads',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/home/user/Pictures': {
                    type: 'directory',
                    name: 'Pictures',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['wallpaper.png']
                },
                '/home/user/Pictures/wallpaper.png': {
                    type: 'file',
                    name: 'wallpaper.png',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: 1024000,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '[Binary Image Data]',
                    mimeType: 'image/png'
                },
                '/home/user/Music': {
                    type: 'directory',
                    name: 'Music',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/home/user/Videos': {
                    type: 'directory',
                    name: 'Videos',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/home/user/Desktop': {
                    type: 'directory',
                    name: 'Desktop',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/home/user/.bashrc': {
                    type: 'file',
                    name: '.bashrc',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: 3526,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '# ~/.bashrc: executed by bash for non-login shells.\n\nalias ll="ls -la"\nalias la="ls -A"\nalias l="ls -CF"\nalias cls="clear"\n\nexport PS1="\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ "\n'
                },
                '/home/user/.profile': {
                    type: 'file',
                    name: '.profile',
                    permissions: '-rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: 807,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '# ~/.profile: executed by the command interpreter for login shells.\n\nif [ -n "$BASH_VERSION" ]; then\n    if [ -f "$HOME/.bashrc" ]; then\n        . "$HOME/.bashrc"\n    fi\nfi\n'
                },
                '/home/user/.config': {
                    type: 'directory',
                    name: '.config',
                    permissions: 'drwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/lib': {
                    type: 'directory',
                    name: 'lib',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/media': {
                    type: 'directory',
                    name: 'media',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/mnt': {
                    type: 'directory',
                    name: 'mnt',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/opt': {
                    type: 'directory',
                    name: 'opt',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/proc': {
                    type: 'directory',
                    name: 'proc',
                    permissions: 'dr-xr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['cpuinfo', 'meminfo', 'version', 'uptime']
                },
                '/proc/cpuinfo': {
                    type: 'file',
                    name: 'cpuinfo',
                    permissions: '-r--r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel\t\t: 142\nmodel name\t: WebOS Virtual CPU\nstepping\t: 10\ncpu MHz\t\t: 2400.000\ncache size\t: 8192 KB\ncore id\t\t: 0\ncpu cores\t: 4\n'
                },
                '/proc/meminfo': {
                    type: 'file',
                    name: 'meminfo',
                    permissions: '-r--r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'MemTotal:        8192000 kB\nMemFree:         4096000 kB\nMemAvailable:    6144000 kB\nBuffers:          512000 kB\nCached:          1024000 kB\n'
                },
                '/proc/version': {
                    type: 'file',
                    name: 'version',
                    permissions: '-r--r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'WebOS version 1.0.0 (web-browser) (GCC 11.2.0) #1 SMP WebOS\n'
                },
                '/proc/uptime': {
                    type: 'file',
                    name: 'uptime',
                    permissions: '-r--r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 0,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: '0.00 0.00'
                },
                '/root': {
                    type: 'directory',
                    name: 'root',
                    permissions: 'drwx------',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/run': {
                    type: 'directory',
                    name: 'run',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/sbin': {
                    type: 'directory',
                    name: 'sbin',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/srv': {
                    type: 'directory',
                    name: 'srv',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/sys': {
                    type: 'directory',
                    name: 'sys',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/tmp': {
                    type: 'directory',
                    name: 'tmp',
                    permissions: 'drwxrwxrwt',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/usr': {
                    type: 'directory',
                    name: 'usr',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['bin', 'lib', 'local', 'sbin', 'share']
                },
                '/usr/bin': {
                    type: 'directory',
                    name: 'bin',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: []
                },
                '/var': {
                    type: 'directory',
                    name: 'var',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['log', 'tmp', 'cache']
                },
                '/var/log': {
                    type: 'directory',
                    name: 'log',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    children: ['syslog', 'auth.log']
                },
                '/var/log/syslog': {
                    type: 'file',
                    name: 'syslog',
                    permissions: '-rw-r-----',
                    owner: 'root',
                    group: 'adm',
                    size: 12345,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'WebOS syslog started\n'
                },
                '/var/log/auth.log': {
                    type: 'file',
                    name: 'auth.log',
                    permissions: '-rw-r-----',
                    owner: 'root',
                    group: 'adm',
                    size: 5432,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    content: 'user logged in\n'
                }
            };
            this.save();
        }
    }

    // Save file system to localStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.files));
            return true;
        } catch (e) {
            console.error('Failed to save file system:', e);
            return false;
        }
    }

    // Normalize path (resolve . and .. and remove trailing slashes)
    normalizePath(path) {
        if (!path || path === '') return '/';
        
        // Convert to absolute path if relative
        if (!path.startsWith('/')) {
            path = this.currentPath + '/' + path;
        }

        const parts = path.split('/').filter(p => p !== '' && p !== '.');
        const result = [];

        for (const part of parts) {
            if (part === '..') {
                result.pop();
            } else {
                result.push(part);
            }
        }

        return '/' + result.join('/');
    }

    // Get file/directory at path
    get(path) {
        const normalizedPath = this.normalizePath(path);
        return this.files[normalizedPath] || null;
    }

    // Check if path exists
    exists(path) {
        return this.get(path) !== null;
    }

    // Check if path is a directory
    isDirectory(path) {
        const item = this.get(path);
        return item && item.type === 'directory';
    }

    // Check if path is a file
    isFile(path) {
        const item = this.get(path);
        return item && (item.type === 'file' || item.type === 'executable');
    }

    // List directory contents
    listDir(path) {
        const normalizedPath = this.normalizePath(path);
        const dir = this.get(normalizedPath);
        
        if (!dir) {
            return { error: `ls: cannot access '${path}': No such file or directory` };
        }
        
        if (dir.type !== 'directory') {
            return { error: `ls: ${path}: Not a directory` };
        }

        const items = [];
        for (const child of dir.children) {
            const childPath = normalizedPath === '/' ? '/' + child : normalizedPath + '/' + child;
            const childItem = this.get(childPath);
            if (childItem) {
                items.push({
                    ...childItem,
                    path: childPath
                });
            }
        }
        
        return { items };
    }

    // Create directory
    mkdir(path, recursive = false) {
        const normalizedPath = this.normalizePath(path);
        const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/';
        const dirName = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);

        // Check if already exists
        if (this.exists(normalizedPath)) {
            return { error: `mkdir: cannot create directory '${path}': File exists` };
        }

        // Check parent exists
        const parent = this.get(parentPath);
        if (!parent) {
            if (recursive) {
                const result = this.mkdir(parentPath, true);
                if (result.error) return result;
            } else {
                return { error: `mkdir: cannot create directory '${path}': No such file or directory` };
            }
        }

        // Create directory
        this.files[normalizedPath] = {
            type: 'directory',
            name: dirName,
            permissions: 'drwxr-xr-x',
            owner: 'user',
            group: 'user',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            children: []
        };

        // Add to parent's children
        const newParent = this.get(parentPath);
        if (newParent && !newParent.children.includes(dirName)) {
            newParent.children.push(dirName);
            newParent.modified = new Date().toISOString();
        }

        this.save();
        return { success: true };
    }

    // Create file (touch)
    touch(path) {
        const normalizedPath = this.normalizePath(path);
        const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/';
        const fileName = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);

        // Check if already exists
        if (this.exists(normalizedPath)) {
            const file = this.get(normalizedPath);
            file.modified = new Date().toISOString();
            this.save();
            return { success: true };
        }

        // Check parent exists
        const parent = this.get(parentPath);
        if (!parent) {
            return { error: `touch: cannot touch '${path}': No such file or directory` };
        }

        if (parent.type !== 'directory') {
            return { error: `touch: cannot touch '${path}': Not a directory` };
        }

        // Create file
        this.files[normalizedPath] = {
            type: 'file',
            name: fileName,
            permissions: '-rw-r--r--',
            owner: 'user',
            group: 'user',
            size: 0,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            content: ''
        };

        // Add to parent's children
        if (!parent.children.includes(fileName)) {
            parent.children.push(fileName);
            parent.modified = new Date().toISOString();
        }

        this.save();
        return { success: true };
    }

    // Write content to file
    writeFile(path, content) {
        const normalizedPath = this.normalizePath(path);
        const file = this.get(normalizedPath);

        if (!file) {
            // Create file if it doesn't exist
            const result = this.touch(path);
            if (result.error) return result;
        }

        this.files[normalizedPath].content = content;
        this.files[normalizedPath].size = content.length;
        this.files[normalizedPath].modified = new Date().toISOString();
        
        this.save();
        return { success: true };
    }

    // Read file content
    readFile(path) {
        const normalizedPath = this.normalizePath(path);
        const file = this.get(normalizedPath);

        if (!file) {
            return { error: `cat: ${path}: No such file or directory` };
        }

        if (file.type === 'directory') {
            return { error: `cat: ${path}: Is a directory` };
        }

        return { content: file.content || '' };
    }

    // Remove file or directory
    remove(path, recursive = false) {
        const normalizedPath = this.normalizePath(path);
        const item = this.get(normalizedPath);

        if (!item) {
            return { error: `rm: cannot remove '${path}': No such file or directory` };
        }

        if (item.type === 'directory' && item.children.length > 0 && !recursive) {
            return { error: `rm: cannot remove '${path}': Is a directory` };
        }

        // If directory, remove all children recursively
        if (item.type === 'directory') {
            for (const child of item.children) {
                const childPath = normalizedPath === '/' ? '/' + child : normalizedPath + '/' + child;
                this.remove(childPath, true);
            }
        }

        // Remove from parent's children
        const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/';
        const parent = this.get(parentPath);
        const itemName = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1);
        
        if (parent) {
            parent.children = parent.children.filter(c => c !== itemName);
            parent.modified = new Date().toISOString();
        }

        // Remove from files
        delete this.files[normalizedPath];
        
        this.save();
        return { success: true };
    }

    // Copy file or directory
    copy(source, dest) {
        const normalizedSource = this.normalizePath(source);
        const normalizedDest = this.normalizePath(dest);
        
        const sourceItem = this.get(normalizedSource);
        if (!sourceItem) {
            return { error: `cp: cannot stat '${source}': No such file or directory` };
        }

        // Determine destination path
        let destPath = normalizedDest;
        const destItem = this.get(normalizedDest);
        
        if (destItem && destItem.type === 'directory') {
            destPath = normalizedDest === '/' ? '/' + sourceItem.name : normalizedDest + '/' + sourceItem.name;
        }

        // Create the copy
        const copy = JSON.parse(JSON.stringify(sourceItem));
        copy.created = new Date().toISOString();
        copy.modified = new Date().toISOString();
        
        this.files[destPath] = copy;

        // Add to destination parent's children
        const destParentPath = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
        const destParent = this.get(destParentPath);
        const destName = destPath.substring(destPath.lastIndexOf('/') + 1);
        
        if (destParent && !destParent.children.includes(destName)) {
            destParent.children.push(destName);
            destParent.modified = new Date().toISOString();
        }

        // If directory, copy children recursively
        if (sourceItem.type === 'directory') {
            for (const child of sourceItem.children) {
                const childSource = normalizedSource === '/' ? '/' + child : normalizedSource + '/' + child;
                const childDest = destPath === '/' ? '/' + child : destPath + '/' + child;
                this.copy(childSource, childDest);
            }
        }

        this.save();
        return { success: true };
    }

    // Move/rename file or directory
    move(source, dest) {
        const normalizedSource = this.normalizePath(source);
        const normalizedDest = this.normalizePath(dest);
        
        const sourceItem = this.get(normalizedSource);
        if (!sourceItem) {
            return { error: `mv: cannot stat '${source}': No such file or directory` };
        }

        // Determine destination path
        let destPath = normalizedDest;
        const destItem = this.get(normalizedDest);
        
        if (destItem && destItem.type === 'directory') {
            destPath = normalizedDest === '/' ? '/' + sourceItem.name : normalizedDest + '/' + sourceItem.name;
        }

        // Check if destination exists
        if (this.exists(destPath)) {
            // Remove existing destination
            this.remove(destPath, true);
        }

        // Copy to destination
        const result = this.copy(normalizedSource, destPath);
        if (result.error) return result;

        // Remove source
        this.remove(normalizedSource, true);
        
        this.save();
        return { success: true };
    }

    // Rename file or directory
    rename(path, newName) {
        const normalizedPath = this.normalizePath(path);
        const parentPath = normalizedPath.substring(0, normalizedPath.lastIndexOf('/')) || '/';
        const destPath = parentPath === '/' ? '/' + newName : parentPath + '/' + newName;
        
        return this.move(normalizedPath, destPath);
    }

    // Get file stats
    stat(path) {
        const normalizedPath = this.normalizePath(path);
        const item = this.get(normalizedPath);

        if (!item) {
            return { error: `stat: cannot stat '${path}': No such file or directory` };
        }

        return {
            ...item,
            path: normalizedPath
        };
    }

    // Change permissions
    chmod(path, mode) {
        const normalizedPath = this.normalizePath(path);
        const item = this.get(normalizedPath);

        if (!item) {
            return { error: `chmod: cannot access '${path}': No such file or directory` };
        }

        // Simple permission setting
        if (item.type === 'directory') {
            item.permissions = 'd' + mode;
        } else {
            item.permissions = '-' + mode;
        }

        item.modified = new Date().toISOString();
        this.save();
        return { success: true };
    }

    // Change owner
    chown(path, owner, group) {
        const normalizedPath = this.normalizePath(path);
        const item = this.get(normalizedPath);

        if (!item) {
            return { error: `chown: cannot access '${path}': No such file or directory` };
        }

        item.owner = owner;
        if (group) item.group = group;
        item.modified = new Date().toISOString();
        
        this.save();
        return { success: true };
    }

    // Find files
    find(path, pattern) {
        const normalizedPath = this.normalizePath(path);
        const results = [];
        const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');

        const searchDir = (dirPath) => {
            const dir = this.get(dirPath);
            if (!dir || dir.type !== 'directory') return;

            for (const child of dir.children) {
                const childPath = dirPath === '/' ? '/' + child : dirPath + '/' + child;
                const childItem = this.get(childPath);
                
                if (childItem) {
                    if (regex.test(child)) {
                        results.push(childPath);
                    }
                    if (childItem.type === 'directory') {
                        searchDir(childPath);
                    }
                }
            }
        };

        searchDir(normalizedPath);
        return results;
    }

    // Get disk usage
    du(path) {
        const normalizedPath = this.normalizePath(path);
        const item = this.get(normalizedPath);

        if (!item) {
            return { error: `du: cannot access '${path}': No such file or directory` };
        }

        let totalSize = 0;
        let fileCount = 0;
        let dirCount = 0;

        const calculate = (itemPath) => {
            const current = this.get(itemPath);
            if (!current) return;

            if (current.type === 'directory') {
                dirCount++;
                for (const child of current.children) {
                    calculate(itemPath === '/' ? '/' + child : itemPath + '/' + child);
                }
            } else {
                fileCount++;
                totalSize += current.size || 0;
            }
        };

        calculate(normalizedPath);

        return {
            size: totalSize,
            files: fileCount,
            directories: dirCount
        };
    }

    // Reset file system
    reset() {
        localStorage.removeItem(this.storageKey);
        this.initializeFileSystem();
        return { success: true };
    }
}

// Create global file system instance
const fs = new FileSystem();
