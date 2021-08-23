# 少儿编程

#### 介绍
基于vue框架，使用blockly和babylonjs实现的少儿编程网页



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