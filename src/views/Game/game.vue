<template>
  <v-app>
    <div style="height: 100%;width: 100%;">
      <div class="navgationbar" @click="saveProject">

        <v-dialog
            v-model="dialog"
            persistent
            max-width="290"
            style="z-index: 10009"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                class="backbtn"
                elevation="0"
                rounded
                icon
                large
                color="#80441E"
                v-bind="attrs"
                v-on="on"
            >

              <v-icon>mdi-reply</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="text-h5">
              确定退出吗？
            </v-card-title>
            <v-card-text>退出之前保存项目，可以在下次进入后继续编辑</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="grey"
                  text
                  @click="backAction"
              >
                继续退出
              </v-btn>
              <v-btn
                  color="green darken-1"
                  text
                  @click="saveProjectAndExit"
              >
                保存
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


        <div class="title"> {{ projectTitle ? projectTitle : "imRobot新项目" }}</div>
        <v-btn
            class="blebtn"
            elevation="0"
            rounded
            icon
            large
            color="white"
            @click="playAction"
        >
          <v-icon>mdi-bluetooth-audio</v-icon>
        </v-btn>

      </div>
      <v-btn
          class="btnplay"
          elevation="0"
          rounded
          icon
          large
          color="#4E737B"
          @click="playAction"
      >
        <v-icon>mdi-play</v-icon>
      </v-btn>
      <v-btn
          class="btnstop"
          elevation="0"
          rounded
          icon
          large
          color="#4E737B"
          @click="stopAction"
      >
        <v-icon>mdi-stop</v-icon>
      </v-btn>
      <v-btn
          v-show="!show3D"
          class="btn3d"
          elevation="2"
          fab
          icon
          @click="show3DAction"
      >
        <v-icon>mdi-menu-open</v-icon>
      </v-btn>


      <blocklycomponent id="blockly2" :options="options" :robotController="robotController" :projectId="projectId"
                        ref="foo"></blocklycomponent>
      <div class="window1" v-window="windowParams" v-show="show3D">
        <div class="window__header">
          <div style="display: flex;justify-content: space-between;">
            <div style="padding: 10px 20px 5px 20px; color: white;display: flex">仿真
              <div id="fps"></div>
            </div>

            <v-btn
                icon
                @click="close3dAction"
                color="white"
                style="padding: 10px 20px 5px 20px;"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <!--        3d-->
        <div style="z-index: 10001;padding-left: 10px;" v-show="show3D">
          <canvas id="renderCanvas">

          </canvas>
        </div>
      </div>
      <div class="window1" v-window="windowParams" v-show="!show3D">
        <div class="window__header">
          <div style="display: flex;justify-content: space-between;">
            <div>生成代码</div>
          </div>
        </div>
        <div style="z-index: 10001;" v-show="!show3D">

          <button v-on:click="showCode()">Show JavaScript</button>
          <pre v-html="code"></pre>
        </div>
      </div>

      <Modal :show="show" :title="title" @hideModal="hideModal" @submit="submit">
        <v-text-field
            class="centered-input text--darken-3 mt-3"
            v-model="projectTitle"
            placeholder="输入项目名称"

            solo-inverted
            flat
        ></v-text-field>
      </Modal>

    </div>
  </v-app>


</template>

<script>
/**
 * babylon
 ***/
import scenceCanvas from "./scenceCanvas";

import robot from './robot'

window.robot = robot

var sceneToRender = null;

// window.addEventListener('DOMContentLoaded', () => loadScene(),false);
/******* 场景创建 ******/
async function loadScene() {

  var createScene = async function () {

    // 获取到renderCanvas这个元素
    var canvas = document.getElementById("renderCanvas");
    var fps = document.getElementById("fps");
    scenceCanvas.cleanDrawLines()
    sceneToRender = await scenceCanvas.init(canvas, fps)

    robot.initScene(sceneToRender, scenceCanvas.getRobot(), scenceCanvas.getStartPoint())
    robot.initRobotPenclDynamicTexture(scenceCanvas.getRobotPenclDynamicTexture())
    scenceCanvas.bindRobotController(robot.getRobotInstance())
    return robot.getRobotInstance()
  };
  var robtctr = await createScene()
  return robtctr
}

/******* End of the create scene function ******/


/**
 * blocky
 */
import blocklycomponent from './components/BlocklyComponent.vue'
import './blocks/stocks';

import BlocklyJS from 'blockly/javascript';


import Modal from "../../components/Modal"
// import utils from "./utils";
import Blockly from "blockly";
import utils from "./utils";


export default {
  name: "game",
  components: {
    'blocklycomponent': blocklycomponent,
    Modal
  },
  data() {
    return {
      projectId: null,
      dialog: false,
      isExitAfterSave: false,
      show3D: true,
      isShowCode: true,
      projectTitle: "",

      title: '保存项目',
      show: false,

      windowParams: {
        movable: true,
        resizable: false
      },

      code: '',
      //机器人控制实例
      robotController: null,
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
              ]
            }
      }
    }
  },
  methods: {
    /**
     * babylon
     */
    show3DAction() {
      console.log("show3DAction")
      this.show3D = !this.show3D
      if (this.show3D == false) {
        this.showCode()
      }

    },

    close3dAction() {
      this.show3D = false
    },


    playAction() {
      this.$refs["foo"].runCodeClick()
    },

    stopAction() {
      this.$refs["foo"].stopCodeClick()
    },

    saveProject() {
      this.show = true
    },


    backAction() {
      this.dialog = false
      this.$router.back()
    },


    /**
     * blocky
     */
    showCode() {
      this.code = BlocklyJS.workspaceToCode(this.$refs["foo"].workspace);
      // this.$refs["foo"].clc()
      // eval(this.code)
    },

    hideModal() {
      // 取消弹窗回调
      this.show = false
    },

    submit() {
      // 确认弹窗回调

      this.saveProjectToLocal()

      this.show = false
    },

    saveProjectAndExit() {
      if (!this.projectTitle) {
        this.dialog = false
        this.isExitAfterSave = true
        this.saveProject()
      } else {
        this.saveProjectToLocal()
        this.backAction()
      }

    },

    saveProjectToLocal() {

      this.show = false


      const xml = Blockly.Xml.workspaceToDom(this.$refs["foo"].workspace);
      const xml_text = Blockly.Xml.domToText(xml);
      window.localStorage.setItem(this.projectId, xml_text);

      var myProjectsList = utils.getLocalProjects()

      const newtime = new Date().Format("yyyy-MM-dd HH:mm:ss")
      var projectExit = false
      for (const myProjectsListElement of myProjectsList) {
        if (myProjectsListElement.id == this.projectId) {
          myProjectsListElement.name = this.projectTitle
          myProjectsListElement.update_time = newtime
          projectExit = true
          break
        }
      }



      if (!projectExit)  {
        var newProject =
            {
              "id": this.projectId,
              "name": this.projectTitle,
              "time": newtime,
              "update_time": newtime,
              "img": "art.png",
            }


        myProjectsList.push(newProject)

      }

      console.log("xml_text",xml_text)

      window.localStorage.setItem("MyProjects", JSON.stringify(myProjectsList));




      if (this.isExitAfterSave) {
        this.isExitAfterSave = false
        this.$router.back()
      }
    },


  },

  mounted() {
    //get projectid
    // console.log("this.$route.query.project_id",this.$route.query.project_id)
    this.projectId = this.$route.query.project_id

    var myProjectsList = utils.getLocalProjects()

    for (const myProjectsListElement of myProjectsList) {
      if (myProjectsListElement.id == this.projectId) {
        this.prepareTitle = myProjectsListElement.name
        break
      }
    }

    //获取本地存储的代码块
    var xml_text = window.localStorage.getItem(this.projectId);
    console.log("xml_text", xml_text)
    if (xml_text) {
      const xml = Blockly.Xml.textToDom(xml_text);
      Blockly.Xml.domToWorkspace(xml, this.$refs["foo"].workspace);
    }


    (async () => {
      //新建3d场景
      var robotctl = await loadScene()
      // console.log("robotctl",robotctl)
      this.robotController = robotctl
      // console.log("this.robotController",this.robotController)

    })();
    // setTimeout(function (){
    //   scenceCanvas.resizeEngine()
    // },1000)
  },
}
</script>

<style scoped>
#renderCanvas {
  /*position: fixed;*/
  width: 680px;
  height: 680px;
  /*top: 40px;*/
  /*right: 0;*/
  touch-action: none;
  z-index: 10000;
  border-radius: 10px;
}

.window1 {
  background-color: #505781;
  border-radius: 10px;
  width: 700px;
  position: fixed;
  top: 5px;
  right: 55px;
  z-index: 10005;
}

html, body {
  margin: 0;
}

#code {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  background-color: beige;
}

#blockly1 {
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 50%;
}

#blockly2 {
  position: absolute;
  left: 50px;
  top: 50px;
  bottom: 0;
  width: calc(100vw - 50px);
  height: calc(100vh - 50px);
}

.btn3d {
  position: absolute;
  right: 20px;
  top: 160px;
  width: 50px;
  height: 50px;
  z-index: 9999;
}

.navgationbar {
  position: absolute;
  left: 10px;
  top: 5px;
  width: 500px;
  height: 50px;
  background-color: #505781;
  border-radius: 5px;
  border-top-left-radius: 60px;
  border-bottom-left-radius: 60px;
  z-index: 9999;
}

.backbtn {
  position: absolute;
  left: -5px;
  top: 0px;
  width: 56px;
  height: 56px;
  background-color: #E28B20;
  border: solid 6px white;
  border-radius: 30px;
  z-index: 9999;
}

.blebtn {
  position: absolute;
  left: 450px;
  top: 5px;
  width: 40px;
  height: 40px;
  background-color: #32424B;
  border-radius: 25px;
  z-index: 9999;
}

.title {
  width: 100%;
  text-align: center;
  margin-top: 9px;
  color: white;
}


.btnplay {
  position: absolute;
  left: 10px;
  top: 70px;
  width: 40px;
  height: 120px;
  border: solid 2px #4E737B;
  z-index: 9999;
}

.btnstop {
  position: absolute;
  left: 10px;
  top: 200px;
  width: 40px;
  height: 40px;
  border: solid 2px #4E737B;
  z-index: 9999;
}

div#blocklyDiv .blocklyToolboxDiv {
  background: #00C901;
}

#fps {
  text-align: center;
  font-size: 16px;
  color: white;
  width: 60px;
  height: 20px;
}

/*.box33{*/
/*  width: 600px;*/
/*  height: 600px;*/
/*  border: 1px solid red;*/
/*  z-index: 10005;*/
/*  background: url("./robot_loading.gif") no-repeat;*/
/*}*/

/deep/ .centered-input input {
  text-align: center;
  padding: 15px 30px;
  font-size: 20px;
}

/deep/ .centered-input input::placeholder {
  /*color: red!important;*/
  /*opacity: 1;*/
  text-align: center;
  font-size: 20px;
}
</style>