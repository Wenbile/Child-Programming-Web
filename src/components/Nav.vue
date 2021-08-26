<template>
  <div>
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
  </div>

</template>

<script>
export default {
  name: "Nav",

  data() {
    return {
      drawer:false,
      group:0
    }
  },
  methods:{
    newProject(){
      this.$emit("newProject")
    }
  },
  watch:{
    group() {
      //导航切换
      console.log("group", this.group)
      if (this.group == 1) {
        //案例编辑
        this.$router.push({
          path: "/Game/caseEdit?edit=1"
        })

      } else if (this.group == 2) {
        this.$router.push({
          path: "/Game/test"
        })
      }
    },
  }
}
</script>

<style scoped>

</style>