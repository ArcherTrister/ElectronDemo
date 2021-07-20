import { fingerVeinApi } from "./finger-devices";
const ref = require("ref-napi");
const RefArray = require("ref-array-napi");

/**
 * 纹宁指纹仪
 *
 * @export
 * @class FingerPrintVein
 * @extends {_fingerPrintApi}
 */
export default class FingerPrintVein implements FingerPrintInterface {
  /**
   * 设备类型
   *
   * @memberof FingerPrintVein
   */
  _deviceType = "FingerVein";

  /**
   * _fingerPrintApi
   */
  _fingerPrintApi: any;

  /**
   * 设备操作句柄
   *
   * @memberof FingerPrintVein
   */
  _handle: any;

  /**
   * 当前指纹图像索引
   *
   * @memberof FingerPrintVein
   */
  _currentImgIndex = 0;

  /**
   * 指纹图像数组
   *
   * @memberof FingerPrintVein
   */
  allSign: any[] = [];

  /**
   * 回发消息
   *
   * @memberof FingerPrintVein
   */
  _message = "";

  /**
   * 重复计时器
   *
   * @memberof FingerPrintVein
   */
  _interval: any;

  /**
   * 超时计时器
   *
   * @memberof FingerPrintVein
   */
  _timeOut: any;

  /**
   * 读取指纹中事件
   *
   * @memberof FingerPrintVein
   */
  _onReading: any;

  /**
   * 读取指纹完成事件
   *
   * @memberof FingerPrintVein
   */
  _onComplete: any;

  /**
   *Creates an instance of FingerPrintVein.
   * @memberof FingerPrintVein
   */
  constructor() {
    // super();
    this._fingerPrintApi = fingerVeinApi();
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
   * @memberof FingerPrintVein
   */
  get searchDevice() {
    return this.initDevice();
  }

  /**
   * 初始化指纹设备
   *
   * @memberof FingerPrintVein
   */
  initDevice() {
    const dataByteArray = new RefArray(ref.types.byte, 32);
    const refDataByte = ref.alloc(dataByteArray);
    // 初始化指纹设备
    const res = this._fingerPrintApi.FVAPI_GetSerialNumber(refDataByte, 0);
    console.log(res, "FingerPrintVein");
    if (!res) {
      this._handle = refDataByte.toString().trim();
      return true;
    }
    return false;
  }

  /**
   * 初始化指纹设备
   *
   * @memberof FingerPrintVein
   */
  get getRegData() {
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
   * @memberof FingerPrintVein
   */
  timer() {
    this.emmitReadingMsg(
      `请${this.allSign.length ? "再次" : ""}放入手指[${
        this.allSign.length + 1
      }/2]`
    );
    this._interval = setInterval(() => {
      this.waitFingerIn();
    }, 1000);
  }

  waitFingerIn() {
    // 检查手指放置
    if (this._fingerPrintApi.FVAPI_FingerDetect(0) === 3) {
      clearInterval(this._interval);
      // 读取手指
      const data = this.getFingerData();
      if (data) {
        this.allSign.push(data);
        if (this.allSign.length >= 2) {
          clearTimeout(this._timeOut);
          this.emmitReadingMsg("");
          this.createTemplate();
        } else {
          this.emmitReadingMsg("请拿开手指");
          setTimeout(() => {
            this.timer();
          }, 2000);
        }
      } else {
        this.timer();
      }
    }
  }

  getFingerData(): any {
    // 创建指纹静脉字节
    const dataByteArray = new RefArray(ref.types.byte, 512);
    const refDataByte = ref.alloc(dataByteArray);

    const res = this._fingerPrintApi.FVAPI_FetchVeinTemplate(refDataByte, 5000);
    if (res) {
      return null;
    }
    // console.log(realData);
    return refDataByte;
  }

  createTemplate() {
    let resStr = null;
    // console.log(this.allSign);
    const res = this._fingerPrintApi.FVAPI_SameFingerCheck(
      this.allSign[0],
      this.allSign[1],
      0x03
    );
    if (!res) {
      const resData = this.allSign[0];
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
   * @memberof FingerPrintVein
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
   * @memberof FingerPrintVein
   */
  get cancelRegister() {
    clearInterval(this._interval);
    clearTimeout(this._timeOut);
    return true;
  }
}
