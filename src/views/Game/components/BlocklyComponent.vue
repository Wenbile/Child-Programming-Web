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
import utils from "../utils";
import * as hans from 'blockly/msg/zh-hans'
Blockly.setLocale(hans);

// import * as d3 from "d3-selection";
// import {ContinuousToolbox, ContinuousFlyout, ContinuousMetrics} from '@blockly/continuous-toolbox';
export default {
  name: 'BlocklyComponent',
  props: ['options','robotController',"projectId"],
  data() {
    return {
      robotCtr:null,
      workspace: null,
      isStop:true,
      runNext:0,
      // isCodeRuning:false,
    }
  },

  methods:{
    runCodeClick(){
      console.log("runCodeClick")
      // if(!isCodeRuning){
      if(this.isStop){
        window.step_btn()
      }else{
        console.log("程序还没运行完，别急")
      }

      // }

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
    var options = this.$props.options || {};
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


    // this.workspace.scrollbar = new Blockly.Scrollbar(this.workspace, false);

    // console.log("this.workspace.trashcan",this.workspace.trashcan.getBoundingRectangle())
    // var rect2 = this.workspace.trashcan.getBoundingRectangle()
    // var rect = new Blockly.utils.Rect(rect2.top,rect2.bottom,0,rect2.right-rect2.left)
    // console.log("rect",rect)
    // this.workspace.trashcan.position(this.workspace.getMetricsManager().getUiMetrics(),rect)
    // Blockly.svgResize(Blockly.getMainWorkspace())


    // Blockly.Blocks['block_type'] = {
    //   init: function() {
    //     this.appendDummyInput()
    //         .appendField("when program start");
    //     this.setPreviousStatement(true, null);
    //     this.setNextStatement(true, null);
    //     this.setColour(315);
    //     this.setTooltip("123");
    //     this.setHelpUrl("1");
    //   }
    // };


    // var that = this
    // function onFirstComment(event) {
    //   if (event.type == Blockly.Events.VIEWPORT_CHANGE) {
    //     Blockly.svgResize(Blockly.getMainWorkspace())
    //     console.log("blockly在缩放");
    //     // d3.selectAll('g.blocklyTrash').attr('transform', 'translate(0,35)')
    //
    //     //transform="translate(2,0) scale(1.290784508319092)"
    //     //transform: translate(2, 0) scale(0.821267, 0.821267);
    //     // d3.selectAll('g.blocklyBlockCanvas').attr('transform', 'translate(2, 0) scale(1, 1)')
    //     // d3.selectAll('path.blocklyFlyoutBackground').attr('d', 'M 0,8 a 8 8 0 0 1 8 -8 h 1298 a 8 8 0 0 1 8 8 v 93 h -1314 z')
    //     // d3.selectAll('svg.blocklyFlyout').attr('style', 'display: block; transform: translate(0px, 770px);').attr('height','101')
    //
    //
    //     // for (const svgKey in svg._groups[0]) {
    //     //
    //     // }
    //     // console.log(svg)
    //     // console.log(svg._groups[0])
    //     // for (const svgKey in svg._groups[0]) {
    //     //
    //     // }
    //     // document.getElementsByClassName('blocklyBlockCanvas')[1].style.transform = "translate(2, 0) scale(1, 1)"
    //     // that.workspace.removeChangeListener(onFirstComment);
    //   }
    // }
    //
    // this.workspace.addChangeListener(onFirstComment);

    /**
     * 实时存储代码库到本地
     */

    var that = this
    function myUpdateFunction(event) {
      // utils.debugLog("event",event)
      // const code_js = Blockly.JavaScript.workspaceToCode(that.workspace);
      // utils.debugLog('存储的js: ', code_js);
      // const xml = Blockly.Xml.workspaceToDom(that.workspace);
      // const xml_text = Blockly.Xml.domToText(xml);
      // window.localStorage.setItem('xml_text',xml_text);

        //更新高亮代码
        if (!(event instanceof Blockly.Events.Ui)) {
          generateCodeAndLoadIntoInterpreter();
        }
    }

    this.workspace.addChangeListener(myUpdateFunction);

    // //获取本地存储的代码块
    // const xml_text = window.localStorage.getItem('xml_text');
    // const xml = Blockly.Xml.textToDom(xml_text);
    // Blockly.Xml.domToWorkspace(xml, this.workspace);


    /**
     *  逐行运行代码
     */


    var myInterpreter = null;

    function initApi(interpreter, globalObject) {
      // console.log("globalObject",globalObject)
      // Add an API function for highlighting blocks.
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
      // console.log("robotCtr",that.robotCtr)
      // console.log("stepCode")
      if (!myInterpreter) {
        // First statement of this code.
        // Clear the program output.
        resetStepUi(true);
        utils.debugLog("latestCode",latestCode)
        myInterpreter = new Interpreter(latestCode, initApi);

        // And then show generated code in an alert.
        // In a timeout to allow the outputArea.value to reset first.
        setTimeout(function() {
          // alert('Ready to execute the following code\n' +
          //     '===================================\n' + latestCode);
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
            // Program complete, no more code to execute.
            utils.debugLog('代码执行完了');

            myInterpreter = null;
            resetStepUi(false);

          }
        }
        // Keep executing until a highlight statement is reached,
        // or the code completes or errors.
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.blocklyDiv {
  width: calc(100vw - 50px);
  top: 100px;
  height: calc(100vh - 50px);
  text-align: left;
}
</style>
