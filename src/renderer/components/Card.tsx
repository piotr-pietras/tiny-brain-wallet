import React, { useState } from "react";

type Props = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export function Card({ children, style, onClick }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor:
          isHovered && onClick ? "var(--surface-variant)" : "var(--surface)",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 0 16px 0 rgba(0, 0, 0, 0.2)",
        width: "fit-content",
        boxSizing: "border-box",
        cursor: onClick ? "pointer" : "default",
        scale: isHovered && onClick ? 1.03 : 1,
        transition: "background-color 0.2s ease, scale 0.2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
