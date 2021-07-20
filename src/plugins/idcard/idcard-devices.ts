import { getAppResourcePath } from "../../app/utils/pathUtil";
const ffi = require("ffi-napi");
const os = require("os");

/**
 * 华视身份证信息读取设备
 * @returns idCardHSApi
 */
export const idCardHSApi = () => {
  if (process.platform !== "win32") {
    throw new Error("unsupported plateform for lib");
  }
  return ffi.Library(getAppResourcePath(`win/${os.arch()}/termb`), {
    CVR_InitComm: ["int", ["int"]],
    // CVR_Ant: ['int', ['int']],
    CVR_Authenticate: ["int", []],
    CVR_Read_Content: ["int", ["int"]],
    CVR_CloseComm: ["int", []],
  });
};
