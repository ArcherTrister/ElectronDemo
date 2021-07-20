import { app, BrowserWindow, ipcMain, protocol } from "electron";
import protocolRegister from "./utils/protocolRegister";
import process from "process";
import path from "path";
// import ipcMainEvent from "../plugins/index";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "false";
// 将DLL目录 放到 环境变量，
// const pathToAdd = path.join(__dirname, "dll", "basic");
// debugger;
// console.log(pathToAdd);
// const pathToAdd2 = path.join(__dirname, "./resources");
// console.error(pathToAdd2);

// process.env.PATH = `${process.env.PATH}${path.delimiter}${pathToAdd}`;

let mainWindow: BrowserWindow;
const myProtocol = protocolRegister("app");
protocol.registerSchemesAsPrivileged([myProtocol.privileged()]);

app.whenReady().then(() => {
  myProtocol.register();
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      preload: path.resolve(__dirname, "preload.js"),
    },
  });
  if (process.env["NODE_ENV"] == "development") {
    mainWindow.loadURL("http://localhost:" + process.env["DEV_SERVER_PORT"]);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`app://./`);
  }

  ipcMain.on("msg", () => console.log("main: hello!"));
});

// function createWindow()
// {
//   myProtocol.register();
//   mainWindow = new BrowserWindow({
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//       devTools: true,
//       preload: path.resolve(__dirname, "preload.js"),
//     },
//   });
//   if (process.env["NODE_ENV"] == "development") {
//     mainWindow.loadURL("http://localhost:" + process.env["DEV_SERVER_PORT"]);
//     mainWindow.webContents.openDevTools();
//   } else {
//     mainWindow.loadURL(`app://./`);
//   }

//   ipcMain.on("msg", () => console.log("main: hello!"));

// }

// // 防止多次开启应用
// const getTheLock = app.requestSingleInstanceLock()
// if (!getTheLock) {
//   app.quit()
// } else {
//   app.on('second-instance', (event, commandLine, workingDirectory) => {
//     if (mainWindow) {
//       if (mainWindow.isMinimized()) mainWindow.restore()
//       mainWindow.focus()
//     }
//   })
 
//   app.on('ready', createWindow)
// }


// 初始化事件监听
// Object.keys(ipcMainEvent).forEach((key) => {
//   ipcMain.on(
//     key,
//     (event, ...args) => {
//       ipcMainEvent[key](
//         event,
//         // TODO: winodws
//         //winodws,
//         mainWindow,
//         ...args
//       );
//     },
//   );
// });
