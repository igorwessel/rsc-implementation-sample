import { readdir } from "node:fs/promises";

import BlogPostPage from "./BlogPostPage";

async function BlogIndexPage() {
  const posts = await readdir("posts");
  const slugs = posts.map((post) => post.slice(0, post.lastIndexOf(".")));

  return (
    <section>
      <h1>My Blog!</h1>
      <div>
        {slugs.map((slug, index) => (
          <BlogPostPage key={index} slug={slug} />
        ))}
      </div>
    </section>
  );
}

export default BlogIndexPage;
