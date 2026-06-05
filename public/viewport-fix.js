(function () {
  var content =
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);

  var width = window.innerWidth;
  if (window.visualViewport && window.visualViewport.width > 0) {
    width = window.visualViewport.width;
  }

  var designWidth = 360;
  var gutter = Math.max(6, Math.min(10, Math.round(width * 0.018)));
  var peek = Math.max(18, Math.min(28, Math.round(width * 0.065)));
  var fontSize = Math.min(18, Math.max(15, (width / designWidth) * 16));

  var root = document.documentElement;
  root.dataset.app = "miniapp";
  root.style.fontSize = fontSize + "px";
  root.style.setProperty("--viewport-w", width + "px");
  root.style.setProperty("--app-gutter", gutter + "px");
  root.style.setProperty("--featured-person-peek", peek + "px");
})();
