# 少儿编程

## 介绍
基于vue框架，使用blockly和babylonjs实现的少儿编程网页

## 项目结构

```├── LICENSE
├── README.md
├── blockly_compressed.js
├── package-lock.json
├── package.json
├── public
│   ├── index.html
│   └── robot.ico
├── src
│   ├── App.vue //页面启动加载页
│   ├── api.js //后端api接口定义
│   ├── assets //字体资源
│   ├── components
│   │   ├── Modal.vue //自定义模态弹窗组件
│   │   └── Nav.vue //自定义导航栏组件
│   ├── main.js //主函数，这里初始化Vue工程，配置全局变量
│   ├── plugins 
│   │   └── vuetify.js // 引入vuetify核心库
│   ├── request.js // 封装请求方法
│   ├── router
│   │   └── index.js // 路由配置
│   └── views
│       ├── Class //博客课程
│       │   ├── class1.vue // Vue实现图形化积木式编程（一）
│       │   ├── class2.vue //Vue实现图形化积木式编程（二）
│       │   ├── class3.vue //Vue实现图形化积木式编程（三）
│       │   └── test.vue
│       └── Game
│           ├── babylon //封装的babylon方法
│           │   ├── robot.js //机器人控制方法封装
│           │   └── scenceCanvas.js //场景实例
│           ├── blockly
│           │   ├── blocks
│           │   │   └── stocks.js //自定义代码块和代码块生成代码
│           │   └── components
│           │       └── BlocklyComponent.vue //代码块显示与执行代码序列化
│           ├── caseEdit.vue //案例编辑
│           ├── game.vue //自由代码块编辑与仿真
│           ├── home.vue //主页
│           ├── typeEdit.vue //板块编辑
│           └── utils
│               ├── drag //鼠标点击拖动组件封装
│               │   ├── dom.js
│               │   └── scroll.js
│               └── utils.js
└── vue.config.js
```



## npm版本
```
npm -v
7.6.3
```

## 在安装所有软件包时关闭 npm 审计
```
npm set audit false
```

## 安装依赖
```
npm install
```

## 替换node_modules中文件
npm完blockly后需要将
```angular2html
node_modules/blockly/blockly_compressed.js
```
替换为根目录的
```
blockly_compressed.js
```

## 编译调试
```
npm run serve
```

## 构建程序
```
npm run build
```

启动后，本地访问 http://127.0.0.1:3000/