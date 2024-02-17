type FooterProps = {
  author: string;
};

function Footer({ author }: FooterProps) {
  return (
    <footer>
      <hr />
      <p>
        <i>
          (c) {author}, {new Date().getFullYear()}
        </i>
      </p>
    </footer>
  );
}

export default Footer;
