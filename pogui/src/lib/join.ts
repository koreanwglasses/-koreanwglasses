export const join = (...segments: string[]) =>
  segments
    .map((segment, i) =>
      i > 0 && segment.startsWith("/") ? segment.substring(1) : segment
    )
    .map((segment, i) =>
      i < segments.length - 1 && segment.endsWith("/")
        ? segment.substring(0, -1)
        : segment
    )
    .join("/");
