import Markdown from "react-markdown";
import Image from "./Image";
import Comments from "./Comments";

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
        <Markdown components={{ img: Image }}>{content}</Markdown>
      </article>
      <Comments slug={slug} />
    </section>
  );
}

export default BlogPostPage;
