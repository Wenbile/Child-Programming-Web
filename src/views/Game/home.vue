<template>
  <v-app id="inspire">
    <v-card class="overflow-hidden">
      <v-app-bar
          absolute
          elevate-on-scroll
          color="white"
          scroll-target="#scrolling-techniques-7"
      >
        <v-app-bar-nav-icon large @click="drawer = true"></v-app-bar-nav-icon>

        <v-spacer></v-spacer>
        <v-toolbar-title style="color: #64A70A;font-size: 30px" class="font-weight-black">imRobot</v-toolbar-title>
        <v-spacer></v-spacer>


        <v-btn icon @click="newProject">
          <v-icon large>mdi-plus</v-icon>
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer
          v-model="drawer"
          absolute
          temporary
      >
        <v-list
            nav
            dense
        >
          <v-list-item-group
              v-model="group"
              active-class="deep-gray--text text--accent-4"
          >
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-home</v-icon>
              </v-list-item-icon>
              <v-list-item-title>主页</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-book-edit</v-icon>
              </v-list-item-icon>
              <v-list-item-title>案例编辑</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-book-edit</v-icon>
              </v-list-item-icon>
              <v-list-item-title>测试</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>


      <v-sheet
          id="scrolling-techniques-7"
          class="overflow-y-auto"
          :max-height="clientHeight"
          :width="clientWidth"
      >
        <div style="width: 100%;">
          <div style="height: 65px"></div>

<div style="width: 100%;height: 200px;" v-if="loading">
  <v-skeleton-loader
      type="image"
      height="200px"
  >
  </v-skeleton-loader>

</div>

          <v-carousel
              v-if="!loading"
              hide-delimiters
              show-arrows-on-hover
              height="200px"
          >
            <v-carousel-item
                v-for="(item,i) in items"
                :key="i"
                :src="item.src"
            ></v-carousel-item>
          </v-carousel>


          <div class="mt-8 pl-4 font-weight-bold text-h5">我的项目</div>


          <div style="display: flex;margin: 10px 0">

            <v-card class="d-flex align-center justify-center ml-3 mr-3" style="border:1px dashed #D9D9D9;"
                    flat
                    width="400px"
                    height="200px"
                    @click="newProject"
            >
              <div style="width: 400px;display: flex;justify-content: center;align-items: center;">
                <v-icon>mdi-plus</v-icon>
                <div style="color:#797979;font-weight: bold;line-height: 20px;">
                  新建项目
                </div>
              </div>

            </v-card>
            <div ref="dragview" style="display: flex;width: 100%;overflow: scroll;" v-if="loading">
              <div v-for="item in 6" :key="item">

                <v-skeleton-loader
                    class="mr-3"
                    width="400px"
                    height="200px"
                    type="image"
                >
                </v-skeleton-loader>
              </div>
            </div>
            <div style="display: flex;width: 100%;overflow-x:auto;" v-scroll v-if="!loading">

              <div
                  v-for="(pro) in projects"
                  :key="pro.id"
              >
                <v-card

                    @click.native="loadProject(pro.id)"
                    class="mr-3"
                    width="400px"
                >
                  <v-img
                      class="white--text align-end"
                      height="200px"
                      width="400px"
                      :src="coverUrl+pro.img"
                  >
                    <div style="display: flex;flex-direction: column;height: 100%;">


                      <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                              icon
                              color="white"
                              v-bind="attrs"
                              v-on="on"
                              @click.stop="moreAction(pro)">
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>

                        <v-list nav dense>
                          <v-list-item
                              v-for="item in dropmenus"
                              :key="item.title"
                              @click="dropMenuAction(pro.id,item.title)"
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


                      <div style="height: 95px"></div>
                      <v-card-title draggable="false">{{ pro.name }}</v-card-title>
                    </div>

                  </v-img>

                </v-card>

              </div>
              <div style="width: 20px;"></div>
            </div>

          </div>


          <div v-if="loading">
            <div v-for="item0 in 2" :key="item0">
              <v-skeleton-loader
                  class="mt-8 pl-4 font-weight-bold text-h5"
                  width="400px"
                  height="40px"
                  type="heading"
              >
              </v-skeleton-loader>
              <div style="display: flex;width: 100%;overflow: scroll;margin: 10px 0">
                <div v-for="item in 6" :key="item">

                  <v-skeleton-loader
                      class="ml-3"
                      width="400px"
                      height="200px"
                      type="image"
                  >
                  </v-skeleton-loader>
                </div>

              </div>
            </div>

          </div>
          <div v-if="!loading">
            <div v-for="(proGroup,idx0) in studyProjects" :key="idx0">
              <div class="mt-8 pl-4 font-weight-bold text-h5">{{ proGroup.type_name }}</div>
              <div style="display: flex;width: 100%;margin: 10px 0;overflow-x:auto;" v-scroll>
                <div
                    v-for="(pro,idx) in proGroup.children"
                    :key="pro.id"
                >
                  <v-card
                      :class="(projects.length - 1) == idx ? ' ml-3 mr-3': ' ml-3'"
                      height="200px"
                      width="400px"
                      @click.native="showProject(pro)"
                  >
                    <v-img
                        class="white--text align-end"
                        height="200px"
                        width="400px"
                        :src="coverUrl+pro.img"
                    >
                      <v-card-title>{{ pro.name }}</v-card-title>
                    </v-img>

                  </v-card>

                </div>
                <div style="width: 20px;"></div>
              </div>
            </div>
          </div>


        </div>
      </v-sheet>
    </v-card>
    <v-dialog
        v-model="dialog"
        persistent
        max-width="290"
        style="z-index: 10009"
    >
      <v-card>
        <v-card-title class="text-h5">
          确定删除项目吗？
        </v-card-title>
        <v-card-text>项目（{{ currentSelectProject.name }}）即将被删除</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="grey"
              text
              @click="dialog = false"
          >
            取消
          </v-btn>
          <v-btn
              color="green darken-1"
              text
              @click="deleteProject(currentSelectProject.id)"
          >
            确认删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <Modal :show="modalShow" :title="modalTitle" @hideModal="hideModal" @submit="submit">
      <v-text-field
          class="centered-input text--darken-3 mt-3"
          v-model="currentSelectProjectName"
          placeholder="输入项目名称"

          solo-inverted
          flat
      ></v-text-field>
    </Modal>

  </v-app>
</template>

<script>
import utils from "./utils";
import Modal from "../../components/Modal"
// import {scrollx} from "utils/scroll"
//盒子滚动条拖拽

let targetDrag = {  //托拽
  isDown: false,
  coord:{
    x: 0,
    y: 0
  }
}


const on = function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler);
      }
    };
  }
}();

const off = function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler);
      }
    };
  }
}();
var isdrag = false
let firstTime="",lastTime="";
//x轴拖动回调 鼠标按下
const scrollMousedown = event=>{
  isdrag = true
  firstTime = new Date().getTime();
  console.log("scrollMousedown")
  targetDrag.isDown = true;
  targetDrag.coord.x = event.pageX;
  targetDrag.coord.y = event.pageY;
}
//x轴拖动回调  鼠标释放

const scrollMouseup = event=>{
  event
  console.log("scrollMouseup")
  targetDrag.coord.x = 0;
  targetDrag.coord.y = 0;
  targetDrag.isDown = false;
  // onmouseup 时的时间，并计算差值
  lastTime = new Date().getTime();
  if( (lastTime - firstTime) < 100){
    // document.getElementById("dragview").setAttribute("data-flag",true)
    isdrag = false
  }

}
//x轴拖动回调  鼠标移动

const scrollMousemove = (event,el)=>{
  event
  el

}

export default {
  name: "Home",
  components: {
    Modal
  },

  data() {
    return {
      clickable:false,
      modalTitle: '项目重命名',
      loading: true,
      modalShow: false,
      newTypeModalShow:false,
      typeName:"",
    //     <Modal :show="newTypeModalShow" title="新增板块" @hideModal="hideTypeModal" @submit="submitTypeModal">
    //     <v-text-field
    // class="centered-input text--darken-3 mt-3"
    // v-model="typeName"
      dialog: false,
      currentSelectProject: {},
      currentSelectProjectName: "",
      //轮播图
      items: [
        {
          src: this.$robotApi.carouselUrl +'c1.jpg',
        },
        {
          src: this.$robotApi.carouselUrl + 'c2.jpg',
        },
        {
          src: this.$robotApi.carouselUrl + 'c3.jpg',
        },
      ],
      dropmenus: [
        {title: "上传云端", route: "", icon: "mdi-upload",},
        {title: "复制", route: "", icon: "mdi-content-copy",},
        {title: "重命名", route: "", icon: "mdi-rename-box",},
        {title: "删除", route: "", icon: "mdi-delete",},
      ],

      projects: [],
      studyProjects: [],
      clientHeight: '',
      clientWidth: '',
      drawer: false,
      group: 0,
      coverUrl:this.$robotApi.coverUrl
    }
  },


  directives:{
    scroll:{
      inserted:function(el){
        //鼠标按下
        on(el,'mousedown',scrollMousedown);
        //鼠标释放
        on(el,'mouseup',scrollMouseup);
        //鼠标托拽
        on(el,'mousemove',event=>{
          let movX = targetDrag.coord.x - event.pageX;
          targetDrag.coord.x = event.pageX;
          if(targetDrag.isDown){
            el.scrollLeft = el.scrollLeft + movX;
          }
        });
      },
      unbind:function(el){
        off(el,'mousedown',scrollMousedown);
        off(el,'mouseup',scrollMouseup);
        off(el,'mousemove',scrollMousemove);
        //清空
        targetDrag = {  //托拽
          isDown: false,
          coord:{
            x: 0,
            y: 0
          }
        }
      }
    }
  },


  methods: {
    newProject() {
      var project_id = utils.createProjectId()
      console.log("project_id", project_id)
      this.$router.push({
        path: '/Game/game',
        query: {
          project_id: project_id
        }
      });
    },


    loadProject(project_id) {
      //TODO:判断是否在滚动
      // 验证是否为点击事件，是则继续执行click事件，否则不执行
      if(isdrag) {
        return
      }
      this.$router.push({
        path: '/Game/game',
        query: {
          project_id: project_id
        }
      });
    },

    showProject(pro) {
      this.$router.push({
        path: '/Game/caseEdit',
        query: {
          project_id: pro.id
        }
      });
    },

    editProject(pro) {
      this.$router.push({
        path: '/Game/caseEdit',
        query: {
          edit: 1,
          project_id: pro.id
        }
      });
    },

    moreAction(pro) {
      this.currentSelectProject = pro
      console.log("moreAction")
    },

    dropMenuAction(pro_id, title) {

      if (title == "重命名") {
        this.modalShow = true
      } else if (title == "删除") {
        this.currentSelectProject = utils.getProjectById(pro_id)
        if (this.currentSelectProject) {
          this.dialog = true
        } else {
          alert("本地找不到该工程")
        }
        // this.deleteProject(pro_id)
      } else if (title == "上传云端") {
        alert("上传云端功能开发中")
      }else if( title == "复制") {
        this.copyProject(pro_id)
      }
    },

    copyProject(pro_id){
      var newPros = utils.copyProjectById(pro_id)
      if (newPros) {
        this.projects = newPros
      } else {
        alert("复制项目失败")
      }
    },

    deleteProject(pro_id) {
      this.dialog = false
      var newPros = utils.deleteProjectById(pro_id)
      if (newPros) {
        this.projects = newPros
      } else {
        alert("删除项目失败")
      }


    },

    hideModal() {
      // 取消弹窗回调
      this.modalShow = false
    },

    submit() {
      // 确认弹窗回调
      var newProjects = utils.renameProjectById(this.currentSelectProject.id, this.currentSelectProjectName)
      if (newProjects) {
        this.projects = newProjects
      } else {
        alert("重命名失败")
      }
      this.modalShow = false
    },


    hideTypeModal(){
      this.newTypeModalShow = false
    },

    submitTypeModal(){
      this.newTypeModalShow = false
    },

  },

  async mounted() {

    var myPro = window.localStorage.getItem("MyProjects")
    if (myPro) {
      this.projects = JSON.parse(myPro);
    }

    // 获取浏览器可视区域高度
    this.clientHeight = document.documentElement.clientHeight
    this.clientWidth = document.documentElement.clientWidth
    var that = this
    window.onresize = function temp() {
      that.clientHeight = document.documentElement.clientHeight
      that.clientWidth = document.documentElement.clientWidth
    };


    var quickStartBlocks = await this.$request.callApi("GET", this.$robotApi.getAllBlocks)
    console.log("quickStartBlocks", quickStartBlocks)
    this.studyProjects = quickStartBlocks.data
    setTimeout(function (){
      that.loading = false
    },1000)
  },

  watch: {
    modalShow() {
      if (this.modalShow) {
        this.currentSelectProjectName = this.currentSelectProject.name
      }
    },
    group() {
      //导航切换
      console.log("group", this.group)
      if (this.group == 1) {
        //案例编辑
        this.$router.push({
          path: "/Game/caseEdit?edit=1"
        })

      }else if(this.group == 2){
        this.$router.push({
          path: "/Game/test"
        })
      }
    },
  },

}
</script>

<style scoped>
::-webkit-scrollbar {
  /*隐藏滚轮*/
  display: none;
}

/*input 样式*/
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


/**
页面禁止选中文字
 */
*{
  -webkit-touch-callout:none;  /*系统默认菜单被禁用*/
  -webkit-user-select:none; /*webkit浏览器*/
  -khtml-user-select:none; /*早期浏览器*/
  -moz-user-select:none;/*火狐*/
  -ms-user-select:none; /*IE10*/
  user-select:none;
}

input{
  -webkit-user-select:auto; /*webkit浏览器*/
}
textarea{
  -webkit-user-select:auto; /*webkit浏览器*/
}

</style>