import React from "react";
import { Icon } from "./Icon";
import { Outlet, useNavigate } from "react-router";

export default function Header() {
  const navigate = useNavigate();
  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, padding: 16 }}
      >
        <Icon
          name="arrow-left"
          width={24}
          height={24}
          onClick={() => navigate(-1)}
        />
      </div>
      <Outlet />
    </div>
  );
}
