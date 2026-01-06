import React from "react";

type Props = {
  direction?: "row" | "column";
  gap?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export function View({
  direction = "column",
  gap = 8,
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
        ...style,
      }}
    >
      {children}
    </div>
  );
}
