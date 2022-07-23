<template>
  <div>
    <div class="blocklyDiv" ref="blocklyDiv">
    </div>
    <xml ref="blocklyToolbox" style="display:none">
      <slot></slot>
    </xml>
  </div>
</template>
<script >

import Blockly from 'blockly';
import Interpreter from 'js-interpreter'
import {FixedEdgesMetricsManager} from '@blockly/fixed-edges';
import utils from "../../utils/utils";
import * as hans from 'blockly/msg/zh-hans'
Blockly.setLocale(hans);


export default {
  name: 'BlocklyComponent',
  props: ['robotController',"projectId"],
  data() {
    return {
      robotCtr:null,
      workspace: null,
      isStop:true,
      runNext:0,
      // blockly参数设定
      options: {
        media: 'media/',
        zoom:
            {
              controls: true,
              wheel: false,//鼠标滚动缩放
              startScale: 1.0,
              maxScale: 3,
              minScale: 0.8,
              scaleSpeed: 1.2
            },
        trashcan: false,//垃圾桶
        scrollbars: true,
        theme: "deuteranopia",
        renderer: "zelos",
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true
          },
          drag: true,
          wheel: true
        },
        oneBasedIndex: true,
        horizontalLayout: true,//工具箱水平
        toolboxPosition: "end",//工具箱在底部
        grid:
            {
              spacing: 100,
              length: 3,
              colour: '#ccc',
              snap: true//网格吸附
            },
        toolbox:
            {
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

  methods:{
    runCodeClick(){
      console.log("runCodeClick")

      if(this.isStop){
        window.step_btn()
      }else{
        console.log("程序还没运行完，别急")
      }


    },
    stopCodeClick(){
      console.log("stopCodeClick")
      window.stop_btn()
    },
  },

  watch:{
    robotController(){
      // console.log("robotController数据更新",this.$props.robotController)
      this.robotCtr = this.$props.robotController
    },


    runNext(){
      // console.log("runNext",this.runNext)
      if(this.runNext && !this.isStop){
        window.step_btn()

      }
    },

  },

  mounted() {
    var options = this.options;
    if (!options.toolbox) {
      options.toolbox = this.$refs["blocklyToolbox"];
    }

    this.robotCtr = this.$props.robotController

    // 固定左上边缘，不可往这两个方向扩展
    FixedEdgesMetricsManager.setFixedEdges({
      top: true,
      left: true,
    });


    options['plugins'] = {
      metricsManager: FixedEdgesMetricsManager,
    }




    this.workspace = Blockly.inject(this.$refs["blocklyDiv"], options);

    /**
     * 实时存储代码库到本地
     */

    var that = this
    function myUpdateFunction(event) {

        //更新高亮代码
        if (!(event instanceof Blockly.Events.Ui)) {
          generateCodeAndLoadIntoInterpreter();
        }
    }

    this.workspace.addChangeListener(myUpdateFunction);


    /**
     *  逐行运行代码
     */


    var myInterpreter = null;

    function initApi(interpreter, globalObject) {

      var hightlightWrapper = function(id) {
        // console.log("highlightBlock")
        that.isStop = false
        id = String(id || '');
        return highlightBlock(id);
      };
      interpreter.setProperty(globalObject, 'highlightBlock',
          interpreter.createNativeFunction(hightlightWrapper));

      // Create 'robot' global object.
      var robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'robot', robot);

      // Define 'robot.init' function.
      var iniWrapper = function init() {
        that.isStop = false
        that.runNext += 1
        highlightPause = true;
        return that.robotCtr.init();
      };
      interpreter.setProperty(robot, 'init',
          interpreter.createNativeFunction(iniWrapper));

      // Define 'robot.stop' function.
      var stopWrapper = function stop() {
        that.isStop = true
        highlightPause = false;
        return that.robotCtr.stop();
      };
      interpreter.setProperty(robot, 'stop',
          interpreter.createNativeFunction(stopWrapper));

      // Define 'robot.move' function.
      var moveWrapper = function move(distance) {
        highlightPause = true;
        that.robotCtr.moveBlockly(distance,function (result){
          utils.debugLog("result",result)
          highlightPause = false;
          that.runNext += 1
        })
      };
      interpreter.setProperty(robot, 'move',
          interpreter.createNativeFunction(moveWrapper));

      // Define 'robot.turn' function.
      var turnWrapper = function turn(dir,degree) {
        highlightPause = true;
        that.robotCtr.turnBlockly(dir,degree,function (result){
          utils.debugLog("result",result)
          highlightPause = false;
          that.runNext += 1
        })
      };
      interpreter.setProperty(robot, 'turn',
          interpreter.createNativeFunction(turnWrapper));

      // Define 'robot.arc' function.
      var arcWrapper = function arc(dir,degree,radius) {
        highlightPause = true;
        that.robotCtr.arcBlockly(dir,degree,radius,function (result){
          utils.debugLog("result",result)
          highlightPause = false;
          that.runNext += 1
        })
      };
      interpreter.setProperty(robot, 'arc',
          interpreter.createNativeFunction(arcWrapper));

      // drawable

      var drawableWrapper = function pencilAction(drawable) {
        highlightPause = true;
        that.robotCtr.drawableBlockly(drawable,function (result){
          utils.debugLog("result",result)
          highlightPause = false;
          that.runNext += 1
        })
      };
      interpreter.setProperty(robot, 'drawable',
          interpreter.createNativeFunction(drawableWrapper));

    }

    var highlightPause = false;
    var latestCode = '';

    function highlightBlock(id) {
      that.workspace.highlightBlock(id);
      highlightPause = false;
    }

    function resetStepUi(clearOutput) {
      that.workspace.highlightBlock(null);
      highlightPause = false;

      if (clearOutput) {
        utils.debugLog('clearOutput');
      }
    }

    function generateCodeAndLoadIntoInterpreter() {
      utils.debugLog("generateCodeAndLoadIntoInterpreter")
      // Generate JavaScript code and parse it.
      Blockly.JavaScript.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
      Blockly.JavaScript.addReservedWords('highlightBlock');
      latestCode = Blockly.JavaScript.workspaceToCode(that.workspace);
      resetStepUi(true);
    }

    function stepCode() {
      if (!myInterpreter) {

        resetStepUi(true);
        utils.debugLog("latestCode",latestCode)
        myInterpreter = new Interpreter(latestCode, initApi);

        setTimeout(function() {
          highlightPause = true;
          stepCode();
        }, 1);
        return;
      }
      highlightPause = false;
      do {
        try {
          //一步一步运行代码
          var hasMoreCode = myInterpreter.step();
        } finally {
          if (!hasMoreCode) {

            utils.debugLog('代码执行完了');

            myInterpreter = null;
            resetStepUi(false);

          }
        }

      } while (hasMoreCode && !highlightPause);
    }

    function stopCode(){
      that.isStop = true
      that.robotCtr.stop()
      resetStepUi(true);
      highlightPause = true
      myInterpreter = null

    }

    window.step_btn = stepCode
    window.stop_btn = stopCode



  }
}
</script>

<style scoped>
.blocklyDiv {
  width: calc(100vw - 50px);
  top: 100px;
  height: calc(100vh - 50px);
  text-align: left;
}
</style>
