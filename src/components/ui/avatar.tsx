import * as React from "react";

function Avatar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={
        "relative flex shrink-0 overflow-hidden rounded-full " +
        (className ?? "")
      }
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={
        "flex h-full w-full items-center justify-center rounded-full bg-muted " +
        (className ?? "")
      }
      {...props}
    />
  );
}

export { Avatar, AvatarFallback };
