import type { ReactNode } from "react";
import Footer from "./Footer";
import FragmentComponent from "./FragmentComponent";

type BlogLayoutProps = {
  children: ReactNode;
};

function BlogLayout({ children }: BlogLayoutProps) {
  const author = "John Doe";

  return (
    <html>
      <head>
        <title>Blog</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <hr />
          <input />
          <hr />
        </nav>
        <main>
          <FragmentComponent />
          {children}
        </main>
        <Footer author={author} />
      </body>
    </html>
  );
}

export default BlogLayout;
