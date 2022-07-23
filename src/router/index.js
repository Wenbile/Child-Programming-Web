import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: 'home',
    component: ()=> import('../views/Game/home')
  },
  {
    path: "/Game/game",
    name: 'game',
    component: ()=> import('../views/Game/home')
  },
  {
    path: "/Game/caseEdit",
    name: 'caseEdit',
    component: ()=> import('../views/Game/caseEdit')
  },
  {
    path: "/Game/typeEdit",
    name: 'typeEdit',
    component: ()=> import('../views/Game/typeEdit')
  },
  {
    path: "/Class/test",
    name: 'test',
    component: ()=> import('../views/Class/test')
  },
  {
    path: "/Class/class1",
    name: 'class1',
    component: ()=> import('../views/Class/class1')
  },
  {
    path: "/Class/class2",
    name: 'class2',
    component: ()=> import('../views/Class/class2')
  },
  {
    path: "/Class/class3",
    name: 'class3',
    component: ()=> import('../views/Class/class3')
  },
  {
    path: "/Class/class4",
    name: 'class4',
    component: ()=> import('../views/Class/class4')
  },
  {
    path: "/Class/class5",
    name: 'class5',
    component: ()=> import('../views/Class/class5')
  },
  {
    path: "/Class/class6",
    name: 'class6',
    component: ()=> import('../views/Class/class6')
  },
  {
    path: "/Class/class7",
    name: 'class7',
    component: ()=> import('../views/Class/class7')
  },
  {
    path: "/Class/class8",
    name: 'class8',
    component: ()=> import('../views/Class/class8')
  },
  {
    path: "/Class/blockclass1",
    name: 'blockClass1',
    component: ()=> import('../views/Class/blockClass1')
  },
  {
    path: "/Class/blockclass2",
    name: 'blockClass2',
    component: ()=> import('../views/Class/blockClass2/blockClass2')
  },
  {
    path: "/Class/blockclass3",
    name: 'blockClass3',
    component: ()=> import('../views/Class/blockClass3/blockClass3')
  },
]

const router = new VueRouter({
  routes,
  mode: 'hash',
  base: process.env.BASE_URL,
})

export default router
