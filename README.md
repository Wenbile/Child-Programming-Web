# 少儿编程

## 介绍
基于vue框架，使用blockly和babylonjs实现的少儿编程网页

## 项目结构
├── LICENSE
├── README.md
├── blockly_compressed.js
├── package-lock.json
├── package.json
├── public
│   ├── index.html
│   └── robot.ico
├── src
│   ├── App.vue
│   ├── api.js
│   ├── assets
│   │   └── iconfont
│   │       ├── iconfont.css
│   │       ├── iconfont.eot
│   │       ├── iconfont.js
│   │       ├── iconfont.json
│   │       ├── iconfont.svg
│   │       ├── iconfont.ttf
│   │       ├── iconfont.woff
│   │       └── iconfont.woff2
│   ├── components
│   │   ├── Modal.vue
│   │   └── Nav.vue
│   ├── main.js
│   ├── plugins
│   │   └── vuetify.js
│   ├── request.js
│   ├── router
│   │   └── index.js
│   └── views
│       ├── Class
│       │   ├── class1.vue
│       │   ├── class2.vue
│       │   └── test.vue
│       └── Game
│           ├── babylon
│           │   ├── robot.js
│           │   └── scenceCanvas.js
│           ├── blockly
│           │   ├── blocks
│           │   │   └── stocks.js
│           │   └── components
│           │       └── BlocklyComponent.vue
│           ├── caseEdit.vue
│           ├── game.vue
│           ├── home.vue
│           ├── typeEdit.vue
│           └── utils
│               ├── drag
│               │   ├── dom.js
│               │   └── scroll.js
│               └── utils.js
├── tree.md
└── vue.config.js



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