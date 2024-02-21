import { Like } from "./Like.tsx";

type CommentsProps = {
  slug: string;
};

async function Comments({ slug }: CommentsProps) {
  const commentsDatabase = (await Bun.file("comments.json").json()) as Record<
    string,
    { name: string; content: string }[]
  >;
  const comments = commentsDatabase[slug] || [];

  return (
    <section>
      <h1>Comments</h1>
      <form action={`/api/comments/${slug}`}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" />
        </div>
        <div>
          <label htmlFor="content">Comment:</label>
          <textarea id="content" name="content" />
        </div>
        <button type="submit">Submit</button>
      </form>

      {comments.map((comment, index) => (
        <article key={index}>
          <h2>{comment.name}</h2>
          <p>{comment.content}</p>
          <Like />
        </article>
      ))}
    </section>
  );
}

export default Comments;
