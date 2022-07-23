<template>
  <div id="blockly">
    <!-- 工作区 -->
    <div id="blocklyDiv" ref="blocklyDiv" style="height: 500px; width: 700px;"></div>
    <button style="position: fixed;left: 50px;top: 10px;" @click="block2code">生成代码</button>
    <!-- 代码显示区 -->
    <div style="background-color: lightgrey;width: 700px;text-align: left">
      {{code?code:'请点击生成代码按钮'}}
    </div>
    <button style="position: fixed;left: 150px;top: 10px;" @click="runCode">执行代码</button>
  </div>
</template>

<script>
import Blockly from 'blockly'
import BlocklyJS from 'blockly/javascript';

export default {
  name: "blocklyClass1",
  data() {
    return {
      code:'',
      options: {
        toolbox: {
          "kind": "flyoutToolbox",

          "contents": [
            {
              "kind": "block",
              "type": "controls_if"
            },
            {
              "kind": "block",
              "type": "controls_repeat_ext"
            },
            {
              "kind": "block",
              "type": "logic_compare"
            }
            ,
            {
              "kind": "block",
              "type": "math_number"
            }
            ,
            {
              "kind": "block",
              "type": "math_arithmetic"
            }
            ,
            {
              "kind": "block",
              "type": "text"
            }
            ,
            {
              "kind": "block",
              "type": "text_print"
            }
          ]
        }
      }
    }
  },
  mounted() {
    Blockly.inject(this.$refs.blocklyDiv, this.options);
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
      console.log('run code', this.code)
      eval(this.code)
    },
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


