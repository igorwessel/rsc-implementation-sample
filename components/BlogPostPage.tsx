import Markdown from "react-markdown";

type BlogPostPageProps = {
  slug: string;
};

async function BlogPostPage({ slug }: BlogPostPageProps) {
  const post = Bun.file(`posts/${slug}.md`);
  const exist = await post.exists();

  if (!exist) {
    const notFound = new Error("Not Found");
    notFound.statusCode = 404;
    throw notFound;
  }

  const content = await post.text();

  return (
    <section>
      <h2>
        <a href={`/${slug}`}>{slug}</a>
      </h2>
      <article>
        <Markdown>{content}</Markdown>
      </article>
    </section>
  );
}

export default BlogPostPage;
