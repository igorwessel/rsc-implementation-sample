let currentPathName = window.location.pathname;

async function navigate(url) {
  currentPathName = url;
  const res = await fetch(url + "?jsx");
  const html = await res.text();

  if (url === currentPathName) {
    alert(html);
    const parser = new DOMParser();
    const newDocument = parser.parseFromString(html, "text/html");

    document.body.replaceWith(newDocument.body);
    document.title = newDocument.title;
  }
}

window.addEventListener(
  "click",
  (e) => {
    if (e.target.tagName !== "A") {
      // e.preventDefault()
      // window.history.pushState({}, "", e.target.href)
      // window.dispatchEvent(new PopStateEvent("popstate"))
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    const href = e.target.getAttribute("href");

    if (!href.startsWith("/")) {
      return;
    }

    e.preventDefault();
    window.history.pushState(null, "", href);
    navigate(href);
  },
  true
);

window.addEventListener(
  "popstate",
  () => {
    navigate(window.location.pathname);
  },
  true
);
