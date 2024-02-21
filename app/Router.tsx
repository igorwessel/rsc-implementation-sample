import BlogIndexPage from "./BlogIndexPage";
import BlogPostPage from "./BlogPostPage";
import BlogLayout from "./BlogLayout";

function Router({ url }) {
  let page = null;

  if (url.pathname === "/") {
    page = <BlogIndexPage />;
  } else {
    const slug = url.pathname.slice(1);

    page = <BlogPostPage slug={slug} />;
  }

  return <BlogLayout>{page}</BlogLayout>;
}

export default Router;
