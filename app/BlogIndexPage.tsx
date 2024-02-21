import { readdir } from "node:fs/promises";

async function BlogIndexPage() {
  const posts = await readdir("posts");
  const slugs = posts.map((post) => post.slice(0, post.lastIndexOf(".")));

  return (
    <section>
      <h1>My Blog!</h1>
      <div>
        {slugs.map((slug, index) => (
          <h2 key={index}>
            <a href={`/${slug}`}>{slug}</a>
          </h2>
        ))}
      </div>
    </section>
  );
}

export default BlogIndexPage;
