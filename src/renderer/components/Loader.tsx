import React from "react";

type Props = {
  fullScreen?: boolean;
  size?: number;
  color?: string;
};

export function Loader({
  fullScreen = false,
  size = 40,
  color = "var(--primary)",
}: Props) {
  return (
    <div
      style={{
        width: fullScreen ? "100%" : "auto",
        height: fullScreen ? "100%" : "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "inline-block",
          width: `${size}px`,
          height: `${size}px`,
          border: `4px solid ${color}`,
          borderTop: "4px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
}
