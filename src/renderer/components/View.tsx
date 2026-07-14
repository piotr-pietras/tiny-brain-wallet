import React from "react";

type Props = {
  direction?: "row" | "column";
  gap?: number;
  style?: React.CSSProperties;
  full?: boolean;
  children: React.ReactNode;
};

export function View({
  direction = "column",
  gap = 8,
  full = false,
  style,
  children,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: direction === "row" ? "center" : "flex-start",
        flexWrap: direction === "row" ? "wrap" : "nowrap",
        gap: `${gap}px`,
        width: full ? "100%" : "auto",
        height: full ? "100%" : "auto",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
