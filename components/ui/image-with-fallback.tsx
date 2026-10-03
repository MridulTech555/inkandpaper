"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

const DEFAULT_FALLBACK = "/seed/featured-1.svg";

/**
 * `next/image` wrapper that swaps to a local placeholder when the source fails
 * to load (dead remote host, deleted upload, offline). Keeps broken images from
 * rendering as blank boxes.
 */
export function ImageWithFallback({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  onError,
  ...props
}: ImageProps & { fallbackSrc?: string }) {
  const [current, setCurrent] = useState(src);

  return (
    // `alt` is required by ImageProps and forwarded via {...props}.
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...props}
      src={current}
      onError={(event) => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}
