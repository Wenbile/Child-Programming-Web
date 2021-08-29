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
import ammo from "ammo.js";
import utils from "./utils";

//全局变量
var scene = null //场景实例
var engine = null //3d引擎实例
var camera = null //摄像机实例
var plane = null //绿地
var ground = null //网格
var skybox = null //天空盒
var car = null //小车
var cubeParent = null //方块组
var startingPoint = new BABYLON.Vector3(0, 0, 0)//当前点击位置

// 质量 、摩擦系数、反弹系数
const bodyMass = 0.5, bodyFriction = 0.5, bodyRestitution = 0.9;
const groundFriction = 0.8, groundRestitution = 0.5;

async function loadScene() {
  //场景初始化，可看文章一
  scene = initScene()
  //加载网络模型，可看文章二
  await initRobot()

  //可看文章三，监听拖动事件，实现点击拖动模型
  dragListening()

  //本文内容
  // 1、初始化重力碰撞系统
  await initAmmo()
  // 2、将地面和小车加入碰撞体
  addPhysicEffect()
  //3、加入碰撞体方块
  initCubes()

  //开启debug窗口
  // scene.debugLayer.show()

}

async function initAmmo() {
  const Ammo = await ammo();
  console.log("Ammo", Ammo)
  //启用y方向重力
  scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new BABYLON.AmmoJSPlugin(true, Ammo));

  scene.onReadyObservable.add(function () {
    console.log(scene.getPhysicsEngine()._physicsPlugin.bjsAMMO.btDefaultCollisionConfiguration());
    console.log(scene.getPhysicsEngine()._physicsPlugin._collisionConfiguration);
    console.log(scene.getPhysicsEngine()._physicsPlugin._dispatcher);
    console.log(scene.getPhysicsEngine()._physicsPlugin._solver);
    console.log(scene.getPhysicsEngine()._physicsPlugin.world);
  });
}

function addPhysicEffect() {
  //地面启用碰撞体
  plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane, BABYLON.PhysicsImpostor.BoxImpostor, {
    mass: 0,
    restitution: groundRestitution,
    friction: groundFriction
  }, scene);

  //小车启用碰撞体
  var robotBody = utils.getMeshFromMeshs(car, "Glass_Plane.006")
  console.log('robotBody', robotBody)

  var robotSize = utils.getMeshSize(robotBody)
  var robotScale = 50
  const robotScalingFactor = robotScale / 10;
  var physicsRoot = makePhysicsObjects(car, scene, robotScalingFactor, robotSize)
  //小车实例
  car = physicsRoot
}


function makePhysicsObjects(newMeshes, scene, scaling, size) {
  var physicsRoot = new BABYLON.Mesh("robot", scene);
  physicsRoot.position.y -= 2
  newMeshes.forEach((m) => {
    if (m.parent == null) {
      physicsRoot.addChild(m)
    }
  })

  // 将所有碰撞体加入physics impostor
  physicsRoot.getChildMeshes().forEach((m) => {
    m.scaling.x = Math.abs(m.scaling.x)
    m.scaling.y = Math.abs(m.scaling.y)
    m.scaling.z = Math.abs(m.scaling.z)
    // console.log("m.name",m.name)
    m.physicsImpostor = new BABYLON.PhysicsImpostor(m, BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0.1}, scene);
  })

  // 缩放根对象并将其变成physics impostor
  physicsRoot.scaling.scaleInPlace(scaling)

  physicsRoot.physicsImpostor = new BABYLON.PhysicsImpostor(physicsRoot, BABYLON.PhysicsImpostor.NoImpostor, {
    mass: bodyMass,
    friction: bodyFriction,
    restitution: bodyRestitution
  }, scene);

  //转为碰撞体后，其y轴会偏移，偏移比例根据实际调整
  const impostorOffset = -(size.y) / 1.1
  physicsRoot.physicsImpostor.setDeltaPosition(new BABYLON.Vector3(0, impostorOffset, 0));
  physicsRoot.position.subtractInPlace(new BABYLON.Vector3(0, -impostorOffset, 0));
  return physicsRoot
}

function initCubes() {
  var scale = 1
  const scalingFactor = scale / 10;
  cubeParent = new BABYLON.TransformNode("cubes");
  const cubeHeight = 80 * scalingFactor
  var cube = createBasicRoundedBox(scene, "cube", cubeHeight)

  cube.position._y += cubeHeight / 2
  cube.position._x -= 100
  cube.material = new BABYLON.StandardMaterial("amaterial", scene);
  cube.material.diffuseColor = new BABYLON.Color3(16 / 255.0, 156 / 255.0, 73 / 255.0);
  cubeParent[0] = cube

  var cube2 = createBasicRoundedBox(scene, "cube2", cubeHeight)
  cube2.position._y += cubeHeight / 2
  cube2.position._x -= 100
  cube2.position._z += cubeHeight * 2
  cube2.material = new BABYLON.StandardMaterial("amaterial", scene);
  cube2.material.diffuseColor = new BABYLON.Color3(48 / 255.0, 102 / 255.0, 150 / 255.0);
  cubeParent[1] = cube2

  var cube3 = createBasicRoundedBox(scene, "cube3", cubeHeight)
  cube3.position._y += cubeHeight / 2
  cube3.position._x -= 100
  cube3.position._z -= cubeHeight * 2
  cube3.material = new BABYLON.StandardMaterial("amaterial", scene);
  cube3.material.diffuseColor = new BABYLON.Color3(199 / 255.0, 88 / 255.0, 93 / 255.0);
  cubeParent[2] = cube3

  //对象事件监听
  let actionManager = new BABYLON.ActionManager(scene);
  cube.actionManager = actionManager;
  cube2.actionManager = actionManager;
  cube3.actionManager = actionManager;

  // 方块鼠标hover高亮
  var hl = new BABYLON.HighlightLayer("hl1", scene);
  actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function (evn) {
    var hover_cube = evn.meshUnderPointer.id
    if (hover_cube == cube.name) {
      hl.addMesh(cube, BABYLON.Color3.White());
    } else if (hover_cube == cube2.name) {
      hl.addMesh(cube2, BABYLON.Color3.White());
    } else if (hover_cube == cube3.name) {
      hl.addMesh(cube3, BABYLON.Color3.White());
    }


  }));
  //方块鼠标hover离开取消高亮
  actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function (evn) {
    var hover_cube = evn.meshUnderPointer.id
    if (hover_cube == cube.name) {
      hl.removeMesh(cube);
    } else if (hover_cube == cube2.name) {
      hl.removeMesh(cube2);
    } else if (hover_cube == cube3.name) {
      hl.removeMesh(cube3);
    }
  }));

  scene.freezeMaterials();
}

//创建带碰撞体的方块
function createBasicRoundedBox(scene, name, size, mass = 0.25, restitution = 0.5, friction = 0.5) {
  const boxSide = size;
  const sphereSide = boxSide * 3.1 / 2;
  const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {diameter: sphereSide, segments: 16}, scene);
  const box = BABYLON.Mesh.CreateBox('box', boxSide, scene);
  const intersection = BABYLON.CSG.FromMesh(box).intersect(BABYLON.CSG.FromMesh(sphere));
  sphere.dispose();
  box.dispose();
  const roundedBox = intersection.toMesh(
      name,
      new BABYLON.StandardMaterial('roundedBoxMaterial', scene),
      scene
  );
  roundedBox.draggable = true;
  roundedBox.physicsImpostor = new BABYLON.PhysicsImpostor(
      roundedBox,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: mass, restitution: restitution, friction: friction}
  );
  roundedBox.material.freeze();
  roundedBox.material.specularColor = new BABYLON.Color3(0, 0, 0);
  roundedBox.freezeWorldMatrix()
  return roundedBox;
}

//鼠标点击拖动监听
function dragListening() {
  // 物体拖拽事件
  var canvas = engine.getRenderingCanvas();

  var currentMesh;//当前点击的模型网格

  //判断当前点击对象是否是地板
  var getGroundPosition = function () {
    var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
      return (mesh == ground || mesh == plane);
    });
    if (pickinfo.hit) {
      return pickinfo.pickedPoint;
    }
    return null;
  }

  //鼠标点下
  var onPointerDown = function (evt) {
    if (evt.button !== 0) {
      return;
    }
    //判断当前是否点击一个模型网格，如果是地板、天空盒等对象，则设置hit为false
    var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
      return (mesh !== ground && mesh !== plane && mesh !== skybox);
    });
    console.log("pickInfo", pickInfo)
    //如果hit为true，则不为地板、天空盒等对象
    if (pickInfo.hit) {
      currentMesh = pickInfo.pickedMesh;//获取当前点击对象
      if (currentMesh.parent == null) {
        console.log("no parent")//没有父节点则就是car对象了
      } else if (currentMesh.parent.name == car.name) {
        //有父节点，证明现在点击的是子对象，而移动需要移动整个小车对象，所以设置当前点击mesh为父节点（即car对象）
        currentMesh = currentMesh.parent
      }
      console.log("currentMesh", currentMesh)
      //获取当前移动时地板的坐标
      startingPoint = getGroundPosition(evt);
      //移动物体时，暂时屏蔽相机的移动控制
      if (startingPoint) { // we need to disconnect camera from canvas
        setTimeout(function () {
          camera.detachControl(canvas);
        }, 0);
      }
    }
  }

  //鼠标点击着移动中
  var onPointerMove = function (evt) {
    if (!startingPoint) {
      return;
    }
    if (!currentMesh) {
      return;
    }
    //更新当前点击的地板位置
    var current = getGroundPosition(evt);
    if (!current) {
      return;
    }
    //更新当前小车坐标位置为点击的地板位置
    console.log('startingPoint', startingPoint)
    var diff = current.subtract(startingPoint);
    console.log('diff', diff)
    currentMesh.position.addInPlace(diff);
    console.log("currentMesh.name", currentMesh.name)
    //更新位置信息
    startingPoint = current;
  }

  //鼠标点击后松开
  var onPointerUp = function () {
    //恢复相机移动控制
    if (startingPoint) {
      camera.attachControl(canvas, true);
      startingPoint = null;
      return;
    }
  }

  //canvas绑定监听事件
  canvas.addEventListener("pointerdown", onPointerDown, false);
  canvas.addEventListener("pointerup", onPointerUp, false);
  canvas.addEventListener("pointermove", onPointerMove, false);
}


async function initRobot() {
  console.log('initRobot')
  //模型url路径
  const url = "http://localhost:8088/static/model/"
  //模型名称
  const modelName = "sportcar.babylon"
  var result = await BABYLON.SceneLoader.ImportMeshAsync(null, url, modelName, scene);
  var meshes = result.meshes
  console.log("meshes", meshes)
  // 直接构造一个car的父节点，然后实例化
  // var parent = new BABYLON.Mesh("car", scene);
  // const scale = 10//缩放比例
  // for (var mesh of meshes) {
  //   mesh.scaling = new BABYLON.Vector3(scale, scale, scale)
  //   mesh.parent = parent
  // }
  // //将根节点设置为全局变量
  // car = parent

  //不直接实例化小车节点，car对象存储meshes网格列表，在小车引入碰撞体后再实例化
  car = meshes
}

function initScene() {
  //获取到renderCanvas这个元素
  var canvas = document.getElementById("renderCanvas");
  //初始化引擎
  engine = new BABYLON.Engine(canvas, true);
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
  camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 5, new BABYLON.Vector3(0, 0, 10), scene);
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
  plane = BABYLON.MeshBuilder.CreateDisc("ground", {radius: 3000}, scene);
  plane.rotation.x = Math.PI / 2;
  plane.material = materialPlane;
  plane.position.y = -0.1;
  plane.freezeWorldMatrix()

  //网格地板初始化
  const groundSide = 144;
  ground = BABYLON.Mesh.CreateGround("ground", groundSide, groundSide, 1, scene, true);
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
  skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
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