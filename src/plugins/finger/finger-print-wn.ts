import { fingerWNApi } from "./finger-devices";
const ref = require("ref-napi");
const RefArray = require("ref-array-napi");

/**
 * 纹宁指纹仪
 *
 * @export
 * @class FingerPrintWN
 * @extends {_fingerPrintApi}
 */
export default class FingerPrintWN implements FingerPrintInterface {
  /**
   * 设备类型
   *
   * @memberof FingerPrintWN
   */
  _deviceType = "FingerprintWenN";

  /**
   * _fingerPrintApi
   */
  _fingerPrintApi: any;

  /**
   * 设备操作句柄
   *
   * @memberof FingerPrintWN
   */
  _handle: any;

  /**
   * 指纹图像宽度
   *
   * @memberof FingerPrintWN
   */
  _imgWidth: any;

  /**
   * 指纹图像高度
   *
   * @memberof FingerPrintWN
   */
  _imgHeight: any;

  /**
   * 当前指纹图像索引
   *
   * @memberof FingerPrintWN
   */
  _currentImgIndex = 0;

  /**
   * 指纹图像数组
   *
   * @memberof FingerPrintWN
   */
  allSign:any[] = [];

  /**
   * 回发消息
   *
   * @memberof FingerPrintWN
   */
  _message = "";

  /**
   * 重复计时器
   *
   * @memberof FingerPrintWN
   */
  _interval: any;

  /**
   * 超时计时器
   *
   * @memberof FingerPrintWN
   */
  _timeOut: any;

  /**
   * 读取指纹中事件
   *
   * @memberof FingerPrintWN
   */
  _onReading: any;

  /**
   * 读取指纹完成事件
   *
   * @memberof FingerPrintWN
   */
  _onComplete: any;

  /**
   *Creates an instance of FingerPrintWN.
   * @memberof FingerPrintWN
   */
  constructor() {
    // super();
    this._fingerPrintApi = fingerWNApi();
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
   * @memberof FingerPrintWN
   */
  get searchDevice() {
    const deviceCount = this._fingerPrintApi.WM_GetDeviceCount();
    console.log(deviceCount, "FingerPrintWN");
    if (deviceCount) {
      return this.initDevice();
    }
    return false;
  }

  /**
   * 初始化指纹设备
   *
   * @memberof FingerPrintWN
   */
  initDevice() {
    const refHandle = ref.alloc(ref.types.int); // 设备句柄
    const refImgWidth = ref.alloc(ref.types.int); // 指纹图片宽度
    const refImgHeight = ref.alloc(ref.types.int); // 指纹图片高度
    // 初始化指纹设备
    const initState = this._fingerPrintApi.WM_Init();
    const res = this._fingerPrintApi.WM_OpenDevice(0, refHandle);
    // console.log(`initDevice||${initState}||${res}`);
    // 获取指纹图像宽高
    this._fingerPrintApi.WM_GetImageInfo(refImgWidth, refImgHeight);
    if (!initState && !res) {
      this._handle = refHandle.deref();
      // console.log(this._handle, refHandle.deref());
      this._imgWidth = refImgWidth.deref();
      this._imgHeight = refImgHeight.deref();
      return true;
    }
    return false;
  }

  /**
   * 获取指纹注册信息
   *
   * @memberof FingerPrintWN
   */
  get getRegData() {
    this._currentImgIndex = 0;
    this.allSign = [];
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
   * @memberof FingerPrintWN
   */
  timer() {
    this.emmitReadingMsg(
      `请${this.allSign.length ? "再次" : ""}放入手指[${
        this.allSign.length + 1
      }/3]`
    );
    this._interval = setInterval(() => {
      this.waitFingerIn();
    }, 1000);
  }

  waitFingerIn() {
    const data = this.getFingerData();
    if (data) {
      this.allSign.push(data);
      clearInterval(this._interval);
      if (this.allSign.length >= 3) {
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
    // 创建指纹图像字节
    const imgLength = ref.alloc(ref.types.int); // 指纹长度
    const imgByteArray = new RefArray(
      ref.types.byte,
      this._imgWidth * this._imgHeight
    );
    const refImgByte = ref.alloc(imgByteArray);

    const res = this._fingerPrintApi.WM_GetImage(
      this._handle,
      0,
      refImgByte,
      imgLength
    );
    if (res) {
      return null;
    }
    // 获取指纹特征
    const extractdata = new RefArray(ref.types.byte, imgLength.deref());
    const dataLength = ref.alloc(ref.types.int); // 特征长度
    const refExtractdata = ref.alloc(extractdata);

    const extractRes = this._fingerPrintApi.WM_Extract(
      refImgByte,
      this._imgWidth,
      this._imgHeight,
      refExtractdata,
      dataLength
    );
    if (extractRes) {
      this.emmitReadingMsg("指纹不清晰，请再试一次");
      return null;
    }
    const realData = refExtractdata.slice(0, dataLength.deref() - 1);
    // console.log(realData);
    return realData;
  }

  createTemplate() {
    let resStr = null;
    const templateData = new RefArray(ref.types.byte, 2048);
    const refTemplateData = ref.alloc(templateData);
    const dataLength = ref.alloc(ref.types.int); // 模板长度
    console.log(this.allSign);
    const res = this._fingerPrintApi.WM_GenTemplate(
      this.allSign[0],
      this.allSign[1],
      this.allSign[2],
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
   * @memberof FingerPrintWN
   */
  get readFinger() {
    let resStr = null;
    const data = this.getFingerData();
    if (data) {
      // 转换为Base64字符串
      let bString = "";
      data.forEach((val: any) => {
        bString += String.fromCharCode(val);
      });
      resStr = btoa(bString);
    }
    return resStr;
  }

  /**
   * 取消获取模板
   *
   * @memberof FingerPrintWN
   */
  get cancelRegister() {
    clearInterval(this._interval);
    clearTimeout(this._timeOut);
    return true;
  }
}
