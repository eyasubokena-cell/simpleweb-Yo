
const screen = document.getElementById("screen");
const previous = document.getElementById("previous");
const historyList = document.getElementById("historyList");

let current = "0";
let storedValue = null;
let operator = null;
let waitingForNumber = false;
let justCalculated = false;

function updateScreen() {
    screen.value = current;
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return String(Number(number.toPrecision(12)));
}

function inputNumber(number) {
    if (current === "Error" || waitingForNumber || justCalculated) {
        current = number;
        waitingForNumber = false;
        justCalculated = false;
    } else if (current.length < 16) {
        current = current === "0" ? number : current + number;
    }

    updateScreen();
}

function inputDecimal() {
    if (current === "Error" || waitingForNumber || justCalculated) {
        current = "0.";
        waitingForNumber = false;
        justCalculated = false;
    } else if (!current.includes(".")) {
        current += ".";
    }

    updateScreen();
}

function chooseOperator(nextOperator) {
    if (current === "Error") return;

    const inputValue = Number(current);

    if (operator && !waitingForNumber) {
        const result = calculate(
            storedValue,
            operator,
            inputValue
        );

        if (result === null) return;

        current = formatNumber(result);
        updateScreen();
        storedValue = result;
    } else {
        storedValue = inputValue;
    }

    operator = nextOperator;
    waitingForNumber = true;
    justCalculated = false;

    previous.textContent =
        `${formatNumber(storedValue)} ${displayOperator(operator)}`;
}

function displayOperator(op) {
    return {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    }[op] || op;
}

function calculate(a, op, b) {
    switch (op) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            if (b === 0) {
                current = "Error";
                screen.value = current;
                previous.textContent = "Cannot divide by zero";
                storedValue = null;
                operator = null;
                waitingForNumber = true;
                return null;
            }
            return a / b;
        default:
            return b;
    }
}

function showError(message) {
    current = "Error";
    screen.value = current;
    previous.textContent = message;
    storedValue = null;
    operator = null;
    waitingForNumber = true;
    justCalculated = false;
}

function addHistory(expression, result) {
    const empty = historyList.querySelector(".empty-history");
    if (empty) empty.remove();

    const item = document.createElement("li");
    item.textContent = `${expression} = ${result}`;
    historyList.prepend(item);

    while (historyList.children.length > 10) {
        historyList.lastElementChild.remove();
    }
}

function equals() {
    if (operator === null || storedValue === null || waitingForNumber) {
        return;
    }

    const a = storedValue;
    const b = Number(current);
    const op = operator;
    const result = calculate(a, op, b);

    if (result === null) return;

    const answer = formatNumber(result);
    const expression =
        `${formatNumber(a)} ${displayOperator(op)} ${formatNumber(b)}`;

    previous.textContent = `${expression} =`;
    current = answer;
    storedValue = null;
    operator = null;
    waitingForNumber = true;
    justCalculated = true;

    updateScreen();
    addHistory(expression, answer);
}

function clearAll() {
    current = "0";
    storedValue = null;
    operator = null;
    waitingForNumber = false;
    justCalculated = false;
    previous.textContent = "";
    updateScreen();
}

function deleteLast() {
    if (current === "Error" || waitingForNumber || justCalculated) {
        clearAll();
        return;
    }

    current = current.length > 1
        ? current.slice(0, -1)
        : "0";

    if (current === "-" || current === "") {
        current = "0";
    }

    updateScreen();
}

function toggleSign() {
    if (current === "Error" || Number(current) === 0) return;

    current = current.startsWith("-")
        ? current.slice(1)
        : "-" + current;

    justCalculated = false;
    updateScreen();
}

function percentage() {
    if (current === "Error") return;

    current = formatNumber(Number(current) / 100);
    justCalculated = false;
    updateScreen();
}

// Calculator button clicks
document.querySelector(".buttons").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
    } else if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
    } else {
        switch (button.dataset.action) {
            case "clear":
                clearAll();
                break;
            case "delete":
                deleteLast();
                break;
            case "decimal":
                inputDecimal();
                break;
            case "sign":
                toggleSign();
                break;
            case "percent":
                percentage();
                break;
            case "equals":
                equals();
                break;
        }
    }
});

// Keyboard support
document.addEventListener("keydown", event => {
    if (/^[0-9]$/.test(event.key)) {
        inputNumber(event.key);
    } else if (event.key === ".") {
        inputDecimal();
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        equals();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    } else if (event.key === "%") {
        percentage();
    }
});

// Dark/light theme
document.getElementById("themeBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark");

    document.getElementById("themeBtn").textContent =
        document.body.classList.contains("dark") ? "☾" : "☀";
});

// Clear calculation history
document.getElementById("clearHistory").addEventListener("click", () => {
    historyList.replaceChildren();

    const empty = document.createElement("li");
    empty.className = "empty-history";
    empty.textContent = "Your calculations appear here.";

    historyList.appendChild(empty);
});

// Initial display
updateScreen();
