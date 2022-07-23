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

  </div>
</template>

<script>
import Blockly from 'blockly'
import BlocklyJS from 'blockly/javascript';
import './customBlock'
import Robot from './robot'
export default {
  name: "blocklyClass3",
  data() {
    return {
      code:'',
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
      }
    }
  },
  mounted() {
    Blockly.inject(this.$refs.blocklyDiv, this.options);
    this.robot = new Robot()
  },
  methods:{
    /**
     * block代码块转为代码
     */
    block2code(){
      this.code = BlocklyJS.workspaceToCode(this.$refs.blocklyDiv.workspace)
    },

    /**
     * 执行生成代码
     */
    runCode(){
      if(!this.code){alert('请先点击生成代码');return}
      window.robot = this.robot
      eval(this.code)
    },
    runCode2(){
      if(!this.code){alert('请先点击生成代码');return}
      let fn = new Function('robot', this.code)
      fn(this.robot)
    }
  },
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
