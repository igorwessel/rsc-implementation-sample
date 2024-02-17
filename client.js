import { hydrateRoot } from "react-dom/client";

const root = hydrateRoot(document, getInitialClientJsx());

let currentPathName = window.location.pathname;

async function navigate(pathname) {
  currentPathName = pathname;
  const clientJSX = await fetchClientJsx(pathname);

  if (pathname === currentPathName) {
    root.render(clientJSX);
  }
}

function getInitialClientJsx() {
  const clientJSX = JSON.parse(window.__INITIAL_CLIENT_JSX__, reviveJSX);
  return clientJSX;
}

function reviveJSX(_, value) {
  if (value === "$R") {
    return Symbol.for("react.element");
  } else if (typeof value === "string" && value.startsWith("$$")) {
    return value.slice(1);
  } else {
    return value;
  }
}

async function fetchClientJsx(pathname) {
  const response = await fetch(`${pathname}?jsx`);
  const clientJsxString = await response.text();
  const clientJSX = JSON.parse(clientJsxString, reviveJSX);

  return clientJSX;
}

window.addEventListener(
  "click",
  (e) => {
    if (e.target.tagName !== "A") {
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
