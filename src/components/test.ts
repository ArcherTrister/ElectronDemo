import path from "path";
import fs from "fs";
import { getAppResourcePath } from "../app/utils/pathUtil";

const ffi = require("ffi-napi");
const os = require("os");
const edge = require("electron-edge-js");

/**
 *
 * @returns testApi
 */
export const testAddApi = () => {
  if (process.platform !== "win32") {
    throw new Error("unsupported plateform for lib");
  }
  return ffi.Library(getAppResourcePath(`win/${os.arch()}/zk`), {
    funAdd: ["int", ["int", "int"]],
    //Init: ["int", []],
  });
};

export const init = () => {
  if (process.platform !== "win32") {
    throw new Error("unsupported plateform for lib");
  }
  return edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "Init",
  });
};

export const open = () => {
  if (process.platform !== "win32") {
    throw new Error("unsupported plateform for lib");
  }
  return edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "Open",
  });
};

export const close = () => {
  if (process.platform !== "win32") {
    throw new Error("unsupported plateform for lib");
  }
  return edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "Close",
  });
};

export const getFingerImage = () => {
  if (process.platform !== "win32") {
    throw new Error("unsupported plateform for lib");
  }
  return edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "GetFingerImage",
  });
};

function test() {
  const ffi = require("ffi-napi");

  // var myAddDll = new ffi.Library(getAppResourcePath("all/myAddDll"), {
  //   funAdd: ["int", ["int", "int"]],
  // });
  // const result = myAddDll.funAdd(1, 2);
  // console.log(result);

  const res = {
    name: "",
    sex: "",
    birthday: "",
    address: "",
    idCardNum: "",
    portrait: "",
    errorCode: 0,
    errorMsg: "",
  };
  try {
    const readerInstance = ffi.Library(
      getAppResourcePath("all/termb"),
      //path.join(__dirname, "./resources", "all", "termb"),
      {
        CVR_InitComm: ["int", ["int"]],
        // CVR_Ant: ['int', ['int']],
        CVR_Authenticate: ["int", []],
        CVR_Read_Content: ["int", ["int"]],
        CVR_CloseComm: ["int", []],
      }
    );
    let aliveState = 0;
    for (let i = 1001; i <= 1016; i++) {
      aliveState = readerInstance.CVR_InitComm(i);
      if (aliveState === 1) {
        break;
      }
    }
    if (aliveState === 1) {
      const authState = readerInstance.CVR_Authenticate();
      if (authState === 0 || authState === 2) {
        res.errorCode = authState;
        res.errorMsg = "请放置身份证或移开重放";
        //event.returnValue = res;
        return;
      } else if (authState !== 1) {
        res.errorCode = authState;
        res.errorMsg = "授权失败";
        //event.returnValue = res;
        return;
      }

      const readState = readerInstance.CVR_Read_Content(1);
      readerInstance.CVR_CloseComm();
      if (readState === 1) {
        // 同步读取
        const data = fs.readFileSync(
          path.join(__dirname, "dll", "basic", "wz.txt")
        );
        // console.log(data.length);
        // res.name = iconv.decode(data.slice(0, 30), "ucs2").trim();
        // res.sex = iconv.decode(data.slice(30, 32), "ucs2").trim();
        // const year = iconv.decode(data.slice(36, 44), "ucs2");
        // const month = iconv.decode(data.slice(44, 48), "ucs2");
        // const day = iconv.decode(data.slice(48, 52), "ucs2");
        // res.birthday = `${year}-${month}-${day}`;
        // res.address = iconv.decode(data.slice(52, 122), "ucs2").trim();
        // res.idCardNum = iconv.decode(data.slice(122, 158), "ucs2").trim();
        const bmpImage = fs.readFileSync(
          path.join(__dirname, "dll", "basic", "zp.bmp")
        );
        res.portrait = `data:image/bmp;base64,${bmpImage.toString("base64")}`;

        fs.unlink(path.join(__dirname, "dll", "basic", "wz.txt"), () => {});
        fs.unlink(path.join(__dirname, "dll", "basic", "xp.wlt"), () => {});
        fs.unlink(path.join(__dirname, "dll", "basic", "zp.bmp"), () => {});

        //event.returnValue = res;
      } else {
        res.errorCode = readState;
        res.errorMsg = "身份证读取失败";
        //event.returnValue = res;
      }
    } else {
      res.errorCode = aliveState;
      res.errorMsg = "读卡器未连接";
      //event.returnValue = res;
    }
    console.log(res);
  } catch (error) {
    res.errorCode = 9999;
    res.errorMsg = "动态库组件异常";
    //event.returnValue = res;
    console.error(res);
  }

  //const readerInstance = init();
  // console.log("test");
  // //var pp = path.join(__dirname, "../../resources", "all", "termb");
  // let pp = getAppResourcePath("all/termb.dll");
  // console.log(pp);

  //const readerInstance = idCardReader();
}
