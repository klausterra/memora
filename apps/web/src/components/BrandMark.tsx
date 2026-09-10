export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/icon-192.png"
      alt=""
      width={size}
      height={size}
      style={{ display: "block", borderRadius: Math.round(size * 0.22) }}
    />
  );
}
