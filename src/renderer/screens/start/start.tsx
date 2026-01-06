import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader } from "../../components/Loader";

/**
 * The start screen is the first screen that the user sees when they open the app.
 * Also contains the logic to initialize the app.
 */
export default function StartScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    console.info("App is started");
    navigate("/wallets");
  }, []);

  return <Loader fullScreen />;
}
