const DEBUG = true;
function debug(lastPressed) {console.table({lights, currentState, currentValue, storedValue, currentOperator, lastPressed})}

let lights = true;
let screen = document.querySelector(".screen");

const STATE = {
  // The calculator is clear, no previous results
  CLEAR: "CLEAR",
  // Started entering first number
  FIRST: "FIRST",
  // Just pressed an operator
  OPERATOR: "OPERATOR",
  // Started entering a second number
  SECOND: "SECOND",
  // Just pressed equals
  ANSWER: "ANSWER"
}
var currentState;
var storedValue;
var repeatedOperand;
var currentValue;
var currentOperator;

allClear();

function renderScreen() {
  screen.textContent = currentValue;
}

function toggleLights() {
  if (DEBUG) debug();
  lights ^= true;
  document.querySelectorAll('button:not(#clear)').forEach(b => b.disabled ^= true);
  document.querySelector('#clear').classList.toggle("blink")
  document.body.classList.toggle("lightsOut");  
  if (!lights) {
    screen.textContent = "";
  }
}

// Called when a digit is pressed
function number(value) {
  if (value === ".") {  
    if (currentValue.includes("."))
      return;
    if (currentState === STATE.CLEAR) 
      currentState = STATE.FIRST;
  }

  switch (currentState) {
    case STATE.ANSWER:
      allClear();
    case STATE.CLEAR:
      currentState = STATE.FIRST;
      currentValue = value;
      break;
    case STATE.OPERATOR:
      currentState = STATE.SECOND;
      currentValue = value;
      break;
    default:
      currentValue = currentValue.toString().concat(value);
  }
  if (DEBUG) debug();
  renderScreen()
}

// Called when an operator is pressed
function operator(value) {  
  switch (currentState) {
    case STATE.ANSWER:
    case STATE.FIRST:
      storedValue = currentValue;
      break;
    case STATE.SECOND:      
      storedValue = evaluate();   
      if (storedValue === "lightsoff") {
        toggleLights();
        return;
      }
      break;
  }      
  currentOperator = value;
  currentState = STATE.OPERATOR;
  if (DEBUG) debug();
  renderScreen()
}

function equals() {
  switch (currentState) {
    case STATE.ANSWER:
      storedValue = currentValue;
      currentValue = repeatedOperand;
      currentValue = evaluate().toString();
      break;
    case STATE.OPERATOR:
      storedValue = currentValue;
    default:
      repeatedOperand = currentValue;
      currentValue = evaluate().toString();
      break;
  }
  currentState = STATE.ANSWER;
  if (currentValue === "lightsoff") {
    toggleLights();
    return;
  } 
  if (DEBUG) debug();
  renderScreen();
}

// General evaluation function
function evaluate() {
  let a = parseFloat(storedValue);
  let b = parseFloat(currentValue);
  let result;

  switch (currentOperator) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      if (b === 0) {
        result = "lightsoff"
      } else {
        result = a / b;
      }
      break;
    case "power":
      result = Math.pow(a, b);
      break;
    default:
      result = b;
  }

  return result;
}

function percent() {
  currentValue = (currentValue/100).toString();
  if (DEBUG) debug();
  renderScreen();
}

function del() {
  currentValue = currentValue.slice(0, -1);
  if (currentValue.length === 0) {
    switch (currentState) {
      case STATE.FIRST:
        currentState = STATE.CLEAR;
        break;
      case STATE.SECOND:
        currentState = STATE.OPERATOR;
        break;
    }
    currentValue = "0";
  }
  if (DEBUG) debug();
  renderScreen();
}

function allClear() {
  currentState = STATE.CLEAR;
  storedValue = 0;
  currentValue = "0";
  currentOperator = null;
  if (DEBUG) debug();
  if (!lights) {
    toggleLights();
  }
  renderScreen();
}

document.querySelector("#clear").addEventListener("click", allClear);
document.querySelector("#equals").addEventListener("click", equals);
document.querySelector("#percent").addEventListener("click", percent);
document.querySelector("#delete").addEventListener("click", del);

document.querySelectorAll(".number").forEach(element => {
  element.addEventListener("click", event => {
    number(element.id);
  })
});

document.querySelectorAll(".operator").forEach(element => {
  element.addEventListener("click", event => {
    operator(element.id)
  })
})