import Router from "./components/Router";

async function renderJSXToHtml(jsx: unknown): Promise<string | undefined> {
  if (typeof jsx === "string" || typeof jsx === "number") {
    return Bun.escapeHTML(jsx);
  } else if (jsx === null || jsx === "boolean" || jsx === undefined) {
    return "";
  } else if (Array.isArray(jsx)) {
    const childs = await Promise.all(jsx.map(renderJSXToHtml));
    return childs.join("");
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (typeof jsx.type === "string") {
        let html = `<${jsx.type}`;

        for (let key in jsx.props) {
          if (key === "children") continue;
          if (key === "className") {
            html += ` class="${jsx.props[key]}"`;
          } else {
            html += ` ${key}="${Bun.escapeHTML(jsx.props[key])}"`;
          }
        }

        html += ">";
        html += await renderJSXToHtml(jsx.props.children);
        html += `</${jsx.type}>`;
        return html;
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type;
        const props = jsx.props;
        const componentJsx = await Component(props);

        return renderJSXToHtml(componentJsx);
      } else throw new Error("Not implemented");
    } else throw new Error(`Cannot render unsupported object: ${jsx}`);
  } else throw new Error(`Cannot figure JSX type: ${jsx}`);
}

async function renderJSXToClientJSX(jsx: unknown) {
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

async function sendHtml(jsx: unknown) {
  const html = await renderJSXToHtml(jsx);
  const response = new Response(html);

  response.headers.set("Content-Type", "text/html");

  return response;
}

async function sendJSX(jsx: unknown) {
  const clientJsx = await renderJSXToClientJSX(jsx);
  const clientJsxString = JSON.stringify(clientJsx, null, 2);
  const response = new Response(clientJsxString);
  response.headers.set("Content-Type", "application/json");
  return response;
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    try {
      const url = new URL(req.url, `http://${req.headers.get("host")}`);

      if (url.pathname.includes(".ico"))
        return new Response("", { status: 404 });

      if (url.pathname.includes(".js")) {
        const body = await Bun.file(url.pathname.slice(1)).text();
        const response = new Response(body);
        response.headers.set("Content-Type", "text/javascript");

        return response;
      }

      if (url.searchParams.has("jsx")) {
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
