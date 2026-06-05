(function () {
  try {
    var pref = localStorage.getItem("depman-theme-preference");
    var theme = "light";
    if (pref === "dark" || pref === "light") {
      theme = pref;
    } else if (
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.colorScheme
    ) {
      theme = window.Telegram.WebApp.colorScheme;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
    document.documentElement.dataset.theme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#050e1c" : "#f3f4f9");
    }
  } catch (e) {}
})();
