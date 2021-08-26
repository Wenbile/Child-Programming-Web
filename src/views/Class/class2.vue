<template>
  <div style="height: 100%;width: 100%;">
    <div>
      <canvas id="renderCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import * as BABYLON from 'babylonjs';
import * as BABYLON_MATERAIAL from "babylonjs-materials"

async function loadScene() {
  //第一篇场景初始化，可看上一篇文章
  var scene = initScene()

  //本文内容，加载网络模型
  // initRobot(scene)
  await initRobot(scene)

  //开启debug窗口
  // scene.debugLayer.show()

}

//回调形式
// function initRobot(scene) {
//   console.log('initRobot')
//   //模型url路径，上传了自己模型到服务器的同学可以将url和modelName改为对应路径即可
//   const url = "https://models.babylonjs.com/"
//   //模型名称
//   const modelName = "toast_acrobatics.glb"
//   BABYLON.SceneLoader.ImportMesh("", url, modelName, scene, function (meshes) {
//     scene.createDefaultEnvironment()
//     console.log(meshes)
//     var scale = 100//缩放比例
//     //只对__root__节点进行操作
//     meshes[0].scaling = new BABYLON.Vector3(scale, scale, scale)
//     meshes[0].position._x += 24
//     // scene.createDefaultEnvironment()
//   });
// }

//async同步形式
// async function initRobot(scene) {
//   console.log('initRobot')
//   //模型url路径，上传了自己模型到服务器的同学可以将url和modelName改为对应路径即可
//   const url = "https://models.babylonjs.com/"
//   //模型名称
//   const modelName = "toast_acrobatics.glb"
//   var result = await BABYLON.SceneLoader.ImportMeshAsync(null, url, modelName, scene);
//   var meshes = result.meshes
//   console.log(meshes)
//   var scale = 100//缩放比例
//   //只对__root__节点进行操作
//   meshes[0].scaling = new BABYLON.Vector3(scale, scale, scale)
//   meshes[0].position._x += 24
//   //模型一片黑时
//   // scene.createDefaultEnvironment()
// }

async function initRobot(scene) {
  console.log('initRobot')
  //模型url路径
  const url = "http://localhost:8887/"
  //模型名称
  const modelName = "sportcar.babylon"
  var result = await BABYLON.SceneLoader.ImportMeshAsync(null, url, modelName, scene);
  var meshes = result.meshes
  console.log("meshes", meshes)
  const scale = 10//缩放比例
  for (var mesh of meshes) {
    mesh.scaling = new BABYLON.Vector3(scale, scale, scale)
  }
}

//回调形式
// function initRobot(scene) {
//   console.log('initRobot')
//   //模型url路径，上传了自己模型到服务器的同学可以将url和modelName改为对应路径即可
//   const url = "http://localhost:8887/"
//   //模型名称
//   const modelName = "sportcar.babylon"
//   BABYLON.SceneLoader.ImportMesh("", url, modelName, scene, function (meshes) {
//     console.log(meshes)
//     const scale = 10//缩放比例
//     for (var mesh of meshes) {
//       mesh.scaling = new BABYLON.Vector3(scale, scale, scale)
//     }
//   });
// }

function initScene() {
  //获取到renderCanvas这个元素
  var canvas = document.getElementById("renderCanvas");
  //初始化引擎
  var engine = new BABYLON.Engine(canvas, true);
  //初始化场景
  var scene = new BABYLON.Scene(engine);
  //注册一个渲染循环来重复渲染场景
  engine.runRenderLoop(function () {
    scene.render();
  });
  //浏览器窗口变化时监听
  window.addEventListener("resize", function () {
    engine.resize();
  });

  //相机初始化
  var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 5, new BABYLON.Vector3(0, 0, 10), scene);
  camera.setPosition(new BABYLON.Vector3(20, 200, 400));
  //相机角度限制
  camera.upperBetaLimit = 1.5;//最大z轴旋转角度差不多45度俯瞰
  camera.lowerRadiusLimit = 50;//最小缩小比例
  camera.upperRadiusLimit = 1500;//最大放大比例
  //变焦速度
  camera.wheelPrecision = 1; //电脑滚轮速度 越小灵敏度越高
  camera.pinchPrecision = 20; //手机放大缩小速度 越小灵敏度越高
  scene.activeCamera.panningSensibility = 100;//右键平移灵敏度
  // 将相机和画布关联
  camera.attachControl(canvas, true);

  //灯光初始化
  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
  //设置高光颜色
  light.specular = new BABYLON.Color3(0, 0, 0);
  //设置灯光强度
  light.intensity = 1

  // 绿地初始化
  var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
  materialPlane.diffuseColor = new BABYLON.Color3(152 / 255.0, 209 / 255.0, 115 / 255.0)
  materialPlane.backFaceCulling = false;
  materialPlane.freeze()
  var plane = BABYLON.MeshBuilder.CreateDisc("ground", {radius: 3000}, scene);
  plane.rotation.x = Math.PI / 2;
  plane.material = materialPlane;
  plane.position.y = -0.1;
  plane.freezeWorldMatrix()

  //网格地板初始化
  const groundSide = 144;
  var ground = BABYLON.Mesh.CreateGround("ground", groundSide, groundSide, 1, scene, true);
  var groundMaterial = new BABYLON_MATERAIAL.GridMaterial("grid", scene);
  groundMaterial.mainColor = BABYLON.Color3.White();//底板颜色
  groundMaterial.alpha = 1;//透明度
  const gridLineGray = 0.95;
  groundMaterial.lineColor = new BABYLON.Color3(gridLineGray, gridLineGray, gridLineGray);
  groundMaterial.backFaceCulling = true; // 可看到背面
  //大网格间距
  groundMaterial.majorUnitFrequency = 16;
  //小网格间距
  groundMaterial.minorUnitVisibility = 0;
  const gridOffset = 8; // 网格偏移量
  groundMaterial.gridOffset = new BABYLON.Vector3(gridOffset, 0, gridOffset);
  groundMaterial.freeze(); // 冻结材质，优化渲染速度
  ground.material = groundMaterial
  ground.freezeWorldMatrix()

  //天空盒初始化
  var skyMaterial = new BABYLON_MATERAIAL.SkyMaterial("skyMaterial", scene);
  skyMaterial.inclination = 0
  skyMaterial.backFaceCulling = false;
  var skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
  skybox.material = skyMaterial;

  return scene
}


export default {
  name: "test",
  data() {
    return {}
  },
  async mounted() {
    //加载场景
    await loadScene()
  },
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
</style>