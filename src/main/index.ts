import { app, BrowserWindow } from "electron";
import * as path from "path";
import { registerHandlers } from "./ipc";

let win: BrowserWindow | null = null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 850,
    height: 1000,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    title: "Tiny Brain Wallet",
  });

  win.loadFile("src/renderer/dist/index.html");
};

export const restartWindow = () => {
  if (win) {
    win.close();
  }
  createWindow();
};

app.whenReady().then(() => {
  registerHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
