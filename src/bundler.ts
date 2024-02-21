import { type BunPlugin } from "bun";
import pkg from "../package.json";

const transpiler = new Bun.Transpiler({
  loader: "tsx",
});

const appDir = new URL("./app/", import.meta.url);
const buildDir = new URL("./dist/", import.meta.url);

function resolveAppPath(path: string) {
  return Bun.fileURLToPath(new URL(path, appDir));
}

function resolveBuildDir(path: string) {
  return Bun.fileURLToPath(new URL(path, buildDir));
}

export const clientEntryPoints = new Set<string>();
export const clientComponentsMap = new Map<
  string,
  {
    id: string;
    name: string;
    async: boolean;
  }
>();

export const rscResolveClient: BunPlugin = {
  name: "rsc-resolve-client-imports",
  setup(builder) {
    builder.onResolve({ filter: /\.tsx$/ }, async (args) => {
      const path = args.path.includes("app")
        ? args.path
        : resolveAppPath(args.path);

      const content = await Bun.file(path).text();

      if (!content.startsWith("'use client'")) {
        return;
      }

      clientEntryPoints.add(path);

      return {
        external: true,
        path: resolveAppPath(args.path).replace(/\.tsx$/, ".js"),
      };
    });
  },
};

export async function build() {
  const server = await Bun.build({
    entrypoints: ["./server.tsx"],
    outdir: "dist",
    external: Object.keys(pkg.dependencies),
    plugins: [rscResolveClient],
    format: "esm",
    target: "node",
  });

  console.log(clientEntryPoints);

  const client = await Bun.build({
    entrypoints: ["./_client.ts", ...clientEntryPoints],
    external: Object.keys(pkg.dependencies),
    outdir: "dist",
    splitting: true,
    target: "browser",
  });

  for (const output of client.outputs) {
    const name = output.path.slice(output.path.lastIndexOf("/") + 1);

    if (name.includes("chunk")) continue;

    let content = await output.text();

    const { exports } = transpiler.scan(content);

    for (const exp of exports) {
      const key = output.path + name;
      console.log(output);

      clientComponentsMap.set(key, {
        id: `/dist/${output.path}`,
        name,
        async: true,
      });

      content += `
      ${exp}.$$id = ${JSON.stringify(key)};
      ${exp}.$$typeof = Symbol.for("react.client.reference");
      `;
    }

    await Bun.write(resolveBuildDir(output.path), content);
  }
}

build();
