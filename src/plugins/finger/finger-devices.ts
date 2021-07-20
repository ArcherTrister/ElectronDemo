import { getAppResourcePath } from "../../app/utils/pathUtil";
const ffi = require("ffi-napi");
const ref = require("ref-napi");
const RefArray = require("ref-array-napi");
const edge = require("electron-edge-js");

const byteArray = new RefArray(ref.types.byte, 16);

/**
 * 微盾指纹设备
 * @returns fingerVeinApi
 */
export const fingerVeinApi = () =>
  ffi.Library(getAppResourcePath(`all/WedoneDll`), {
    FVAPI_GetSerialNumber: [
      ref.types.uint32,
      [ref.refType(byteArray), ref.types.byte],
    ],
    FVAPI_FingerDetect: [ref.types.uint32, [ref.types.byte]],
    FVAPI_FetchVeinTemplate: [
      ref.types.uint32,
      [ref.refType(byteArray), ref.types.uint32],
    ],
    FVAPI_SameFingerCheck: [
      ref.types.uint32,
      [ref.refType(byteArray), ref.refType(byteArray), ref.types.byte],
    ],
  });

/**
 * 纹宁指纹设备
 * @returns fingerWNApi
 */
export const fingerWNApi = () =>
  ffi.Library(getAppResourcePath(`all/WMRAPI`), {
    WM_Init: ["int", []],
    WM_Free: ["int", []],
    WM_GetDeviceCount: ["int", []],
    WM_OpenDevice: ["int", ["int", ref.refType(ref.types.int)]],
    WM_GetImageInfo: ["int", [ref.refType("int"), ref.refType("int")]],
    WM_GetImage: [
      "int",
      ["int", "int", ref.refType(byteArray), ref.refType("int")],
    ],
    WM_Extract: [
      "int",
      [
        ref.refType(byteArray),
        "int",
        "int",
        ref.refType(byteArray),
        ref.refType("int"),
      ],
    ],
    WM_GenTemplate: [
      "int",
      [
        ref.refType(byteArray),
        ref.refType(byteArray),
        ref.refType(byteArray),
        ref.refType(byteArray),
        ref.refType("int"),
      ],
    ],
    WM_CloseDevice: ["int", ["int"]],
  });

/**
 * 纹宁06指纹设备
 * @returns fingerWN06Api
 */
export const fingerWN06Api = () =>
  ffi.Library(getAppResourcePath(`all/WMRAPI06`), {
    WM_Init: ["int", []],
    WM_Free: ["int", []],
    WM_GetDeviceCount: ["int", []],
    WM_OpenDevice: ["int", ["int", ref.refType(ref.types.int)]],
    WM_GetImageInfo: ["int", [ref.refType("int"), ref.refType("int")]],
    WM_GetImage: [
      "int",
      ["int", "int", ref.refType(byteArray), ref.refType("int")],
    ],
    WM_Extract: [
      "int",
      [
        ref.refType(byteArray),
        "int",
        "int",
        ref.refType(byteArray),
        ref.refType("int"),
      ],
    ],
    WM_GenTemplate: [
      "int",
      [
        ref.refType(byteArray),
        ref.refType(byteArray),
        ref.refType(byteArray),
        ref.refType(byteArray),
        ref.refType("int"),
      ],
    ],
    WM_CloseDevice: ["int", ["int"]],
  });

/**
 * 指昂指纹设备
 * @returns fingerWNApi
 */
export const fingerZAApi = () =>
  ffi.Library(getAppResourcePath(`all/ZAZAPIt`), {
    ZAZOpenDeviceEx: [
      "int",
      [ref.refType(byteArray), "int", "int", "int", "int", "int"],
    ],
    ZAZCloseDeviceEx: ["int", ["int"]],
    ZAZGetImage: ["int", ["int", ref.types.uint32]],
    ZAZErr2Str: [ref.types.void, ["int", "string"]],
    ZAZGenChar: ["int", ["int", ref.types.uint32, "int"]],
    ZAZRegModule: ["int", ["int", ref.types.uint32]],
    ZAZUpChar: [
      "int",
      [
        "int",
        ref.types.uint32,
        "int",
        ref.refType(ref.types.byte),
        ref.refType("int"),
      ],
    ],
  });

/**
 * 中控指纹设备
 * @returns fingerZKApi
 */
export const fingerZKApi = () => {
  const zkf = new ZKFinger();
  if (process.platform !== "win32") {
    throw new Error("unsupported plateform for lib");
  }

  zkf.ZKInit = edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "Init",
  });

  zkf.ZKOpen = edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "Open",
  });
  zkf.ZKClose = edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "Close",
  });
  zkf.ZKGetFingerImage = edge.func({
    assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
    typeName: "ZKFinger.ZKFingerHelper",
    methodName: "GetFingerImage",
  });
  console.error(zkf);
  return zkf;
};

export class ZKFinger {
  ZKInit: any;
  ZKOpen: any;
  ZKClose: any;
  ZKGetFingerImage: any;

  // constructor() {
  //   if (process.platform !== "win32") {
  //     throw new Error("unsupported plateform for lib");
  //   }

  //   this.ZKInit = edge.func({
  //     assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
  //     typeName: "ZKFinger.ZKFingerHelper",
  //     methodName: "Init",
  //   });

  //   this.ZKOpen = edge.func({
  //     assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
  //     typeName: "ZKFinger.ZKFingerHelper",
  //     methodName: "Open",
  //   });
  //   this.ZKClose = edge.func({
  //     assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
  //     typeName: "ZKFinger.ZKFingerHelper",
  //     methodName: "Close",
  //   });
  //   this.ZKGetFingerImage = edge.func({
  //     assemblyFile: getAppResourcePath("all/ZKFinger.dll"),
  //     typeName: "ZKFinger.ZKFingerHelper",
  //     methodName: "GetFingerImage",
  //   });
  // }
}
