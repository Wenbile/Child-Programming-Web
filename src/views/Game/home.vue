<template>
  <v-app id="inspire">
    <v-card class="overflow-hidden">
      <!--  导航栏  -->
      <Nav :adminMode="adminMode" @newProject="newProject"></Nav>

      <v-sheet
          id="scrolling-techniques-7"
          class="overflow-y-auto"
          :max-height="clientHeight"
          :width="clientWidth"
      >
        <div style="width: 100%;">
          <div style="height: 65px"></div>
          <!--    骨架屏      -->
          <div style="width: 100%;height: 200px;" v-if="loading">
            <v-skeleton-loader
                type="image"
                height="200px"
            >
            </v-skeleton-loader>
          </div>

          <!--     轮播图     -->
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

          <!--    本地项目      -->
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

            <!--      骨架屏      -->
            <div style="display: flex;width: 100%;overflow: scroll;" v-if="loading">
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

            <!--      本地项目列表      -->
            <div v-scrollx style="display: flex;width: 100%;overflow-x:auto;" v-if="!loading">
              <div
                  v-for="(pro) in projects"
                  :key="pro.id"
              >
                <v-card
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
                      <div style="display: flex;flex-direction: row;justify-content: space-between">
                        <!-- 本地项目更多操作弹窗-->
                        <v-menu offset-y>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                icon
                                color="white"
                                style="background-color: rgba(0,0,0,0.1);margin-left: 4px"
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
                        <!-- 编辑按钮-->
                        <v-btn
                            icon
                            color="white"
                            style="background-color: rgba(0,0,0,0.1);margin-right: 4px"
                            @click.stop="loadProject(pro.id)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </div>


                      <div style="height: 95px"></div>

                      <v-card-title draggable="false">{{ pro.name }}</v-card-title>
                    </div>
                  </v-img>

                </v-card>

              </div>
              <div style="width: 20px;"></div>
            </div>
          </div>

          <!--    骨架屏      -->
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

          <!--    多行案例列表      -->
          <div v-if="!loading">
            <div v-for="(proGroup,idx0) in studyProjects" :key="idx0">
              <div class="mt-8 pl-4 font-weight-bold text-h5">{{ proGroup.type_name }}</div>
              <div v-if="!proGroup.children.length" style="margin:10px 20px;color: grey">暂无数据</div>
              <div v-scrollx style="display: flex;width: 100%;margin: 10px 0;overflow-x:auto;">
                <div
                    v-for="(pro,idx) in proGroup.children"
                    :key="pro.id"
                >
                  <v-card
                      :class="(projects.length - 1) == idx ? ' ml-3 mr-3': ' ml-3'"
                      height="200px"
                      width="400px"
                  >
                    <v-img
                        class="white--text align-end"
                        height="200px"
                        width="400px"
                        :src="coverUrl+pro.img"
                    >
                      <div style="width: 100%;display: flex;justify-content: space-between">
                        <div></div>
                        <v-btn
                            icon
                            color="white"
                            style="background-color: rgba(0,0,0,0.1);margin-right: 4px;margin-left: auto;"
                            @click.stop="showProject(pro)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </div>

                      <div style="height: 95px"></div>
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

    <!--  删除本地项目确认弹窗  -->
    <v-dialog
        v-model="deleteProjectdialog"
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
              @click="deleteProjectdialog = false"
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

    <!--  项目重命名弹窗  -->
    <Modal :show="renameModalShow" :title="modalTitle" @hideModal="hideRenameModal" @submit="renameSubmit">
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
import utils from "./utils/utils";
import Modal from "../../components/Modal"
import Nav from "../../components/Nav"
import {scrollx} from "./utils/drag/scroll"

export default {
  name: "Home",
  components: {
    //自定义模态弹出框，带输入框的
    Modal,
    //导航栏
    Nav
  },
  directives: {
    //鼠标水平拖动滑动
    scrollx
  },

  data() {
    return {
      modalTitle: '项目重命名',
      //轮播图
      items: [
        {
          src: this.$robotApi.carouselUrl + 'c1.jpg',
        },
        {
          src: this.$robotApi.carouselUrl + 'c2.jpg',
        },
        {
          src: this.$robotApi.carouselUrl + 'c3.jpg',
        },
      ],
      //卡片菜单选项
      dropmenus: [
        {title: "上传云端", route: "", icon: "mdi-upload",},
        {title: "复制", route: "", icon: "mdi-content-copy",},
        {title: "重命名", route: "", icon: "mdi-rename-box",},
        {title: "删除", route: "", icon: "mdi-delete",},
      ],
      //本地项目
      projects: [],
      //学习案例
      studyProjects: [],

      //窗口大小
      clientHeight: '',
      clientWidth: '',

      loading: true,//页面初始化加载显示骨架屏
      renameModalShow: false,//项目重命名弹窗
      deleteProjectdialog: false,//删除项目弹窗
      currentSelectProject: {},//当前编辑项目
      currentSelectProjectName: "",
      coverUrl: this.$robotApi.coverUrl, //卡片封面的url头
      adminMode: false
    }
  },

  methods: {
    //----------------本地项目增查-----------------
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

    //---------------本地项目更多操作，改删-------------------
    moreAction(pro) {
      this.currentSelectProject = pro
      console.log("moreAction")
    },

    dropMenuAction(pro_id, title) {
      if (title == "重命名") {
        this.renameModalShow = true
      } else if (title == "删除") {
        this.currentSelectProject = utils.getProjectById(pro_id)
        if (this.currentSelectProject) {
          this.deleteProjectdialog = true
        } else {
          alert("本地找不到该工程")
        }
        // this.deleteProject(pro_id)
      } else if (title == "上传云端") {
        alert("上传云端功能开发中")
      } else if (title == "复制") {
        this.copyProject(pro_id)
      }
    },

    copyProject(pro_id) {
      var newPros = utils.copyProjectById(pro_id)
      console.log("copyProject,newPros",newPros)
      if (newPros) {
        this.projects = newPros
      } else {
        alert("复制项目失败")
      }
    },

    deleteProject(pro_id) {
      this.deleteProjectdialog = false
      var newPros = utils.deleteProjectById(pro_id)
      if (newPros) {
        this.projects = newPros
      } else {
        alert("删除项目失败")
      }


    },

    hideRenameModal() {
      // 取消弹窗回调
      this.renameModalShow = false
    },

    renameSubmit() {
      // 确认弹窗回调
      var newProjects = utils.renameProjectById(this.currentSelectProject.id, this.currentSelectProjectName)
      if (newProjects) {
        this.projects = newProjects
      } else {
        alert("重命名失败")
      }
      this.renameModalShow = false
    },

  },

  async mounted() {

    if(this.$route.query.admin){
      this.adminMode = true
    }

    // 获取浏览器可视区域高度
    this.clientHeight = document.documentElement.clientHeight
    this.clientWidth = document.documentElement.clientWidth
    var that = this
    window.onresize = function temp() {
      that.clientHeight = document.documentElement.clientHeight
      that.clientWidth = document.documentElement.clientWidth
    };

    //获取本地缓存的项目列表
    var myPro = window.localStorage.getItem("MyProjects")
    if (myPro) {
      this.projects = JSON.parse(myPro);
    }

    //获取云端学习案例列表
    var quickStartBlocks = await this.$request.callApi("GET", this.$robotApi.getAllBlocks)
    console.log("quickStartBlocks", quickStartBlocks)
    this.studyProjects = quickStartBlocks.data
    setTimeout(function () {
      that.loading = false
    }, 1000)
  },

  watch: {
    renameModalShow() {
      if (this.renameModalShow) {
        this.currentSelectProjectName = this.currentSelectProject.name
      }
    },
  },

}
</script>

<style scoped>
/*input 样式*/
/deep/ .centered-input input {
  text-align: center;
  padding: 15px 30px;
  font-size: 20px;
}

/*修改弹窗输入框的样式*/
/deep/ .centered-input input::placeholder {
  text-align: center;
  font-size: 20px;
}

/*隐藏滚轮*/
::-webkit-scrollbar {
  display: none;
}


/*页面禁止选中文字*/
* {
  -webkit-touch-callout: none; /*系统默认菜单被禁用*/
  -webkit-user-select: none; /*webkit浏览器*/
  -khtml-user-select: none; /*早期浏览器*/
  -moz-user-select: none; /*火狐*/
  -ms-user-select: none; /*IE10*/
  user-select: none;
}

input {
  -webkit-user-select: auto; /*webkit浏览器*/
}

textarea {
  -webkit-user-select: auto; /*webkit浏览器*/
}
</style>
