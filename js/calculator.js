/**
 * WebOS Calculator Application
 */

class Calculator {
    constructor(windowId) {
        this.windowId = windowId;
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.history = '';
        
        this.displayEl = null;
        this.historyEl = null;
        
        setTimeout(() => this.init(), 50);
    }

    init() {
        const windowEl = document.querySelector(`[data-window-id="${this.windowId}"]`);
        if (!windowEl) return;
        
        this.displayEl = windowEl.querySelector('.calc-input');
        this.historyEl = windowEl.querySelector('.calc-history');
        
        this.updateDisplay();
    }

    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.history = '';
        this.updateDisplay();
    }

    clearEntry() {
        this.currentValue = '0';
        this.updateDisplay();
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    toggleSign() {
        this.currentValue = (parseFloat(this.currentValue) * -1).toString();
        this.updateDisplay();
    }

    inputOperator(op) {
        const inputValue = parseFloat(this.currentValue);

        if (this.previousValue === '') {
            this.previousValue = this.currentValue;
        } else if (this.operation) {
            const result = this.calculate(parseFloat(this.previousValue), inputValue, this.operation);
            this.currentValue = result.toString();
            this.previousValue = result.toString();
        }

        this.waitingForOperand = true;
        this.operation = op;
        
        const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        this.history = `${this.previousValue} ${symbols[op] || op}`;
        this.updateDisplay();
    }

    calculate(left, right, op) {
        switch (op) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return right !== 0 ? left / right : 'Error';
            default: return right;
        }
    }

    equals() {
        if (this.operation && this.previousValue !== '') {
            const inputValue = parseFloat(this.currentValue);
            const prevValue = parseFloat(this.previousValue);
            const result = this.calculate(prevValue, inputValue, this.operation);
            
            const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
            this.history = `${this.previousValue} ${symbols[this.operation]} ${this.currentValue} =`;
            this.currentValue = result.toString();
            this.previousValue = '';
            this.operation = null;
            this.waitingForOperand = true;
            
            this.updateDisplay();
        }
    }

    scientificFunction(func) {
        const value = parseFloat(this.currentValue);
        let result;

        switch (func) {
            case 'sin': result = Math.sin(value * Math.PI / 180); break;
            case 'cos': result = Math.cos(value * Math.PI / 180); break;
            case 'tan': result = Math.tan(value * Math.PI / 180); break;
            case 'log': result = Math.log10(value); break;
            case 'ln': result = Math.log(value); break;
            case 'sqrt': result = Math.sqrt(value); break;
            case 'pow': result = Math.pow(value, 2); break;
            case 'pi': result = Math.PI; break;
            default: result = value;
        }

        this.currentValue = result.toString();
        this.history = `${func}(${value})`;
        this.waitingForOperand = true;
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.displayEl) {
            this.displayEl.textContent = this.currentValue;
        }
        if (this.historyEl) {
            this.historyEl.textContent = this.history;
        }
    }
}

// Global functions
function calcNumber(digit) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.inputDigit(digit);
    }
}

function calcDecimal() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.inputDecimal();
    }
}

function calcOperator(op) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.inputOperator(op);
    }
}

function calcEquals() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.equals();
    }
}

function calcClear() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.clear();
    }
}

function calcClearEntry() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.clearEntry();
    }
}

function calcBackspace() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.backspace();
    }
}

function calcToggleSign() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.toggleSign();
    }
}

function calcScientific(func) {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl && windowEl._calcInstance) {
        windowEl._calcInstance.scientificFunction(func);
    }
}

function toggleCalcMode() {
    const windowEl = document.querySelector('.window.focused');
    if (windowEl) {
        const scientificEl = windowEl.querySelector('.calc-scientific');
        if (scientificEl) {
            scientificEl.classList.toggle('hidden');
        }
    }
}
