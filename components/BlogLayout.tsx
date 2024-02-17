import type { ReactNode } from "react";
import Footer from "./Footer";

type BlogLayoutProps = {
  children: ReactNode;
};

function BlogLayout({ children }: BlogLayoutProps) {
  const author = "John Doe";

  return (
    <html>
      <head>
        <title>Blog</title>
        <script src="./client.js" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <hr />
          <input />
          <hr />
        </nav>
        <main>{children}</main>
        <Footer author={author} />
      </body>
    </html>
  );
}

export default BlogLayout;
