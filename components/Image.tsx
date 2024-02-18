import imageSize from "image-size";

type ImageProps = {
  src?: string;
  alt?: string;
};

function Image({ src, alt }: ImageProps) {
  let dimensions: { width?: number; height?: number } = {
    width: undefined,
    height: undefined,
  };

  if (src) {
    const calculation = imageSize(src);
    dimensions.width = calculation.width;
    dimensions.height = calculation.height;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
}

export default Image;
