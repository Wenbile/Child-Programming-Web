<template>
  <v-app>
    <div style="height: 100%;width: 100%;">
      <!--   导航栏   -->
      <div class="navgationbar" @click="saveProject">
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

      <!--  按钮    -->
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

      <!--  自定义blockly块    -->
      <blocklycomponent
          id="blockly"
          :robotController="robotController"
          :projectId="projectId"
          ref="blockRef">
      </blocklycomponent>

      <!--  3d仿真窗口    -->
      <div class="window1" v-window="windowParams" v-show="show3D">
        <div class="window__header">
          <div style="display: flex;justify-content: space-between;">
            <div style="padding: 10px 20px 5px 20px; color: white;display: flex">仿真
              <div id="fps"></div>
            </div>
            <!--    关闭窗口按钮        -->
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
        <!--    3d引擎加载的画布    -->
        <div style="z-index: 10001;padding-left: 10px;" v-show="show3D">
          <canvas id="renderCanvas">
          </canvas>
        </div>
      </div>

      <!--   关闭3d仿真窗口后，会显示生成代码   -->
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

      <!--   退出页面提示框     -->
      <v-dialog
          v-model="showExitDialog"
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

      <!--   保存项目输入模态框   -->
      <Modal :show="showsaveProject" :title="'保存项目'" @hideModal="hideSaveProjectModal" @submit="saveProjectSubmit">
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

import scenceCanvas from "./babylon/scenceCanvas";
import robot from './babylon/robot'

import blocklycomponent from './blockly/components/BlocklyComponent.vue'
import './blockly/blocks/stocks';
import BlocklyJS from 'blockly/javascript';
import Blockly from "blockly";

import Modal from "../../components/Modal"
import utils from "./utils/utils"

window.robot = robot
var sceneToRender = null;

/**
 * 场景创建
 * @returns {Promise<*>} 返回机器人控制实例
 */
async function loadScene() {

  var createScene = async function () {

    // 获取到renderCanvas这个元素
    var canvas = document.getElementById("renderCanvas");
    var fps = document.getElementById("fps");
    //清除画笔画线
    scenceCanvas.cleanDrawLines()
    //初始化场景实例
    sceneToRender = await scenceCanvas.init(canvas, fps)
    //初始化机器人在场景中的状态
    robot.initScene(sceneToRender, scenceCanvas.getRobot(), scenceCanvas.getStartPoint())
    //初始化画笔
    robot.initRobotPenclDynamicTexture(scenceCanvas.getRobotPenclDynamicTexture())
    //场景中绑定机器人
    scenceCanvas.bindRobotController(robot.getRobotInstance())
    return robot.getRobotInstance()
  };

  var robtctr = await createScene()
  return robtctr
}


export default {
  name: "game",
  components: {
    blocklycomponent,
    Modal
  },
  data() {
    return {
      projectId: null,
      projectTitle: "",
      //生成的代码
      code: '',
      //机器人控制实例
      robotController: null,

      //页面状态控制变量
      showExitDialog: false,//退出提示弹窗
      show3D: true,//是否显示3d仿真界面
      isShowCode: true,//是否显示生成代码
      showsaveProject: false,//保存项目弹窗
      isExitAfterSave: false,//保存后退出状态
      //移动窗口配置
      windowParams: {
        movable: true,
        resizable: false
      }
    }
  },

  methods: {
    /**
     * 显示3d仿真界面
     */
    show3DAction() {
      console.log("show3DAction")
      this.show3D = !this.show3D
      if (this.show3D == false) {
        this.showCode()
      }

    },

    /**
     * 隐藏3d仿真界面
     */
    close3dAction() {
      this.show3D = false
    },

    /**
     * 导航栏点击触发保存项目弹窗
     */
    saveProject() {
      this.showsaveProject = true
    },

    /**
     * 点击返回按钮
     */
    backAction() {
      this.showExitDialog = false
      console.log("backAction")

      this.$router.replace("/")
    },

    /**
     * 运行代码
     */
    playAction() {
      this.$refs["blockRef"].runCodeClick()
    },

    /**
     * 停止运行代码
     */
    stopAction() {
      this.$refs["blockRef"].stopCodeClick()
    },

    /**
     * 显示代码块生成的代码
     */
    showCode() {
      this.code = BlocklyJS.workspaceToCode(this.$refs["blockRef"].workspace);
    },

    /**
     * 隐藏保存项目弹窗
     */
    hideSaveProjectModal() {
      // 取消弹窗回调
      this.showsaveProject = false
    },

    /**
     * 弹窗中点击保存项目处理
     */
    saveProjectSubmit() {
      // 确认弹窗回调
      this.saveProjectToLocal()
      this.showsaveProject = false
    },

    /**
     * 退出时选择保存
     */
    saveProjectAndExit() {
      if (!this.projectTitle) {
        this.showExitDialog = false
        this.isExitAfterSave = true
        this.saveProject()
      } else {
        this.saveProjectToLocal()
        this.backAction()
      }
    },

    /**
     * 保存项目到本地
     */
    saveProjectToLocal() {
      this.showsaveProject = false
      const xml = Blockly.Xml.workspaceToDom(this.$refs["blockRef"].workspace);
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
      if (!projectExit) {
        var newProject =
            {
              "id": this.projectId,
              "name": this.projectTitle,
              "time": newtime,
              "update_time": newtime,
              "img": "art.jpg",
            }
        myProjectsList.push(newProject)
      }
      console.log("xml_text", xml_text)
      window.localStorage.setItem("MyProjects", JSON.stringify(myProjectsList));
      if (this.isExitAfterSave) {
        this.isExitAfterSave = false
        this.$router.back()
      }
    },
  },

  beforeDestroy(){
    //清除3d动画loading div
    var lodingDiv = document.getElementById("customLoadingScreenDiv")
    if(lodingDiv){
      lodingDiv.outerHTML = ""
    }
  },

  async mounted() {
    //获取本地存储的项目信息
    this.projectId = this.$route.query.project_id
    var myProjectsList = utils.getLocalProjects()
    for (const myProjectsListElement of myProjectsList) {
      if (myProjectsListElement.id == this.projectId) {
        this.projectTitle = myProjectsListElement.name
        break
      }
    }
    //获取本地存储的代码块
    var xml_text = window.localStorage.getItem(this.projectId);
    console.log("xml_text", xml_text)
    if (xml_text) {
      const xml = Blockly.Xml.textToDom(xml_text);
      Blockly.Xml.domToWorkspace(xml, this.$refs["blockRef"].workspace);
    }
    //新建3d场景
    var robotctl = await loadScene()
    this.robotController = robotctl
  }

}
</script>

<style scoped>
#renderCanvas {
  width: 680px;
  height: 680px;
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

#blockly {
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

div#blocklyDiv {
  background: #00C901;
}

#fps {
  text-align: center;
  font-size: 16px;
  color: white;
  width: 60px;
  height: 20px;
}

/deep/ .centered-input input {
  text-align: center;
  padding: 15px 30px;
  font-size: 20px;
}

/deep/ .centered-input input::placeholder {
  text-align: center;
  font-size: 20px;
}

</style>