interface FingerPrintInterface {
  /**
   * 设备类型
   *
   * @memberof _deviceType
   */
  _deviceType: string;

  /**
   * fingerPrintApi
   *
   * @memberof _fingerPrintApi
   */
  _fingerPrintApi: any;

  /**
   * 设备操作句柄
   *
   * @memberof FingerPrintZA
   */
  _handle: any;

  /**
   * 当前指纹图像索引
   *
   * @memberof _currentImgIndex
   */
  _currentImgIndex: number;

  // /**
  //  * 当前指纹图像索引
  //  *
  //  * @memberof _deviceAddr
  //  */
  // _deviceAddr: any;

  /**
   * 回发消息
   *
   * @memberof _message
   */
  _message: string;

  /**
   * 重复计时器
   *
   * @memberof _interval
   */
  _interval: any;

  /**
   * 超时计时器
   *
   * @memberof _timeOut
   */
  _timeOut: any;

  /**
   * 读取指纹中事件
   *
   * @memberof _onReading
   */
  _onReading: Function;

  /**
   * 读取指纹完成事件
   *
   * @memberof _onComplete
   */
  _onComplete: Function;

  /**
   * 获取设备类型
   *
   * @memberof deviceType
   */
  deviceType: string;

  /**
   * 获取当前信息
   *
   * @memberof currentMessage
   */
  currentMessage: string;

  /**
   * 查找指纹设备,如果找到便初始化
   *
   * @memberof searchDevice
   */
  searchDevice: boolean;

  /**
   * 初始化指纹设备
   *
   * @memberof initDevice
   */
  initDevice(): boolean;

  // /**
  //  * 获取指纹注册信息
  //  *
  //  * @memberof getRegData
  //  */
  // getRegData();
  getRegData:boolean;

  /**
   * 轮询计时器
   *
   * @memberof timer
   */
  timer(): void;
  /**
   * 等待指纹录入
   *
   * @memberof timer
   */
  waitFingerIn(): void;

  getFingerData(): boolean;

  createTemplate(): void;

  emmitReadingMsg(val: string): void;

  /**
   * 读取指纹（读卡）
   *
   * @memberof readFinger
   */
  readFinger: string | null;

  /**
   * 取消获取模板
   *
   * @memberof cancelRegister
   */
  cancelRegister: boolean;
}