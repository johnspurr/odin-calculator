const DEBUG = false;
function debug(lastPressed) {console.table({lights, currentState, currentValue, storedValue, currentOperator, lastPressed})}

let lights = true;
let screen = document.querySelector(".screen");
let numbers = document.querySelectorAll(".number");
numbers.forEach(element => {
  element.addEventListener("click", event => {
    number(element.id);
  })
});
document.querySelectorAll(".operator").forEach(element => {
  element.addEventListener("click", event => {
    operator(element.id)
  })
})
document.querySelector("#clear").addEventListener("click", allClear);
document.querySelector("#equals").addEventListener("click", equals);
document.querySelector("#plusminus").addEventListener("click", plusminus);
document.querySelector("#delete").addEventListener("click", del);

// Calculator state
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
var numbersDisabled;

allClear();
// End of setup

// Function to render the screen content.
// Also serves to prevent value from being too large to display
function render() {
  let value = currentValue;
  if (!numbersDisabled && lights && value.length > 9 && (currentState === STATE.FIRST || currentState === STATE.SECOND)) {
    numbersDisabled = true;
    numbers.forEach(element => element.disabled = true)
  } else if (numbersDisabled) {
    numbersDisabled = false;
    numbers.forEach(element => element.disabled = false)
  }
  if (Math.abs(value) === Infinity) {
    currentState = STATE.CLEAR;
    allClear();
  }
  screen.textContent = value;

}

// Flips the sign of the current entered value
function plusminus() {
  currentValue = (currentValue*(-1)).toString();
  if (DEBUG) debug();
  render();
}

// Deletes last entered digit
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
  render();
}

// Clears calculator state
function allClear() {
  currentState = STATE.CLEAR;
  storedValue = 0;
  currentValue = "0";
  currentOperator = null;
  if (DEBUG) debug();
  if (!lights) {
    toggleLights();
  }
  render();
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
  render()
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
  render()
}

function equals() {
  switch (currentState) {
    case STATE.ANSWER:
      storedValue = currentValue;
      currentValue = repeatedOperand;
      currentValue = evaluate();
      break;
    case STATE.OPERATOR:
      storedValue = currentValue;
    default:
      repeatedOperand = currentValue;
      currentValue = evaluate();
      break;
  }
  if (currentValue === "lightsoff") {
    toggleLights();
    return;
  } 
  currentState = STATE.ANSWER;
  if (DEBUG) debug();
  render();
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
        return "lightsoff";
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
  // Fit result to screen
  let magnitude = x === 0 ? 0 : Math.floor(Math.log10(Math.abs(x)) + 1);
  let exponent = 10 - magnitude;
  let power = Math.pow(10,exponent);
  result = Math.round(x*power)/power;

  if (result >= 10_000_000_000) {
    result *= Infinity
  }
  return result;
}

// Creative error display for division by zero
function toggleLights() {
  if (DEBUG) debug();
  lights ^= true;
  document.querySelectorAll('button:not(#clear)').forEach(b => {
    b.disabled ^= true;
    b.classList.toggle("lightsOut");
  });
  document.querySelector('#clear').classList.toggle("blink")
  document.body.classList.toggle("lightsOut");  
  if (!lights) {
    screen.textContent = "";
  }
}

document.querySelector("#clear").addEventListener("click", allClear);
document.querySelector("#equals").addEventListener("click", equals);
document.querySelector("#plusminus").addEventListener("click", plusminus);
document.querySelector("#delete").addEventListener("click", del);

numbers.forEach(element => {
  element.addEventListener("click", event => {
    number(element.id);
  })
});

document.querySelectorAll(".operator").forEach(element => {
  element.addEventListener("click", event => {
    operator(element.id)
  })
})