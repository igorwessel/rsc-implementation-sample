import { renderToString } from "react-dom/server";

import Router from "./components/Router";

async function renderJSXToClientJSX(
  jsx: unknown
): Promise<Record<string, unknown>> {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    return jsx;
  } else if (Array.isArray(jsx)) {
    const childs = await Promise.all(jsx.map(renderJSXToClientJSX));
    return childs;
  } else if (jsx !== null && typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (typeof jsx.type === "string") {
        return {
          ...jsx,
          props: await renderJSXToClientJSX(jsx.props),
        };
      } else if (jsx.type === Symbol.for("react.fragment")) {
        return renderJSXToClientJSX(jsx.props.children);
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type;
        const props = jsx.props;
        const componentJsx = await Component(props);

        return renderJSXToClientJSX(componentJsx);
      } else throw new Error("Not implemented");
    } else {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(jsx).map(async ([propName, propValue]) => [
            propName,
            await renderJSXToClientJSX(propValue),
          ])
        )
      );
    }
  } else throw new Error(`Cannot figure JSX type: ${jsx}`);
}

function stringifyJSX(key: string, value: unknown) {
  if (value === Symbol.for("react.element")) {
    return "$R";
  } else if (typeof value === "string" && value.startsWith("$")) {
    return `$${value}`;
  } else {
    return value;
  }
}

async function sendHtml(jsx: unknown) {
  const clientJSX = await renderJSXToClientJSX(jsx);
  let html = await renderToString(clientJSX);

  const clientJSXString = JSON.stringify(clientJSX, stringifyJSX);
  html += `
    <script id="initial_jsx">
      window.__INITIAL_CLIENT_JSX__ = ${JSON.stringify(clientJSXString).replace(
        /</g,
        "\\u003c"
      )};

      window.addEventListener("load", () => {
        delete window.__INITIAL_CLIENT_JSX__;
        document.getElementById("initial_jsx").remove();
      });
    </script>
  `;
  html += `
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@canary",
        "react-dom/client": "https://esm.sh/react-dom@canary/client"
      }
    }
    </script>
    <script type="module" src="/client.js"></script>
`;

  const response = new Response(html);

  response.headers.set("Content-Type", "text/html");

  return response;
}

async function sendJSX(jsx: unknown) {
  const clientJsx = await renderJSXToClientJSX(jsx);
  const clientJsxString = JSON.stringify(clientJsx, stringifyJSX, 2);
  const response = new Response(clientJsxString);
  response.headers.set("Content-Type", "application/json");
  return response;
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    try {
      const url = new URL(req.url, `http://${req.headers.get("host")}`);

      if (url.pathname.includes(".ico")) {
        return new Response("", { status: 404 });
      }

      if (url.pathname.includes("comments")) {
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

      if (url.pathname.includes("assets")) {
        const body = await Bun.file(url.pathname.slice(1)).arrayBuffer();
        const response = new Response(body);
        response.headers.set("Content-Type", "image/jpeg");
        return response;
      }

      if (url.pathname.includes("client.js")) {
        const body = await Bun.file(url.pathname.slice(1)).text();
        const response = new Response(body);
        response.headers.set("Content-Type", "text/javascript");

        return response;
      }

      if (url.searchParams.has("jsx")) {
        url.searchParams.delete("jsx");
        return await sendJSX(<Router url={url} />);
      } else {
        return await sendHtml(<Router url={url} />);
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
