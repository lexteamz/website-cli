class Terminal {
    constructor(config, commands) {
        this.config = config;
        this.commands = commands;
        this.output = document.getElementById('output');
        this.input = document.getElementById('commandInput');
        this.inputDisplay = document.getElementById('inputDisplay');
        this.terminal = document.getElementById('terminal');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        this.registerEvents();
        this.showWelcome();
        this.printEmptyLine();
        this.input.focus();
    }

    registerEvents() {
        this.input.addEventListener('input', () => {
            this.inputDisplay.textContent = this.input.value;
            this.scrollToBottom();
        });
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.terminal.addEventListener('click', () => this.input.focus());
    }

    handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = this.input.value;
            this.executeCommand(value);
            this.clearInput();
            this.printEmptyLine();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateHistory(1);
        } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
            e.preventDefault();
            this.clearScreen();
        } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
            if (this.input.value.length > 0) {
                e.preventDefault();
                this.printCommand(this.input.value + '^C');
                this.clearInput();
                this.printEmptyLine();
                this.historyIndex = this.commandHistory.length;
            }
        }
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        if (direction === -1 && this.historyIndex > 0) {
            this.historyIndex--;
        } else if (direction === 1 && this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
        } else if (direction === 1 && this.historyIndex === this.commandHistory.length - 1) {
            this.historyIndex = this.commandHistory.length;
            this.setInputValue('');
            return;
        } else {
            return;
        }
        this.setInputValue(this.commandHistory[this.historyIndex]);
    }

    setInputValue(value) {
        this.input.value = value;
        this.inputDisplay.textContent = value;
    }

    clearInput() {
        this.setInputValue('');
    }

    printLine(text, isHtml) {
        const line = document.createElement('div');
        if (isHtml) {
            line.innerHTML = text;
        } else {
            line.textContent = text;
        }
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    printEmptyLine() {
        this.output.appendChild(document.createElement('div'));
        this.scrollToBottom();
    }

    printCommand(command) {
        const line = document.createElement('div');
        line.className = 'command-line';
        const prefix = document.createElement('span');
        prefix.textContent = '> ';
        prefix.className = 'command-prefix';
        const cmdText = document.createElement('span');
        cmdText.textContent = command;
        cmdText.className = 'command-text';
        line.appendChild(prefix);
        line.appendChild(cmdText);
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    showWelcome() {
        this.printLine(this.config.welcomeMessage);
    }

    clearScreen() {
        this.output.innerHTML = '';
        this.showWelcome();
    }

    executeCommand(rawInput) {
        const trimmed = rawInput.trim();
        const command = trimmed.toLowerCase();

        if (trimmed.length > 0) {
            this.commandHistory.push(trimmed);
        }
        this.historyIndex = this.commandHistory.length;

        this.printCommand(trimmed);
        if (command === '') return;

        const resolved = this.resolveCommand(command);
        if (!resolved) {
            this.printLine(
                this.config.commandNotFoundPrefix +
                trimmed +
                this.config.commandNotFoundSuffix
            );
            return;
        }

        this.runCommand(resolved);
    }

    resolveCommand(inputCmd) {
        for (const cmd of this.commands.list) {
            if (cmd.name === inputCmd) return cmd;
            const aliases = (this.commands.aliases && this.commands.aliases[cmd.name]) || [];
            if (aliases.includes(inputCmd)) return cmd;
        }
        return null;
    }

    runCommand(cmd) {
        if (cmd.type === 'builtin') {
            this[cmd.action]();
        } else if (cmd.type === 'link') {
            this.showLink(cmd.action);
        }
    }

    showHelp() {
        this.printLine(this.config.helpHeader);
        for (const cmd of this.commands.list) {
            this.printLine('- ' + cmd.name + ': ' + cmd.description);
        }
    }

    showLink(linkKey) {
        const url = this.config.links[linkKey];
        const intro = this.config.messages[linkKey + 'Intro'] || '';
        const html = intro + '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
        this.printLine(html, true);
        if (linkKey === 'discord') {
            setTimeout(() => window.open(url, '_blank'), 500);
        }
    }
}
