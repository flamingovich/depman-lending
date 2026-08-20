(function () {
  try {
    var pref = localStorage.getItem("depman-theme-preference");
    // Тёмная — по умолчанию. Светлую показываем только если её выбрали руками.
    var theme = pref === "light" ? "light" : "dark";

    document.documentElement.dataset.theme = theme;

    var color = theme === "dark" ? "#050e1c" : "#f3f4f9";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", color);
    }
  } catch (e) {}
})();
