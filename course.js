/* =========================================================
   Course player
   Shows one lesson at a time, like an e-learning player.
   All lesson text is already in index.html; this file only
   hides and shows it. With JavaScript off, the whole course
   shows as one long page.

   You should not need to edit this file to change content.
   To add a lesson: add a <section class="lesson"> in
   index.html and a matching link in the menu.
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var lessons = Array.prototype.slice.call(document.querySelectorAll(".lesson"));
  if (!lessons.length) return;

  var menuButton = document.getElementById("menu-button");
  var menu = document.getElementById("course-menu");
  var menuLinks = Array.prototype.slice.call(menu.querySelectorAll("a"));
  var viewButton = document.getElementById("view-button");
  var pager = document.getElementById("pager");
  var backButton = document.getElementById("pager-back");
  var nextButton = document.getElementById("pager-next");
  var nextHint = document.getElementById("pager-next-hint");
  var progressModule = document.getElementById("progress-module");
  var progressCount = document.getElementById("progress-count");
  var progressFill = document.getElementById("progress-fill");

  var roles = Array.prototype.slice.call(document.querySelectorAll("details.role"));

  var current = 0;
  var onePage = false;
  var VIEW_KEY = "mp-course-view";

  /* ---- Helpers ---- */

  // Which lesson does the web address (#something) point to?
  function indexFromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return 0;
    var target = document.getElementById(id);
    var lesson = target && target.closest(".lesson");
    var index = lessons.indexOf(lesson);
    return index === -1 ? 0 : index;
  }

  function goTo(index) {
    var id = lessons[index].id;
    if (location.hash === "#" + id) {
      show(index, true);
    } else {
      location.hash = id;   // the hashchange listener below does the rest
    }
  }

  /* ---- Show one lesson ---- */

  function show(index, moveFocus) {
    current = index;
    var lesson = lessons[index];
    var total = lessons.length;

    lessons.forEach(function (item, i) {
      item.hidden = i !== index;
    });

    // Gentle fade-in (CSS skips it if the visitor prefers less motion)
    lesson.classList.remove("is-entering");
    void lesson.offsetWidth;
    lesson.classList.add("is-entering");

    // Progress
    progressModule.textContent = lesson.getAttribute("data-module");
    progressCount.textContent = "Lesson " + (index + 1) + " of " + total;
    progressFill.style.width = ((index + 1) / total) * 100 + "%";

    // Menu: mark where you are and where you've been
    menuLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + lesson.id) {
        link.setAttribute("aria-current", "step");
        link.classList.add("is-visited");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    // Back and Next
    backButton.hidden = index === 0;
    if (index === total - 1) {
      nextButton.firstChild.textContent = "Back to the start";
      nextHint.textContent = "";
    } else {
      nextButton.firstChild.textContent = "Next";
      nextHint.textContent = lessons[index + 1].getAttribute("data-title");
    }

    window.scrollTo(0, 0);
    if (moveFocus) {
      var heading = lesson.querySelector("h2");
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }

  /* ---- Course view vs. one page ---- */

  function setOnePage(on, save) {
    onePage = on;
    root.classList.toggle("one-page", on);
    viewButton.textContent = on ? "Course view" : "View as one page";
    pager.hidden = on;

    // One-page view is also the text-only version, so open every role
    roles.forEach(function (role) { role.open = on; });

    if (on) {
      lessons.forEach(function (item) { item.hidden = false; });
      menuLinks.forEach(function (link) { link.removeAttribute("aria-current"); });
    } else {
      show(indexFromHash(), save);
    }

    if (save) {
      try { localStorage.setItem(VIEW_KEY, on ? "page" : "course"); } catch (e) {}
    }
  }

  /* ---- Menu ---- */

  function openMenu() {
    menu.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
  }

  function closeMenu(returnFocus) {
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    if (returnFocus) menuButton.focus();
  }

  menuButton.addEventListener("click", function () {
    if (menu.hidden) openMenu(); else closeMenu(false);
  });

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () { closeMenu(false); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !menu.hidden) closeMenu(true);
  });

  document.addEventListener("click", function (event) {
    if (!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) {
      closeMenu(false);
    }
  });

  /* ---- Buttons and links ---- */

  backButton.addEventListener("click", function () {
    if (current > 0) goTo(current - 1);
  });

  nextButton.addEventListener("click", function () {
    goTo(current < lessons.length - 1 ? current + 1 : 0);
  });

  viewButton.addEventListener("click", function () {
    setOnePage(!onePage, true);
    if (onePage) lessons[current].scrollIntoView();
  });

  // Printing shows everything, including every role's details
  window.addEventListener("beforeprint", function () {
    roles.forEach(function (role) { role.open = true; });
  });

  window.addEventListener("hashchange", function () {
    if (!onePage) show(indexFromHash(), true);
  });

  /* ---- Start up ---- */

  root.classList.add("js");
  menu.hidden = true;
  menuButton.hidden = false;
  viewButton.hidden = false;

  var savedView = null;
  try { savedView = localStorage.getItem(VIEW_KEY); } catch (e) {}

  setOnePage(savedView === "page", false);
})();
