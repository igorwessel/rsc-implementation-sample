import BlogIndexPage from "./BlogIndexPage.tsx";
import BlogPostPage from "./BlogPostPage.tsx";
import BlogLayout from "./BlogLayout.tsx";

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
