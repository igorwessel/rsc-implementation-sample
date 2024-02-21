import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
//@ts-ignore
import * as RSDW from "react-server-dom-webpack/server.node";

import { clientComponentsMap } from "./bundler.ts";

function stringifyJSX(key: string, value: unknown) {
  if (value === Symbol.for("react.element")) {
    return "$R";
  } else if (typeof value === "string" && value.startsWith("$")) {
    return `$${value}`;
  } else {
    return value;
  }
}

async function sendHtml(url: unknown) {
  const Router = await import("./app/Router.tsx");
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

  const response = new Response(clientJSX);

  response.headers.set("Content-Type", "text/html");

  return response;
}

async function sendJSX(url: unknown) {
  // const clientJsx = await renderJSXToClientJSX(jsx);
  // const clientJsxString = JSON.stringify(clientJsx, stringifyJSX, 2);
  const Router = await import("./app/Router.tsx");
  const Component = createElement(Router.default, { url });

  const stream = RSDW.renderToReadableStream(Component, clientComponentsMap);
  const response = new Response(stream);

  response.headers.set("Content-Type", "text/x-component");

  return response;
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    try {
      const url = new URL(req.url, `http://${req.headers.get("host")}`);

      if (url.pathname.includes("api/comments")) {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const content = formData.get("content") as string;
        const slug = url.pathname.split("/")[2];

        const commentsDatabase = (await Bun.file(
          "comments.json"
        ).json()) as Record<
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

      if (url.pathname.includes(".ico")) {
        return new Response("", { status: 404 });
      }

      if (url.pathname.includes("dist")) {
        const file = Bun.file(`./dist${url.pathname.slice(5)}`);

        const exists = await file.exists();

        if (!exists) return new Response("Not Found", { status: 404 });

        return new Response(file);
      }

      if (url.pathname.includes("assets")) {
        const file = Bun.file(`./assets/${url.pathname.slice(7)}`);

        const exists = await file.exists();

        if (!exists) return new Response("Not Found", { status: 404 });

        return new Response(file);
      }

      if (url.searchParams.has("jsx")) {
        url.searchParams.delete("jsx");

        return await sendJSX(url);
      } else {
        return await sendHtml(url);
      }
    } catch (error) {
      console.error(error);

      return new Response("Internal Server Error", {
        status: error?.statusCode || 500,
      });
    }
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);
