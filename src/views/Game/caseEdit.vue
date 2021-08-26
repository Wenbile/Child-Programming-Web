<template>
  <v-app>
    <v-navigation-drawer
        v-show="edit"
        v-model="drawer"
        absolute
        temporary
        style="z-index: 10009"
    >
      <v-list
          nav
          dense
      >

        <v-list-item
            link
            @click="jumpTypeEdit"
        >
          <v-list-item-icon>
            <v-icon v-text="editIcon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="editText"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-group
            v-for="item in studyProjects"
            :key="item.type_name"
            v-model="item.active"
            prepend-icon="mdi-school"
            color="#64A70A"
            no-action
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title v-text="item.type_name"></v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
              v-for="child in item.children"
              :key="child.id"
              link
              :to="child.href"
              :active-class="child.href === $route.fullPath ? 'active': 'unactive'"
          >
            <v-list-item-content>
              <v-list-item-title v-text="child.name"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!--          </v-list-item-group>-->
        </v-list-group>
      </v-list>

    </v-navigation-drawer>
    <div style="height: 100%;width: 100%;">
      <div class="navgationbar" @click="saveProject">

        <v-dialog
            v-model="showDialog"
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
                  @click="saveProject"
              >
                保存
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


        <div class="title"> {{projectId ? projectTitle : "新项目" }}</div>

        <v-btn
            v-show="edit"
            :class="prepareTitle ?'listbtn':'nonelistbtn'"
            elevation="0"
            rounded
            icon
            large
            color="white"
            @click.stop="drawer = true"
        >
          <v-icon>mdi-menu</v-icon>
          <div v-show="!prepareTitle">选择旧项目</div>
        </v-btn>


        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-show="edit"
                class="addbtn"
                elevation="0"
                rounded
                icon
                large
                v-bind="attrs"
                v-on="on"
                color="white"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list nav dense>
            <v-list-item
                v-for="item in moreActionMenus"
                :key="item.title"
                @click="dropMenuAction(item.title)"
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="text-caption font-weight-medium">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>


        <v-btn
            class="blebtn"
            elevation="0"
            rounded
            icon
            large
            color="white"
            @click.stop=""
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


      <blocklycomponent id="blockly2" :robotController="robotController" :projectId="projectId"
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

      <Modal :show="showModal" :title="title" @hideModal="hideModal" @submit="submit">
        <v-text-field
            class="centered-input text--darken-3 mt-3"
            v-model="prepareTitle"
            placeholder="输入项目名称"

            solo-inverted
            flat
        ></v-text-field>
      </Modal>

      <Modal :show="newBlockShow" title="新增项目配置" @hideModal="hideNewBlockModal" @submit="submitNewBlockModal">
        <v-text-field
            class="centered-input text--darken-3 mt-3"
            v-model="newBlockName"
            placeholder="输入项目名称"
            solo-inverted
            flat
        ></v-text-field>
        <v-select
            @change="typeSelectAction"
            :items="studyProjects"
            item-text="type_name"
            item-value="id"
            label="请选择板块"
            dense
            solo
            flat
        ></v-select>
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
import Blockly from "blockly";
import utils from "./utils/utils";


export default {
  name: "caseEdit",
  components: {
    blocklycomponent,
    Modal
  },
  data() {
    return {
      edit: 0,//是否可编辑
      typeSelect:-1,
      editIcon:"mdi-playlist-edit",
      editText:"编辑板块",
      projectId: null,
      showDialog: false,
      isExitAfterSave: false,
      show3D: true,
      isShowCode: true,
      projectTitle: "",
      prepareTitle: "",
      newBlockShow:false,
      newBlockName:"",
      drawer: false,
      currentSelectItem: [0, 0],
      currentSelectGroup: 0,
      currentSelectProject: null,
      group: 0,
      studyProjects: [],
      moreActionMenus: [
        {title: "新增案例", route: "", icon: "mdi-shape-square-plus",},
        {title: "删除案例", route: "", icon: "mdi-trash-can-outline",},
      ],
      typeNames:[{
        id:1,
        type_name:"学习案例"
      }],
      items: [],

      title: '保存项目',
      showModal: false,

      windowParams: {
        movable: true,
        resizable: false
      },

      code: '',
      //机器人控制实例
      robotController: null,
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
      this.showDialog = false
      if(this.projectId == null){
        this.newBlockShow = true
      }else {

        this.showModal = true
      }

    },


    backAction() {
      this.showDialog = false
      this.$router.replace("/")
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
      this.showModal = false
    },

    submit() {
      // 确认弹窗回调
      this.projectTitle = this.prepareTitle
      if (!this.edit && this.prepareTitle) {
        //只读模式

        this.saveProjectToLocal()
      } else {
        //编辑模式
        this.saveCaseToServer()
      }

      this.showModal = false
    },

    typeSelectAction(data){
      this.typeSelect = data
    },


    saveProjectToLocal() {

      this.showModal = false


      const xml = Blockly.Xml.workspaceToDom(this.$refs["foo"].workspace);
      const xml_text = Blockly.Xml.domToText(xml);

      var new_pro_id = utils.createProjectId()
      window.localStorage.setItem(new_pro_id, xml_text);

      var myProjectsList = utils.getLocalProjects()

      const newtime = new Date().Format("yyyy-MM-dd HH:mm:ss")

      var newProject =
          {
            "id": new_pro_id,
            "name": this.projectTitle,
            "time": newtime,
            "update_time": newtime,
            "img": "default_ela.png",
          }

      myProjectsList.push(newProject)

      window.localStorage.setItem("MyProjects", JSON.stringify(myProjectsList));


      alert("保存成功")

    },

    /**
     * 保存案例到服务器
     */
    async saveCaseToServer() {

      if(this.projectId == null){
        //新增案例
        console.log("新增案例")
        //编辑案例
        this.currentSelectProject.id = utils.createProjectId()
        this.currentSelectProject.name = this.projectTitle

        const xml = Blockly.Xml.workspaceToDom(this.$refs["foo"].workspace);
        const xml_text = Blockly.Xml.domToText(xml);

        this.currentSelectProject.blocks = xml_text
        console.log(this.currentSelectProject)

        // var re = await this.$request.callApi("POST", this.$robotApi.addBlock, this.currentSelectProject)
        // if (!re.errno) {
        //   alert(re.data)
        // } else {
        //   alert(re.data)
        // }

      }else {
        //编辑案例
        console.log("编辑案例")
        this.currentSelectProject.name = this.projectTitle

        const xml = Blockly.Xml.workspaceToDom(this.$refs["foo"].workspace);
        const xml_text = Blockly.Xml.domToText(xml);

        this.currentSelectProject.blocks = xml_text

        console.log(this.currentSelectProject)

        var re = await this.$request.callApi("POST", this.$robotApi.saveBlock, this.currentSelectProject)
        if (!re.errno) {
          alert(re.data)
        } else {
          alert(re.data)
        }
      }

    },

    getProject() {
      this.projectId = this.$route.query.project_id
      if (this.projectId) {

        var selectProject = null
        for (const idx in this.studyProjects) {
          for (const block of this.studyProjects[idx].children) {
            console.log("block", block)
            if (block.id == this.projectId) {
              this.studyProjects[idx].active = true
              this.prepareTitle = block.name
              this.projectTitle = block.name
              selectProject = block
            }
          }
        }


        if (selectProject) {
          this.currentSelectProject = selectProject
          var xml_text = selectProject.blocks;
          console.log("xml_text", xml_text)
          if (xml_text) {
            // 清空工作区的内容
            this.$refs["foo"].workspace.clear()
            const xml = Blockly.Xml.textToDom(xml_text);
            Blockly.Xml.domToWorkspace(xml, this.$refs["foo"].workspace);
          }
        }


      }
    },

    dropMenuAction(title) {
      console.log(title)

      if (title == "新增案例") {
        this.newEmptyProject()
        this.initProjects()
      } else if (title == "删除案例") {
        this.deleteBlock()
      }
    },




    hideNewBlockModal(){
      this.newBlockShow = false
    },

    async submitNewBlockModal() {

      console.log("add",this.typeSelect)
      if(this.typeSelect==-1){
        alert("请选择板块")
        return
      }



      const xml = Blockly.Xml.workspaceToDom(this.$refs["foo"].workspace);
      const xml_text = Blockly.Xml.domToText(xml);

      var result = await this.$request.callApi("POST", this.$robotApi.addBlock, {type:this.typeSelect,name: this.newBlockName,blocks:xml_text})

      if (result) {
        this.newBlockShow = false

        this.$router.push({path:this.$route.path + "?edit=1&project_id="+result.data.id})
        this.projectTitle = this.newBlockName
        this.prepareTitle = this.newBlockName
        this.initProjects()
        alert("新增成功")
      }else {
        this.newBlockShow = false
        alert("新增失败")
      }
    },

    async deleteBlock(){
      if(!this.projectId){
        alert("案例不存在")
        return
      }
      console.log("delete",this.projectId)


      var result = await this.$request.callApi("POST", this.$robotApi.deleteBlock, {id:this.projectId})

      if (result) {
        this.newEmptyProject()
        alert("删除成功")
      }else {
        alert("删除失败")
      }


    },



    newEmptyProject(){
      if(this.projectId){
        this.$refs["foo"].workspace.clear()
        this.prepareTitle = ""
        this.projectTitle = ""
        this.projectId = null
        this.$router.push({path:this.$route.path + "?edit=1"})
        this.initProjects()
      }else{
        alert("已在新增页面")
      }

    },


    async initProjects(){
      var quickStartBlocks = await this.$request.callApi("GET", this.$robotApi.getAllBlocks)

      quickStartBlocks = quickStartBlocks.data
      this.studyProjects = quickStartBlocks
      this.getProject()
    },

    jumpTypeEdit(){
      this.$router.push({path:"/Game/typeEdit"})
    },

  },

  async mounted() {

    this.edit = this.$route.query.edit

    await this.initProjects()

    //新建3d场景
    var robotctl = await loadScene();
    this.robotController = robotctl


  },

  watch: {
    '$route.query'() {
      console.log("change $route.query.project_id", this.$route.query.project_id)
      this.getProject()

    }


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
  right: 5px;
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

.listbtn {
  position: absolute;
  left: 350px;
  top: 5px;
  width: 40px;
  height: 40px;
  background-color: #32424B;
  border-radius: 25px;
  z-index: 9999;
}

.nonelistbtn {
  position: absolute;
  left: 150px;
  top: 5px;
  width: 240px;
  height: 40px;
  background-color: #32424B;
  border-radius: 5px;
  z-index: 9999;
}

.addbtn {
  position: absolute;
  left: 400px;
  top: 5px;
  width: 40px;
  height: 40px;
  background-color: #32424B;
  border-radius: 25px;
  z-index: 9999;
}

.savebtn {
  position: absolute;
  left: 400px;
  top: 5px;
  width: 40px;
  height: 40px;
  background-color: #32424B;
  border-radius: 25px;
  z-index: 9999;
}

.title {
  width: 100%;
  text-align: left;
  padding-left: 70px;
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

.active {
  background-color: #64A70A;
  color: white;
}

.unactive {
  background-color: white;
  color: black;
}

/*修改原生list item的background*/
.v-list-item--link:before {
  background-color: white;
}
</style>