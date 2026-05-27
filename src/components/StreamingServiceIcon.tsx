import { STREAMING_BRAND_ICONS } from "@/lib/streaming-brand-icons";
import type { StreamingServiceId } from "@/lib/streaming-links";

type Props = {
  serviceId: StreamingServiceId;
  className?: string;
  size?: number;
};

export default function StreamingServiceIcon({ serviceId, className = "", size = 16 }: Props) {
  const icon = STREAMING_BRAND_ICONS[serviceId];

  return (
    <svg
      className={`shrink-0 ${className}`.trim()}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-hidden
    >
      <title>{icon.title}</title>
      <path fill={`#${icon.hex}`} d={icon.path} />
    </svg>
  );
}
