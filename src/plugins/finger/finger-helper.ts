import FingerPrintWN from "./finger-print-wn";
// import FingerPrintWN06 from "./FingerPrintWN06";
import FingerPrintZA from "./finger-print-za";
import FingerPrintVein from "./finger-print-vein";
import FingerPrintZK from "./finger-print-zk";

class FingerPrintFactory {
  static getInstance(type: FingerDeviceTypes | null = null) {
    let instance: FingerPrintInterface | null;
    switch (type) {
      case FingerDeviceTypes.FingerprintWenN_Old:
        instance = null; // new FingerPrintWN06();
        break;
      case FingerDeviceTypes.FingerprintWenN:
        instance = new FingerPrintWN();
        break;
      case FingerDeviceTypes.FingerprintZhiAng:
        instance = new FingerPrintZA();
        break;
      case FingerDeviceTypes.FingerVein:
        instance = new FingerPrintVein();
        break;
      case FingerDeviceTypes.FingerZK:
        instance = new FingerPrintZK();
        break;

      default:
        instance = null;
    }

    return instance;
  }
}

enum FingerDeviceTypes {
  FingerprintWenN_Old, // 纹宁06
  FingerprintWenN, // 纹宁
  FingerprintZhiAng, // 指昂
  FingerVein, // 指静脉（微盾）
  FingerZK, // 中控
}

class FingerHelper {
  static _defaultDevice: FingerPrintInterface;
  static _defaultDeviceType: FingerDeviceTypes | null;
  // static _fingerDeviceTypes = [
  //   // "FingerprintWenN_Old", // 纹宁06
  //   // "FingerprintWenN", // 纹宁
  //   // "FingerprintZhiAng", // 指昂
  //   // "FingerVein", // 指静脉（微盾）
  //   "FingerZK", // 中控
  // ];

  static get defaultMachine() {
    return new Promise<FingerPrintInterface>(async (resolve, reject) => {
      if (FingerHelper._defaultDevice) {
        // 检查当前指纹设备是否存在
        if (await FingerHelper._defaultDevice.searchDevice) {
          return resolve(FingerHelper._defaultDevice);
        }
      }
      // const device = await FingerHelper.searchDevice();
      const device = await FingerHelper.getDevice(FingerDeviceTypes.FingerZK);
      if (device) {
        return resolve(FingerHelper._defaultDevice);
      }
      return reject("can not find finger device");
      //throw new Error("can not find finger device");
    });
  }

  // static async searchDevice() {
  //   for (const type of FingerHelper._fingerDeviceTypes) {
  //     const fingerDevice = FingerPrintFactory.getInstance(type);
  //     if (await fingerDevice?.searchDevice) {
  //       FingerHelper._defaultDevice = fingerDevice as FingerPrintInterface;
  //       FingerHelper._defaultDeviceType = type;
  //       return fingerDevice;
  //     }
  //   }
  //   return false;
  // }

  static async getDevice(type: FingerDeviceTypes) {
    const fingerDevice = FingerPrintFactory.getInstance(type);
    if (await fingerDevice?.searchDevice) {
      FingerHelper._defaultDevice = fingerDevice as FingerPrintInterface;
      FingerHelper._defaultDeviceType = type;
      return fingerDevice;
    }
    return false;
  }
}

export default FingerHelper;
