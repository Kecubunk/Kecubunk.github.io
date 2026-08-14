/**
 * WebOS Terminal Application - Simplified Version
 */

class Terminal {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentPath = '/home/user';
        this.homePath = '/home/user';
        this.history = [];
        this.historyIndex = -1;
        this.env = {
            USER: 'user',
            HOME: '/home/user',
            HOSTNAME: 'webos',
            PS1: '\\u@\\h:\\w\\$ '
        };
        this.aliases = {
            'll': 'ls -la',
            'la': 'ls -A',
            'cls': 'clear'
        };
        
        this.outputEl = null;
        this.promptEl = null;
        this.inputEl = null;
        
        // Wait for DOM
        setTimeout(() => this.init(), 50);
    }

    init() {
        const windowEl = document.querySelector(`[data-window-id="${this.windowId}"]`);
        if (!windowEl) {
            console.error('Terminal: Window element not found');
            return;
        }
        
        this.outputEl = windowEl.querySelector('.terminal-output');
        this.promptEl = windowEl.querySelector('.terminal-prompt');
        this.inputEl = windowEl.querySelector('.terminal-input');
        
        if (!this.outputEl || !this.promptEl || !this.inputEl) {
            console.error('Terminal: Elements not found', this.outputEl, this.promptEl, this.inputEl);
            return;
        }
        
        this.updatePrompt();
        this.setupEventListeners();
        this.printWelcome();
        this.inputEl.focus();
    }

    setupEventListeners() {
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = this.inputEl.value.trim();
                this.executeCommand(command);
                this.inputEl.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputEl.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.inputEl.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.inputEl.value = '';
                }
            } else if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                this.printLine('^C');
                this.inputEl.value = '';
                this.updatePrompt();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.clear();
            }
        });

        this.outputEl.parentElement.addEventListener('click', () => {
            this.inputEl.focus();
        });
    }

    printWelcome() {
        this.printLine('');
        this.printLine('\x1b[1;34mWelcome to WebOS Terminal\x1b[0m');
        this.printLine('Type "help" for available commands.');
        this.printLine('');
    }

    updatePrompt() {
        if (this.promptEl) {
            const prompt = this.env.PS1
                .replace(/\\u/g, this.env.USER)
                .replace(/\\h/g, this.env.HOSTNAME)
                .replace(/\\w/g, this.currentPath)
                .replace(/\\\$/g, '$');
            this.promptEl.textContent = prompt;
        }
    }

    executeCommand(commandLine) {
        if (!commandLine) {
            this.printLine('');
            this.updatePrompt();
            return;
        }

        this.history.push(commandLine);
        this.historyIndex = this.history.length;

        // Print the command
        const prompt = this.env.PS1
            .replace(/\\u/g, this.env.USER)
            .replace(/\\h/g, this.env.HOSTNAME)
            .replace(/\\w/g, this.currentPath)
            .replace(/\\\$/g, '$');
        this.printLine(prompt + commandLine);

        // Expand aliases
        const parts = commandLine.split(' ');
        if (this.aliases[parts[0]]) {
            parts[0] = this.aliases[parts[0]];
            commandLine = parts.join(' ');
        }

        // Parse command
        const tokens = this.tokenize(commandLine);
        const command = tokens[0];
        const args = [];
        const options = {};

        for (let i = 1; i < tokens.length; i++) {
            if (tokens[i].startsWith('--')) {
                options[tokens[i].substring(2)] = true;
            } else if (tokens[i].startsWith('-')) {
                for (const c of tokens[i].substring(1)) {
                    options[c] = true;
                }
            } else {
                args.push(tokens[i]);
            }
        }

        // Execute command
        this.runCommand(command, args, options);
        
        this.printLine('');
        this.updatePrompt();
    }

    tokenize(str) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (const char of str) {
            if (inQuotes) {
                if (char === quoteChar) {
                    inQuotes = false;
                    tokens.push(current);
                    current = '';
                } else {
                    current += char;
                }
            } else if (char === '"' || char === "'") {
                inQuotes = true;
                quoteChar = char;
            } else if (char === ' ') {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
        if (current) tokens.push(current);
        return tokens;
    }

    runCommand(cmd, args, opts) {
        const commands = {
            'help': () => this.cmdHelp(),
            'clear': () => this.clear(),
            'pwd': () => this.printLine(this.currentPath),
            'whoami': () => this.printLine(this.env.USER),
            'hostname': () => this.printLine(this.env.HOSTNAME),
            'date': () => this.printLine(new Date().toString()),
            'uptime': () => this.printLine(' 0:01 up 1 min, 1 user, load averages: 0.00 0.00 0.00'),
            'uname': () => this.cmdUname(args, opts),
            'id': () => this.printLine('uid=1000(user) gid=1000(user) groups=1000(user)'),
            'echo': () => this.printLine(args.join(' ')),
            'ls': () => this.cmdLs(args, opts),
            'cd': () => this.cmdCd(args),
            'cat': () => this.cmdCat(args),
            'mkdir': () => this.cmdMkdir(args, opts),
            'rmdir': () => this.cmdRmdir(args),
            'rm': () => this.cmdRm(args, opts),
            'touch': () => this.cmdTouch(args),
            'cp': () => this.cmdCp(args),
            'mv': () => this.cmdMv(args),
            'head': () => this.cmdHead(args, opts),
            'tail': () => this.cmdTail(args, opts),
            'wc': () => this.cmdWc(args, opts),
            'grep': () => this.cmdGrep(args),
            'find': () => this.cmdFind(args),
            'tree': () => this.cmdTree(args),
            'history': () => this.cmdHistory(),
            'exit': () => this.cmdExit(),
            'env': () => this.cmdEnv(),
            'export': () => this.cmdExport(args),
            'alias': () => this.cmdAlias(args),
            'ps': () => this.cmdPs(opts),
            'top': () => this.cmdTop(),
            'df': () => this.cmdDf(opts),
            'du': () => this.cmdDu(args),
            'free': () => this.cmdFree(),
            'ifconfig': () => this.cmdIfconfig(),
            'ip': () => this.cmdIp(args),
            'ping': () => this.cmdPing(args),
            'netstat': () => this.cmdNetstat(opts),
            'cal': () => this.cmdCal(),
            'neofetch': () => this.cmdNeofetch(),
            'cowsay': () => this.cmdCowsay(args),
            'fortune': () => this.cmdFortune(),
            'man': () => this.cmdMan(args),
            'which': () => this.cmdWhich(args),
            'type': () => this.cmdType(args),
            'stat': () => this.cmdStat(args),
            'file': () => this.cmdFile(args),
            'chmod': () => this.cmdChmod(args),
            'chown': () => this.cmdChown(args),
            'tar': () => this.cmdTar(args, opts),
            'gzip': () => this.cmdGzip(args),
            'gunzip': () => this.cmdGunzip(args),
            'history': () => this.cmdHistory()
        };

        if (commands[cmd]) {
            commands[cmd]();
        } else {
            this.printLine(`bash: ${cmd}: command not found`);
        }
    }

    // ===== Commands =====
    
    cmdHelp() {
        this.printLine('Available commands:');
        this.printLine('  Navigation: cd, pwd, ls, tree, find');
        this.printLine('  File ops:   cat, head, tail, touch, mkdir, rmdir, rm, cp, mv');
        this.printLine('  Text:       echo, grep, wc');
        this.printLine('  System:     uname, date, uptime, whoami, id, ps, top, df, du, free');
        this.printLine('  Network:    ping, ifconfig, ip, netstat');
        this.printLine('  Fun:        neofetch, cowsay, fortune, cal');
        this.printLine('  Other:      clear, history, help, exit');
    }

    cmdUname(args, opts) {
        if (opts.a) {
            this.printLine('Linux webos 5.15.0-webos #1 SMP x86_64 GNU/Linux');
        } else {
            this.printLine('Linux');
        }
    }

    cmdLs(args, opts) {
        let path = args[0] || '.';
        if (!path.startsWith('/')) {
            path = this.resolvePath(path);
        }

        const result = fs.listDir(path);
        if (result.error) {
            this.printLine(result.error);
            return;
        }

        const items = result.items.filter(i => !i.name.startsWith('.') || opts.a);

        if (opts.l) {
            this.printLine(`total ${items.length}`);
            items.forEach(item => {
                const perms = item.permissions || (item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--');
                const size = (item.size || 0).toString().padStart(8);
                const modified = new Date(item.modified || Date.now()).toLocaleDateString();
                const color = item.type === 'directory' ? '\x1b[1;34m' : '';
                const reset = '\x1b[0m';
                this.printLine(`${perms} 1 user user ${size} ${modified} ${color}${item.name}${reset}`);
            });
        } else {
            const names = items.map(i => i.type === 'directory' ? `\x1b[1;34m${i.name}\x1b[0m` : i.name);
            this.printLine(names.join('  '));
        }
    }

    cmdCd(args) {
        let target = args[0] || '~';
        if (target === '~') target = this.homePath;
        else if (target === '-') target = this.currentPath;
        else if (!target.startsWith('/')) target = this.resolvePath(target);

        const item = fs.get(target);
        if (!item) {
            this.printLine(`cd: ${args[0]}: No such file or directory`);
            return;
        }
        if (item.type !== 'directory') {
            this.printLine(`cd: ${args[0]}: Not a directory`);
            return;
        }
        this.currentPath = target;
    }

    cmdCat(args) {
        if (!args[0]) {
            this.printLine('cat: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        const result = fs.readFile(path);
        if (result.error) {
            this.printLine(result.error);
        } else {
            this.printLine(result.content);
        }
    }

    cmdMkdir(args, opts) {
        if (!args[0]) {
            this.printLine('mkdir: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        const result = fs.mkdir(path, opts.p);
        if (result.error) this.printLine(result.error);
    }

    cmdRmdir(args) {
        if (!args[0]) {
            this.printLine('rmdir: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        const result = fs.remove(path);
        if (result.error) this.printLine(result.error);
    }

    cmdRm(args, opts) {
        if (!args[0]) {
            this.printLine('rm: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        const item = fs.get(path);
        if (!item) {
            this.printLine(`rm: cannot remove '${args[0]}': No such file or directory`);
            return;
        }
        if (item.type === 'directory' && !opts.r) {
            this.printLine(`rm: cannot remove '${args[0]}': Is a directory`);
            return;
        }
        fs.remove(path, opts.r || opts.R);
    }

    cmdTouch(args) {
        if (!args[0]) {
            this.printLine('touch: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        fs.touch(path);
    }

    cmdCp(args) {
        if (args.length < 2) {
            this.printLine('cp: missing destination');
            return;
        }
        const src = this.resolvePath(args[0]);
        const dst = this.resolvePath(args[1]);
        const result = fs.copy(src, dst);
        if (result.error) this.printLine(result.error);
    }

    cmdMv(args) {
        if (args.length < 2) {
            this.printLine('mv: missing destination');
            return;
        }
        const src = this.resolvePath(args[0]);
        const dst = this.resolvePath(args[1]);
        const result = fs.move(src, dst);
        if (result.error) this.printLine(result.error);
    }

    cmdHead(args, opts) {
        if (!args[0]) {
            this.printLine('head: missing operand');
            return;
        }
        const lines = parseInt(opts.n) || 10;
        const path = this.resolvePath(args[0]);
        const result = fs.readFile(path);
        if (result.error) {
            this.printLine(result.error);
        } else {
            this.printLine(result.content.split('\n').slice(0, lines).join('\n'));
        }
    }

    cmdTail(args, opts) {
        if (!args[0]) {
            this.printLine('tail: missing operand');
            return;
        }
        const lines = parseInt(opts.n) || 10;
        const path = this.resolvePath(args[0]);
        const result = fs.readFile(path);
        if (result.error) {
            this.printLine(result.error);
        } else {
            this.printLine(result.content.split('\n').slice(-lines).join('\n'));
        }
    }

    cmdWc(args, opts) {
        if (!args[0]) {
            this.printLine('wc: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        const result = fs.readFile(path);
        if (result.error) {
            this.printLine(result.error);
        } else {
            const lines = result.content.split('\n').length;
            const words = result.content.split(/\s+/).filter(w => w).length;
            const chars = result.content.length;
            this.printLine(`${lines} ${words} ${chars} ${args[0]}`);
        }
    }

    cmdGrep(args) {
        if (args.length < 2) {
            this.printLine('grep: missing pattern or file');
            return;
        }
        const pattern = args[0];
        const path = this.resolvePath(args[1]);
        const result = fs.readFile(path);
        if (result.error) {
            this.printLine(result.error);
        } else {
            const regex = new RegExp(pattern);
            result.content.split('\n').forEach(line => {
                if (regex.test(line)) this.printLine(line);
            });
        }
    }

    cmdFind(args) {
        const startPath = args[0] || this.currentPath;
        const results = fs.find(startPath, '*');
        results.forEach(r => this.printLine(r));
    }

    cmdTree(args) {
        const path = args[0] || this.currentPath;
        this.printLine(path);
        this.printTree(path, '');
    }

    printTree(path, prefix) {
        const item = fs.get(path);
        if (!item || item.type !== 'directory') return;
        
        item.children.forEach((child, i) => {
            const isLast = i === item.children.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            this.printLine(prefix + connector + child);
            this.printTree(path + '/' + child, prefix + (isLast ? '    ' : '│   '));
        });
    }

    cmdHistory() {
        this.history.forEach((cmd, i) => this.printLine(`  ${i + 1}  ${cmd}`));
    }

    cmdExit() {
        closeWindow(this.windowId);
    }

    cmdEnv() {
        Object.entries(this.env).forEach(([k, v]) => this.printLine(`${k}=${v}`));
    }

    cmdExport(args) {
        if (args[0]) {
            const [k, v] = args[0].split('=');
            if (k) this.env[k] = v || '';
        }
    }

    cmdAlias(args) {
        if (args[0]) {
            const [k, v] = args[0].split('=');
            if (k && v) this.aliases[k] = v.replace(/^'|'$/g, '');
        } else {
            Object.entries(this.aliases).forEach(([k, v]) => this.printLine(`alias ${k}='${v}'`));
        }
    }

    cmdPs(opts) {
        if (opts.a || opts.aux) {
            this.printLine('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND');
            this.printLine('root         1  0.0  0.1 169424 11200 ?        Ss   00:00   0:00 /sbin/init');
            this.printLine('user       123  0.0  0.2 123456 20480 pts/0    Ss   00:00   0:00 -bash');
        } else {
            this.printLine('  PID TTY          TIME CMD');
            this.printLine('  123 pts/0    00:00:00 bash');
        }
    }

    cmdTop() {
        this.printLine(`top - ${new Date().toLocaleTimeString()} up 1 min, 1 user, load average: 0.00, 0.00, 0.00`);
        this.printLine('Tasks:   1 total,   1 running,   0 sleeping');
        this.printLine('%Cpu(s):  0.0 us,  0.0 sy, 100.0 id');
        this.printLine('MiB Mem: 8192.0 total, 4096.0 free, 2048.0 used');
    }

    cmdDf(opts) {
        if (opts.h) {
            this.printLine('Filesystem      Size  Used Avail Use% Mounted on');
            this.printLine('/dev/sda1        50G   15G   33G  32% /');
        } else {
            this.printLine('Filesystem     1K-blocks     Used Available Use% Mounted on');
            this.printLine('/dev/sda1       52428800 15728640  34603008  32% /');
        }
    }

    cmdDu(args) {
        const path = args[0] || '.';
        const result = fs.du(this.resolvePath(path));
        if (result.error) {
            this.printLine(result.error);
        } else {
            this.printLine(`${result.size}\t${path}`);
        }
    }

    cmdFree() {
        this.printLine('              total        used        free      shared  buff/cache   available');
        this.printLine('Mem:        8192000     2097152     4096000      131072     1048576     5767168');
        this.printLine('Swap:       2097152           0     2097152');
    }

    cmdIfconfig() {
        this.printLine('eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500');
        this.printLine('        inet 192.168.1.100  netmask 255.255.255.0');
        this.printLine('        ether 00:11:22:33:44:55');
    }

    cmdIp(args) {
        if (args[0] === 'addr' || args[0] === 'a') {
            this.cmdIfconfig();
        } else {
            this.printLine('Usage: ip [OPTIONS] OBJECT { COMMAND }');
        }
    }

    cmdPing(args) {
        if (!args[0]) {
            this.printLine('ping: missing host');
            return;
        }
        this.printLine(`PING ${args[0]} (127.0.0.1) 56 bytes of data.`);
        this.printLine(`64 bytes from ${args[0]}: icmp_seq=1 ttl=64 time=0.123 ms`);
    }

    cmdNetstat(opts) {
        if (opts.t || opts.l) {
            this.printLine('Active Internet connections');
            this.printLine('Proto Recv-Q Send-Q Local Address  Foreign Address  State');
            this.printLine('tcp        0      0 0.0.0.0:22     0.0.0.0:*        LISTEN');
        }
    }

    cmdCal() {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        this.printLine(`     ${['January','February','March','April','May','June','July','August','September','October','November','December'][month]} ${year}`);
        this.printLine('Su Mo Tu We Th Fr Sa');
        
        let line = '   '.repeat(firstDay);
        for (let d = 1; d <= days; d++) {
            line += d.toString().padStart(2, ' ') + ' ';
            if ((firstDay + d) % 7 === 0) {
                this.printLine(line);
                line = '';
            }
        }
        if (line) this.printLine(line);
    }

    cmdNeofetch() {
        this.printLine('        .--.        user@webos');
        this.printLine('       |o_o |       ----------');
        this.printLine('       |:_/ |       OS: WebOS 1.0');
        this.printLine('      //   \\ \\      Kernel: 5.15.0-webos');
        this.printLine('     (|     | )     Shell: bash');
        this.printLine('    /\'\\_   _/`\\      Terminal: WebOS');
        this.printLine('    \\___)=(___/      CPU: Virtual CPU (4) @ 2.4GHz');
    }

    cmdCowsay(args) {
        const text = args.join(' ') || 'Moo!';
        const border = '_'.repeat(text.length + 2);
        this.printLine(` ${border}`);
        this.printLine(`< ${text} >`);
        this.printLine(` ${border}`);
        this.printLine('        \\   ^__^');
        this.printLine('         \\  (oo)\\_______');
        this.printLine('            (__)\\       )\\/\\');
        this.printLine('                ||----w |');
        this.printLine('                ||     ||');
    }

    cmdFortune() {
        const quotes = [
            'A journey of a thousand miles begins with a single step.',
            'Code is like humor. When you have to explain it, it\'s bad.',
            'First, solve the problem. Then, write the code.'
        ];
        this.printLine(quotes[Math.floor(Math.random() * quotes.length)]);
    }

    cmdMan(args) {
        if (!args[0]) {
            this.printLine('What manual page do you want?');
            return;
        }
        const pages = {
            'ls': 'LS(1) - list directory contents',
            'cd': 'CD(1) - change directory',
            'cat': 'CAT(1) - concatenate files',
            'help': 'HELP(1) - show available commands'
        };
        this.printLine(pages[args[0]] || `No manual entry for ${args[0]}`);
    }

    cmdWhich(args) {
        if (!args[0]) {
            this.printLine('which: missing argument');
            return;
        }
        const bin = fs.get(`/bin/${args[0]}`);
        if (bin) {
            this.printLine(`/bin/${args[0]}`);
        } else {
            this.printLine(`${args[0]} not found`);
        }
    }

    cmdType(args) {
        if (!args[0]) return;
        if (this.aliases[args[0]]) {
            this.printLine(`${args[0]} is aliased to '${this.aliases[args[0]]}'`);
        } else if (fs.get(`/bin/${args[0]}`)) {
            this.printLine(`${args[0]} is /bin/${args[0]}`);
        } else {
            this.printLine(`${args[0]}: not found`);
        }
    }

    cmdStat(args) {
        if (!args[0]) {
            this.printLine('stat: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        const item = fs.get(path);
        if (!item) {
            this.printLine(`stat: ${args[0]}: No such file`);
            return;
        }
        this.printLine(`  File: ${args[0]}`);
        this.printLine(`  Size: ${item.size || 0}`);
        this.printLine(`  Type: ${item.type}`);
        this.printLine(`Access: ${item.permissions || '-'}`);
    }

    cmdFile(args) {
        if (!args[0]) {
            this.printLine('file: missing operand');
            return;
        }
        const path = this.resolvePath(args[0]);
        const item = fs.get(path);
        if (!item) {
            this.printLine(`file: ${args[0]}: No such file`);
            return;
        }
        this.printLine(`${args[0]}: ${item.type === 'directory' ? 'directory' : 'ASCII text'}`);
    }

    cmdChmod(args) {
        if (args.length < 2) {
            this.printLine('chmod: missing operand');
            return;
        }
        const path = this.resolvePath(args[1]);
        fs.chmod(path, args[0]);
    }

    cmdChown(args) {
        if (args.length < 2) {
            this.printLine('chown: missing operand');
            return;
        }
        const path = this.resolvePath(args[1]);
        fs.chown(path, args[0]);
    }

    cmdTar(args, opts) {
        if (!args[0]) {
            this.printLine('tar: missing operand');
            return;
        }
        if (opts.c) {
            this.printLine('tar: archive created');
        } else if (opts.x) {
            this.printLine('tar: archive extracted');
        }
    }

    cmdGzip(args) {
        if (!args[0]) {
            this.printLine('gzip: missing operand');
            return;
        }
        this.printLine(`gzip: ${args[0]} -> ${args[0]}.gz`);
    }

    cmdGunzip(args) {
        if (!args[0]) {
            this.printLine('gunzip: missing operand');
            return;
        }
        this.printLine(`gunzip: ${args[0]} -> ${args[0].replace('.gz', '')}`);
    }

    // ===== Utilities =====

    resolvePath(path) {
        if (!path) return this.currentPath;
        if (path.startsWith('/')) return path;
        if (path === '~') return this.homePath;
        return this.currentPath === '/' ? '/' + path : this.currentPath + '/' + path;
    }

    printLine(text) {
        if (!this.outputEl) return;
        const line = document.createElement('div');
        line.className = 'terminal-line output-line';
        // Remove ANSI codes
        line.textContent = text.replace(/\x1b\[[0-9;]*m/g, '');
        this.outputEl.appendChild(line);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    clear() {
        if (this.outputEl) {
            this.outputEl.innerHTML = '';
        }
    }
}
