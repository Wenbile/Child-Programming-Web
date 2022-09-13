<template>
  <div id="blockly">
    <!-- 工作区 -->
    <div id="blocklyDiv" ref="blocklyDiv" style="height: 500px; width: 800px;"></div>
    <button style="position: fixed;left: 50px;top: 10px;" @click="block2code">生成代码</button>
    <!-- 代码显示区 -->
    <div style="background-color: lightgrey;width: 800px;text-align: left">
      <pre v-html="code?code:'请点击生成代码按钮'"></pre>
    </div>
    <button style="position: fixed;left: 150px;top: 10px;" @click="runCode">eval执行代码</button>
    <button style="position: fixed;left: 300px;top: 10px;" @click="runCode2">new Function执行代码</button>
    <button style="position: fixed;left: 500px;top: 10px;" @click="runCode3">js-interpreter执行代码</button>
  </div>
</template>

<script>
import Blockly from 'blockly'
import BlocklyJS from 'blockly/javascript';
import './customBlock'
import Robot from './robot'
import Interpreter from "js-interpreter";
export default {
  name: "blocklyClass4",
  data() {
    return {
      code: '',
      options: {
        horizontalLayout: true,//工具箱水平
        toolboxPosition: "end",//工具箱在底部
        toolbox: {
          "kind": "flyoutToolbox",
          "contents": [
            {
              "kind": "block",
              "type": "while_program_start",
            },
            {
              "kind": "block",
              "type": "move",
            },
            {
              "kind": "block",
              "type": "turn",
            },
            {
              "kind": "block",
              "type": "arc"
            },
            {
              "kind": "block",
              "type": "draw"
            },
            {
              "kind": "block",
              "type": "pencilcolor"
            },
            {
              "kind": "block",
              "type": "controls_repeat_ext"
            },
            {
              "kind": "block",
              "type": "controls_whileUntil"
            },
            {
              "kind": "block",
              "type": "controls_for"
            },
            {
              "kind": "block",
              "type": "controls_if"
            },
            {
              "kind": "block",
              "type": "logic_compare"
            },
            {
              "kind": "block",
              "type": "logic_operation"
            },
            {
              "kind": "block",
              "type": "logic_negate"
            },
            {
              "kind": "block",
              "type": "logic_boolean"
            },
            {
              "kind": "sep",
              "gap": "32"
            },
            {
              "kind": "block",
              "blockxml": "<block type='math_number'><field name='NUM'>10</field></block>"
            },
            {
              "kind": "block",
              "type": "math_arithmetic"
            },
            {
              "kind": "block",
              "type": "math_single"
            },
            {
              "kind": "block",
              "type": "text"
            },
            {
              "kind": "block",
              "type": "text_length"
            },
            {
              "kind": "block",
              "type": "text_print"
            },
            {
              "kind": "block",
              "type": "variables_get"
            },
            {
              "kind": "block",
              "type": "variables_set"
            },
          ]
        }
      },
      workspace: null
    }
  },
  mounted() {
    this.initHighlightBlock()
    this.workspace = Blockly.inject(this.$refs.blocklyDiv, this.options);
    this.robot = new Robot()
  },
  methods: {
    /**
     * block代码块转为代码
     */
    block2code() {
      this.code = BlocklyJS.workspaceToCode(this.$refs.blocklyDiv.workspace)
    },
    /**
     * 执行生成代码
     */
    runCode() {
      if (!this.code) {
        alert('请先点击生成代码');
        return
      }
      window.robot = this.robot
      eval(this.code)
    },
    runCode2() {
      if (!this.code) {
        alert('请先点击生成代码');
        return
      }
      let fn = new Function('robot', this.code)
      fn(this.robot)
    },
    runCode3() {
      if (!this.code) {
        alert('请先点击生成代码');
        return
      }
      // 实例化js解析器
      // 在创建js解析器期间，会调用initApi方法创建解析器的全局变量
      let myInterpreter = new Interpreter(this.code, this.initApi);
      console.log('myInterpreter', myInterpreter)
      // this.initJsInterpreter(this.code)
      this.runStepByStep(myInterpreter)
    },
    runStepByStep(myInterpreter){
      if (myInterpreter) {
        var hasMore = myInterpreter.run();
        if (hasMore) {
          // 执行当前被某个异步调用阻止。
          //请稍后再试。
          setTimeout(this.runStepByStep, 10, myInterpreter);
        } else {
          this.highlightBlock(null);
          console.log('代码全部执行完了');
        }
      }

    },
    initHighlightBlock() {
      // 可以在生成JavaScript代码之前通过设置STATEMENT_PREFIX在逐条语句级别上完成此操作
      Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
      // 将highlightBlock添加为保留字
      Blockly.JavaScript.addReservedWords('highlightBlock');
    },

    highlightBlock(id) {
      this.workspace.highlightBlock(id);
    },

    initApi(interpreter, globalObject) {
      let that = this

      // 创建 'highlightBlock' 的函数
      var hightlightWrapper = function(id) {
        // console.log("highlightBlock")
        id = String(id || '');
        return that.highlightBlock(id);
      };
      interpreter.setProperty(globalObject, 'highlightBlock',
          interpreter.createNativeFunction(hightlightWrapper));

      // 创建 'robot' 的全局对象
      var robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'robot', robot);
      // 定义 'robot.init' 的函数
      let iniWrapper = function init() {
        return that.robot.init();
      };
      interpreter.setProperty(robot, 'init',
          interpreter.createNativeFunction(iniWrapper));
      // 定义 'robot.stop' 的函数
      var stopWrapper = function stop() {
        return that.robot.stop();
      };
      interpreter.setProperty(robot, 'stop',
          interpreter.createNativeFunction(stopWrapper));
      // 定义 'robot.move' 的函数
      // interpreter.createAsyncFunction接受的函数最后一个参数为callback必须调用了才视为异步函数执行完成
      var moveWrapper = function move(distance, callback) {
        that.robot.move(distance).then(()=>{
          console.log('move完成了')
          callback(1)
        })
      };
      interpreter.setProperty(robot, 'move',
          interpreter.createAsyncFunction(moveWrapper));
      // 定义 'robot.arc' 的函数
      var arcWrapper = function arc(dir, degree, radius, callback) {
        that.robot.arc(dir, degree, radius).then(()=>{
          console.log('arc完成了')
          callback()
        })
      };
      interpreter.setProperty(robot, 'arc',
          interpreter.createAsyncFunction(arcWrapper));
    }
  }
}
</script>

<style scoped>
#blockly {
  position: absolute;
  left: 50px;
  top: 50px;
  bottom: 0;
  width: calc(100vw - 50px);
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
}
</style>
