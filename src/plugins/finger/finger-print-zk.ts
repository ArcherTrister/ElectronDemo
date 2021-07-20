import { fingerZKApi } from "./finger-devices";
const ref = require("ref-napi");
const RefArray = require("ref-array-napi");

/**
 * 中控
 *
 * @export
 * @class FingerPrintZK
 * @extends {fingerPrintApi}
 */
export default class FingerPrintZK implements FingerPrintInterface {
  /**
   * 设备类型
   *
   * @memberof FingerPrintZK
   */
  _deviceType = "FingerZK";

  /**
   * fingerPrintApi
   */
  _fingerPrintApi: any;

  /**
   * 设备操作句柄
   *
   * @memberof FingerPrintZK
   */
  _handle: any;

  /**
   * 当前指纹图像索引
   *
   * @memberof FingerPrintZK
   */
  _currentImgIndex = 0;

  /**
   * 当前指纹图像索引
   *
   * @memberof FingerPrintZK
   */
  _deviceAddr: any;

  /**
   * 回发消息
   *
   * @memberof FingerPrintZK
   */
  _message = "";

  /**
   * 重复计时器
   *
   * @memberof FingerPrintZK
   */
  _interval: any;

  /**
   * 超时计时器
   *
   * @memberof FingerPrintZK
   */
  _timeOut: any;

  /**
   * 读取指纹中事件
   *
   * @memberof FingerPrintZK
   */
  _onReading: any;

  /**
   * 读取指纹完成事件
   *
   * @memberof FingerPrintZK
   */
  _onComplete: any;

  /**
   * Creates an instance of FingerPrintZK.
   * @memberof FingerPrintZK
   */
  constructor() {
    // super();
    this._fingerPrintApi = fingerZKApi();
  }

  get deviceType() {
    return this._deviceType;
  }

  get currentMessage() {
    return this._message;
  }

  /**
   * 查找指纹设备,如果找到便初始化
   *
   * @memberof FingerPrintZK
   */
  get searchDevice() {
    return this.initDevice();
  }

  /**
   * 初始化指纹设备
   *
   * @memberof FingerPrintZK
   */
  initDevice() {
    // const refHandle = ref.alloc(ref.types.int); // 设备句柄
    // // 初始化指纹设备
    // const res = this._fingerPrintApi.ZAZOpenDeviceEx(refHandle, 2, 0, 0, 2, 0);
    // console.log(res || 1, "FingerPrintZK");
    // if (!res) {
    //   this._handle = refHandle.deref();
    //   // console.log(this._handle, refHandle.deref());
    //   return true;
    // }
    // return false;
    // const res = this._fingerPrintApi.ZKInit();
    // console.log(res);
    return this._fingerPrintApi.ZKInit(null, function (error: any, result: any) {
      if (error) return false;
      if (result.ErrorCode === 0) {
        return true;
      } else {
        return false;
      }
    });
    ;
  }

  /**
   * 获取指纹注册信息
   *
   * @memberof FingerPrintZK
   */
  get getRegData() {
    this._currentImgIndex = 1;
    this._deviceAddr = 0xffffffff;
    this.timer();
    this._timeOut = setTimeout(() => {
      clearInterval(this._interval);
      this.emmitReadingMsg("读取超时，请重试！");
      this._onComplete(null);
    }, 30000); // 30秒没走完流程超时关闭
    return true;
  }

  /**
   * 轮询计时器
   *
   * @memberof FingerPrintZK
   */
  timer() {
    this.emmitReadingMsg(
      `请${this._currentImgIndex > 1 ? "再次" : ""}放入手指[${
        this._currentImgIndex
      }/2]`
    );
    this._interval = setInterval(() => {
      this.waitFingerIn();
    }, 1000);
  }

  waitFingerIn() {
    const res = this.getFingerData();
    if (res) {
      this._currentImgIndex++;
      clearInterval(this._interval);
      if (this._currentImgIndex > 2) {
        clearTimeout(this._timeOut);
        this.emmitReadingMsg("");
        this.createTemplate();
      } else {
        this.emmitReadingMsg("请拿开手指");
        setTimeout(() => {
          this.timer();
        }, 2000);
      }
    }
  }

  getFingerData() {
    const res = this._fingerPrintApi.ZAZGetImage(
      this._handle,
      this._deviceAddr
    );
    if (res) {
      return false;
    }
    // 获取指纹特征
    const extractRes = this._fingerPrintApi.ZAZGenChar(
      this._handle,
      this._deviceAddr,
      this._currentImgIndex
    );
    if (extractRes) {
      this.emmitReadingMsg("指纹不清晰，请再试一次");
      return false;
    }
    return true;
  }

  createTemplate() {
    let resStr = null;
    const templateData = new RefArray(ref.types.byte, 512);
    const refTemplateData = ref.alloc(templateData);
    const dataLength = ref.alloc(ref.types.int); // 模板长度

    const resReg = this._fingerPrintApi.ZAZRegModule(
      this._handle,
      this._deviceAddr
    );
    // console.log(resReg);
    if (resReg) {
      this._onComplete(null);
      return;
    }

    const res = this._fingerPrintApi.ZAZUpChar(
      this._handle,
      this._deviceAddr,
      2,
      refTemplateData,
      dataLength
    );
    if (!res) {
      const resData = refTemplateData.slice(0, dataLength.deref() - 1);

      // 转换为Base64字符串
      let bString = "";
      resData.forEach((val: any) => {
        bString += String.fromCharCode(val);
      });
      resStr = btoa(bString);
    }

    // console.log(resData);
    this._onComplete(resStr);
  }

  emmitReadingMsg(val: string) {
    this._message = val;
    this._onReading && this._onReading();
  }

  /**
   * 读取指纹（读卡）
   *
   * @memberof FingerPrintZK
   */
  get readFinger() {
    let resStr = null;
    const templateData = new RefArray(ref.types.byte, 512);
    const refTemplateData = ref.alloc(templateData);
    const dataLength = ref.alloc(ref.types.int); // 模板长度

    const data = this.getFingerData();
    if (data) {
      const res = this._fingerPrintApi.ZAZUpChar(
        this._handle,
        this._deviceAddr,
        1,
        refTemplateData,
        dataLength
      );
      if (!res) {
        const resData = refTemplateData.slice(0, dataLength.deref() - 1);

        // 转换为Base64字符串
        let bString = "";
        resData.forEach((val: any) => {
          bString += String.fromCharCode(val);
        });
        resStr = btoa(bString);
      }
    }
    return resStr;
  }

  /**
   * 取消获取模板
   *
   * @memberof FingerPrintZK
   */
  get cancelRegister() {
    clearInterval(this._interval);
    clearTimeout(this._timeOut);
    return true;
  }
}
