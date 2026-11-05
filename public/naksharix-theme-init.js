/* Apply saved appearance before the body paints; only user-controlled local theme. */
(function () {
  try {
    var stored = window.localStorage.getItem("naksharix-theme");
    document.documentElement.classList.toggle("dark", stored === "dark");
  } catch (_) {
    document.documentElement.classList.remove("dark");
  }
})();
