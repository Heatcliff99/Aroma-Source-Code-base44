export function Image({ src, alt = "", fittingType = "cover", className = "", ...props }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ objectFit: fittingType === "fill" ? "cover" : fittingType }}
      {...props}
    />
  );
}