import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html } from "@elysiajs/html";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
//@ts-ignore
// import * as RSDW from "react-server-dom-webpack/server.node";

// import { clientComponentsMap } from "./bundler.js";

function stringifyJSX(key: string, value: unknown) {
  if (value === Symbol.for("react.element")) {
    return "$R";
  } else if (typeof value === "string" && value.startsWith("$")) {
    return `$${value}`;
  } else {
    return value;
  }
}

async function sendHtml(request: Request) {
  const url = new URL(request.url, `http://${request.headers.get("host")}`);

  const Router = await import("../app/Router.tsx");

  const Component = createElement(Router.default, { url });

  const clientJSX = await renderToReadableStream(Component);

  //   let html = await renderToString(clientJSX);

  //   const clientJSXString = JSON.stringify(clientJSX, stringifyJSX);
  //   html += `
  //     <script id="initial_jsx">
  //       window.__INITIAL_CLIENT_JSX__ = ${JSON.stringify(clientJSXString).replace(
  //         /</g,
  //         "\\u003c"
  //       )};

  //       window.addEventListener("load", () => {
  //         delete window.__INITIAL_CLIENT_JSX__;
  //         document.getElementById("initial_jsx").remove();
  //       });
  //     </script>
  //   `;
  //   html += `
  //     <script type="importmap">
  //     {
  //       "imports": {
  //         "react": "https://esm.sh/react@canary",
  //         "react-dom/client": "https://esm.sh/react-dom@canary/client"
  //       }
  //     }
  //     </script>
  //     <script type="module" src="/dist/app/client.js"></script>
  // `;

  const response = new Response(clientJSX, {
    headers: { "Content-Type": "text/html" },
  });

  return response;
}

async function sendJSX(url: unknown) {
  // const clientJsx = await renderJSXToClientJSX(jsx);
  // const clientJsxString = JSON.stringify(clientJsx, stringifyJSX, 2);
  // const Router = await import("../app/Router.js");
  // const Component = createElement(Router.default, { url });
  // const stream = RSDW.renderToReadableStream(Component, clientComponentsMap);
  // const response = new Response(stream);
  // response.headers.set("Content-Type", "text/x-component");
  // return response;
}

const api = new Elysia({ prefix: "/api" }).post(
  "/comments/:slug",
  async ({ params: { slug }, request }) => {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const content = formData.get("content") as string;

    const commentsDatabase = (await Bun.file("comments.json").json()) as Record<
      string,
      { id: number; name: string; content: string }[]
    >;

    if (!commentsDatabase[slug]) {
      commentsDatabase[slug] = [];
    }

    commentsDatabase[slug].push({
      id: commentsDatabase[slug].length + 1,
      name,
      content,
    });

    await Bun.write("comments.json", JSON.stringify(commentsDatabase));

    return new Response("New comment!", {
      status: 201,
    });
  }
);

export const app = new Elysia()
  .use(api)
  .use(html())
  .use(staticPlugin({ assets: "public" }))
  .use(staticPlugin({ assets: "dist" }))
  .get("/rsc", ({ path }) => sendJSX(path))
  .get("/", ({ request }) => sendHtml(request))
  .listen(3000)
  .onStart((server) => {
    console.log(`Listening on http://${server.hostname}:${server.port} ...`);
  });
