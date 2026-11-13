/* =========================================================
   Activities
   1. Practice questions and quiz questions (<form class="check">)
   2. The sample mini-lesson player in Module 4
   3. Knowledge check score
   4. Certificate name and date

   All the question text and feedback live in index.html.
   This file only checks answers and shows the right feedback.
   ========================================================= */

(function () {
  "use strict";

  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /* ---- 1. Questions ----
     data-type="single": one radio choice, data-answer = correct value
     data-type="multi":  checkboxes, data-answer = correct values, comma separated
     data-type="sort":   one radio group per fieldset.sort-item, each with its own data-answer */

  function showError(form, on) {
    form.querySelector(".check-error").hidden = !on;
  }

  function hideFeedback(form) {
    all(".option-feedback, .check-summary", form).forEach(function (el) { el.hidden = true; });
    all(".choice", form).forEach(function (el) { el.classList.remove("is-flag", "is-fine"); });
  }

  function checkSingle(form) {
    var picked = form.querySelector("input:checked");
    if (!picked) return null;
    var right = picked.value === form.getAttribute("data-answer");
    all(".option-feedback", form).forEach(function (el) {
      var key = el.getAttribute("data-for");
      el.hidden = !(key === picked.value || key === (right ? "right" : "wrong"));
    });
    return right;
  }

  function checkMulti(form) {
    var picked = all("input:checked", form).map(function (input) { return input.value; });
    if (!picked.length) return null;
    var answer = form.getAttribute("data-answer").split(",");
    var found = picked.filter(function (v) { return answer.indexOf(v) !== -1; }).length;
    var extra = picked.length - found;

    all("input", form).forEach(function (input) {
      var label = input.closest(".choice");
      label.classList.add(answer.indexOf(input.value) !== -1 ? "is-flag" : "is-fine");
    });
    all(".option-feedback", form).forEach(function (el) { el.hidden = false; });

    var summary = form.querySelector(".check-summary");
    var right = found === answer.length && extra === 0;
    summary.textContent = right
      ? "You found all " + answer.length + ". Nice work."
      : "You found " + found + " of " + answer.length + " lines that need checking" +
        (extra ? ", and flagged " + extra + " that " + (extra === 1 ? "is" : "are") + " fine." : ".");
    summary.className = "check-summary " + (right ? "is-right" : "is-wrong");
    summary.hidden = false;
    return right;
  }

  function checkSort(form) {
    var items = all(".sort-item", form);
    var done = items.every(function (item) { return item.querySelector("input:checked"); });
    if (!done) return null;
    var score = 0;
    items.forEach(function (item) {
      var ok = item.querySelector("input:checked").value === item.getAttribute("data-answer");
      if (ok) score++;
      var feedback = item.querySelector(".option-feedback");
      feedback.className = "option-feedback " + (ok ? "is-right" : "is-wrong");
      feedback.hidden = false;
    });
    var summary = form.querySelector(".check-summary");
    summary.textContent = "You sorted " + score + " of " + items.length + " correctly.";
    summary.className = "check-summary " + (score === items.length ? "is-right" : "is-wrong");
    summary.hidden = false;
    return score === items.length;
  }

  var checkers = { single: checkSingle, multi: checkMulti, sort: checkSort };

  all("form.check").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideFeedback(form);
      var result = checkers[form.getAttribute("data-type")](form);
      if (result === null) {
        showError(form, true);
        return;
      }
      showError(form, false);
      form.setAttribute("data-result", result ? "right" : "wrong");
      updateScore();
    });

    form.addEventListener("change", function () { showError(form, false); });
  });

  /* ---- 2. Mini-lesson player ---- */

  var mini = document.getElementById("mini");
  if (mini) {
    var screens = all(".mini-screen", mini);
    var miniNav = document.getElementById("mini-nav");
    var miniBack = document.getElementById("mini-back");
    var miniNext = document.getElementById("mini-next");
    var miniCount = document.getElementById("mini-count");
    var currentScreen = 0;

    var showScreen = function (index, moveFocus) {
      currentScreen = index;
      screens.forEach(function (screen, i) { screen.hidden = i !== index; });
      miniCount.textContent = "Screen " + (index + 1) + " of " + screens.length;
      miniBack.hidden = index === 0;
      miniNext.hidden = index === screens.length - 1;
      if (moveFocus) {
        var heading = screens[index].querySelector("h3");
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    };

    miniBack.addEventListener("click", function () {
      if (currentScreen > 0) showScreen(currentScreen - 1, true);
    });
    miniNext.addEventListener("click", function () {
      if (currentScreen < screens.length - 1) showScreen(currentScreen + 1, true);
    });

    miniNav.hidden = false;
    miniCount.hidden = false;
    mini.classList.add("is-player");
    showScreen(0, false);
  }

  /* ---- 3. Knowledge check score ---- */

  var quiz = all("form.quiz-q");
  var scoreBox = document.getElementById("quiz-score");
  var scoreText = document.getElementById("quiz-score-text");

  function updateScore() {
    if (!scoreBox) return;
    var answered = quiz.filter(function (form) { return form.hasAttribute("data-result"); });
    if (answered.length < quiz.length) return;
    var right = quiz.filter(function (form) { return form.getAttribute("data-result") === "right"; }).length;
    scoreText.textContent = "You got " + right + " of " + quiz.length + " right." +
      (right === quiz.length ? " Perfect score!" : "");
    scoreBox.hidden = false;
  }

  var retry = document.getElementById("quiz-retry");
  if (retry) {
    retry.addEventListener("click", function () {
      quiz.forEach(function (form) {
        form.reset();
        form.removeAttribute("data-result");
        hideFeedback(form);
        showError(form, false);
      });
      scoreBox.hidden = true;
      quiz[0].querySelector("input").focus();
    });
  }

  /* ---- 4. Certificate ---- */

  var nameInput = document.getElementById("cert-name-input");
  var learner = document.getElementById("cert-learner");
  if (nameInput && learner) {
    nameInput.addEventListener("input", function () {
      learner.textContent = nameInput.value.trim() || "You";
    });
  }

  var dateWrap = document.getElementById("cert-date-wrap");
  if (dateWrap) {
    document.getElementById("cert-date").textContent = new Date().toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric"
    });
    dateWrap.hidden = false;
  }
})();
