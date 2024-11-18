"use strict";

function calculator() {
  let answerOne = parseFloat(prompt("Podaj pierwszą liczbę :"));

  let answerTwo = parseFloat(prompt("Podaj drugą wartość :"));

  const suma = answerOne + answerTwo;

  alert(`Twój wynik dodawania wynosi ${suma}`);
}
