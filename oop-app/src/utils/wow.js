export function cnWow(styleClass, effect, options = {}) {
  const { delay, duration, offset } = options;
  const classes = [styleClass, "wow", "animate__animated", `animate__${effect}`]
    .filter(Boolean)
    .join(" ");

  const props = { className: classes };
  if (delay) props["data-wow-delay"] = delay;
  if (duration) props["data-wow-duration"] = duration;
  if (offset) props["data-wow-offset"] = String(offset);

  return props;
}
