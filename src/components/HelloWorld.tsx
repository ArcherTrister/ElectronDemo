import { defineComponent, Ref, ref, onMounted } from "vue";
import { readIDCard, readIDCardCall } from "../plugins/idcard/idcard-read-hs";
import FingerHelper from "../plugins/finger/finger-helper";
import { testAddApi, init } from "./test";

export default defineComponent({
  name: "HelloWorld",
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const testAdd = testAddApi();
    console.log(testAdd);
    console.log(init());
    const iii = init();
    iii(null, function (error:any, result:any) {
      if (error) throw error;
      console.log(result);
    });
    
    const result = testAdd.funAdd(1, 20);
    console.log(result);
    // let internalInstance = getCurrentInstance();
    //call ffi test

    const count = ref(0);
    const countButtonClick = () => count.value++;
    const numA = ref(0);
    const numB = ref(0);
    const addBtnClick = () => {
      const result = testAdd.funAdd(numA.value, numB.value);
      console.log(result);
    };

    const readIDCardBtnClick = () => {
      const idCardInfo = readIDCard();
      console.log(idCardInfo);

      //test();
      //console.log(typeof test);

      // readIDCard(event);
      // console.log(event);

      //console.log(internalInstance?.appContext.config);
      // console.log(internalInstance?.appContext.config.globalProperties);
      // const idCardInfo =
      //   internalInstance?.appContext.config.globalProperties.$device.readIDCard(
      //     true
      //   );
      // console.error(idCardInfo);
      // const { errorCode, errorMsg } = idCardInfo;
      // if (errorCode !== 0) {
      //   //this.handleError(errorMsg);
      //   console.error(errorMsg);

      //   return;
      // }

      //this.getLeaguer(idCardInfo.idCardNum, 'IDCardReader');
    };

    const deviceInstance: Ref<FingerPrintInterface | null> = ref(null);
    onMounted(async () => {
      deviceInstance.value = await FingerHelper.defaultMachine;
      if (deviceInstance) {
        deviceInstance.value._onReading = handleOnReading;
        deviceInstance.value._onComplete = handleOnComplete;
        console.log(deviceInstance);
      }
    });
    const message = ref("");
    const handleOnReading = () => {
      let msg = deviceInstance.value?.currentMessage;
      message.value = msg !== undefined ? msg : "";
    };
    const handleOnComplete = (val: string) => {
      console.log(val);
      // if (val) {
      //   this.$message({
      //     showClose: true,
      //     message: '获取指纹信息成功',
      //     type: 'success',
      //   });
      // } else {
      //   this.$message({
      //     showClose: true,
      //     message: '获取指纹信息失败',
      //     type: 'fail',
      //   });
      // }
    };

    return () => (
      <>
        <h1>{props.msg}</h1>

        <p>
          Recommended IDE setup:
          <a href="https://code.visualstudio.com/" target="_blank">
            VSCode
          </a>
          &nbsp;+&nbsp;
          <a
            href="https://marketplace.visualstudio.com/items?itemName=octref.vetur"
            target="_blank"
          >
            Vetur
          </a>
          &nbsp;or&nbsp;
          <a href="https://github.com/johnsoncodehk/volar" target="_blank">
            Volar
          </a>
          &nbsp;(if using&nbsp;
          <code>&lt;script setup&gt;</code>&nbsp;)
        </p>

        <p>
          See <code>README.md</code> for more information.
        </p>

        <p>
          <a href="https://vitejs.dev/guide/features.html" target="_blank">
            Vite Docs
          </a>{" "}
          |&nbsp;
          <a href="https://v3.vuejs.org/" target="_blank">
            Vue 3 Docs
          </a>
        </p>

        <button onClick={countButtonClick}>count is: {count.value}</button>
        <p>
          Edit&nbsp;
          <code>components/HelloWorld.tsx</code> to test hot module replacement.
        </p>
        <p>
          <input v-model={numA.value} />
          <input v-model={numB.value} />
          <button onClick={addBtnClick}>调用dll计算</button>
        </p>
        <p>
          <button onClick={readIDCardBtnClick}>读取身份证信息</button>
        </p>
      </>
    );
  },
});
