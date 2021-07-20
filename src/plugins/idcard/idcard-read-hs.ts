import fs from "fs";
import { getAppResourcePath } from "../../app/utils/pathUtil";
import { idCardHSApi } from "./idcard-devices";
const iconv = require("iconv-lite");
const os = require("os");

interface IdCardInfo {
  name: string;
  sex: string;
  birthday: string;
  address: string;
  idCardNum: string;
  portrait: string;
  errorCode: number;
  errorMsg: string;
}

/**
 * 华视身份证读卡器读取身份证信息
 * @description errorCode 不为0都视为读取失败
 * @returns IdCardInfo
 */
function readIDCard(): IdCardInfo {
  const res: IdCardInfo = {
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
    const libPath = `win/${os.arch()}`;
    const readerInstance = idCardHSApi();
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
        return res;
      } else if (authState !== 1) {
        res.errorCode = authState;
        res.errorMsg = "授权失败";
        return res;
      }

      const readState = readerInstance.CVR_Read_Content(1);
      readerInstance.CVR_CloseComm();
      if (readState === 1) {
        // 同步读取
        const data = fs.readFileSync(getAppResourcePath(`${libPath}/wz.txt`));

        // console.log(data.length);
        res.name = iconv.decode(data.slice(0, 30), "ucs2").trim();
        res.sex = iconv.decode(data.slice(30, 32), "ucs2").trim();
        const year = iconv.decode(data.slice(36, 44), "ucs2");
        const month = iconv.decode(data.slice(44, 48), "ucs2");
        const day = iconv.decode(data.slice(48, 52), "ucs2");
        res.birthday = `${year}-${month}-${day}`;
        res.address = iconv.decode(data.slice(52, 122), "ucs2").trim();
        res.idCardNum = iconv.decode(data.slice(122, 158), "ucs2").trim();
        const bmpImage = fs.readFileSync(
          getAppResourcePath(`${libPath}/zp.bmp`)
        );
        res.portrait = `data:image/bmp;base64,${bmpImage.toString("base64")}`;

        fs.unlink(getAppResourcePath(`${libPath}/wz.txt`), () => {});
        fs.unlink(getAppResourcePath(`${libPath}/xp.wlt`), () => {});
        fs.unlink(getAppResourcePath(`${libPath}/zp.bmp`), () => {});

        return res;
      } else {
        res.errorCode = readState;
        res.errorMsg = "身份证读取失败";
        return res;
      }
    } else {
      res.errorCode = aliveState;
      res.errorMsg = "读卡器未连接";
      return res;
    }
  } catch (ex) {
    console.error(ex);
    res.errorCode = 9999;
    res.errorMsg = "动态库组件异常";
    return res;
  }
}

/**
 * 华视身份证读卡器检测
 * @description state 不为0都视为失败
 * @returns state
 */
function readIDCardCall(): number {
  try {
    const readerInstance = idCardHSApi();
    let state = -1;
    for (let i = 1001; i <= 1016; i++) {
      if (readerInstance.CVR_InitComm(i) === 1) {
        state = 0;
        break;
      }
    }
    return state;
  } catch (ex) {
    console.error(ex);

    return -1;
  }
}
export { readIDCard, readIDCardCall };
