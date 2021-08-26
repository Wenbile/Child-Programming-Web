import Vue from 'vue'
import VueRouter from 'vue-router'
import game from "../views/Game/game";
import home from "../views/Game/home"
import caseEdit from "../views/Game/caseEdit";
import  typeEdit from "../views/Game/typeEdit";
import test from "../views/Class/test";


Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: 'home',
    component: home,
    meta: {
      title: 'imRobot',
      requireAuth: false
    }
  },
  {
    path: "/Game/game",
    name: 'game',
    component: game,
    meta: {
      title: 'imRobot Program',
      requireAuth: false
    }
  },
  {
    path: "/Game/caseEdit",
    name: 'caseEdit',
    component: caseEdit,
    meta: {
      title: 'imRobot',
      requireAuth: false
    }
  },
  {
    path: "/Game/typeEdit",
    name: 'typeEdit',
    component: typeEdit,
    meta: {
      title: 'imRobot',
      requireAuth: false
    }
  },
  {
    path: "/Class/test",
    name: 'test',
    component: test,
    meta: {
      title: 'imRobot',
      requireAuth: false
    }
  },
]

const router = new VueRouter({
  routes,
  mode: 'hash',
  base: process.env.BASE_URL,
})

export default router