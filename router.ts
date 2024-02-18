const router = new Bun.FileSystemRouter({
  dir: process.cwd() + "/pages",
  style: "nextjs",
  assetPrefix: "/assets",
});
