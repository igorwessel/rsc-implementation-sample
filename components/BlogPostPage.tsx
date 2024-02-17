type BlogPostPageProps = {
  slug: string;
};

async function BlogPostPage({ slug }: BlogPostPageProps) {
  const post = Bun.file(`posts/${slug}.txt`);
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
      <article>{content}</article>
    </section>
  );
}

export default BlogPostPage;
