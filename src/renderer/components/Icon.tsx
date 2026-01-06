import React, { useMemo, useState } from "react";

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
};

const Plus = ({
  width = 24,
  height = 24,
  color = "currentColor",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
};

const ArrowLeft = ({
  width = 24,
  height = 24,
  color = "currentColor",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19L5 12L12 5" />
    </svg>
  );
};

const Bin = ({
  width = 24,
  height = 24,
  color = "currentColor",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
};

const Copy = ({
  width = 24,
  height = 24,
  color = "currentColor",
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
    >
      <path
        id="Rectangle"
        d="M0,0H7l5,5V15H0Z"
        transform="translate(9 6)"
        fill="none"
        stroke="#000000"
        stroke-miterlimit="10"
        stroke-width="1.5"
      />
      <path
        id="Rectangle-2"
        data-name="Rectangle"
        d="M5.959,15H0V0H7l3.043,3.043"
        transform="translate(3 3)"
        fill="none"
        stroke="#000000"
        stroke-miterlimit="10"
        stroke-width="1.5"
      />
      <path
        id="Rectangle_3"
        data-name="Rectangle 3"
        d="M6,6H0V0H0"
        transform="translate(15 6)"
        fill="none"
        stroke="#000000"
        stroke-miterlimit="10"
        stroke-width="1.5"
      />
    </svg>
  );
};

const Icons = {
  plus: Plus,
  "arrow-left": ArrowLeft,
  bin: Bin,
  copy: Copy,
};

type Props = {
  name: keyof typeof Icons;
  width?: number;
  height?: number;
  color?: string;
  onClick?: () => void;
};

export function Icon({ name, width = 24, height = 24, color, onClick }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const IconComponent = Icons[name];

  const interactionStyle = useMemo(() => {
    if (isPressed) {
      return {
        scale: 0.85,
        opacity: 0.5,
      };
    }
    if (isHovered) {
      return {
        scale: 1.25,
        opacity: 0.8,
      };
    }
    return {
      scale: 1,
      opacity: 1,
    };
  }, [isHovered, isPressed]);

  return (
    <div
      style={{
        ...interactionStyle,
        cursor: "pointer",
        transition: "opacity 0.2s ease, scale 0.2s ease",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <IconComponent width={width} height={height} color={color} />
    </div>
  );
}
