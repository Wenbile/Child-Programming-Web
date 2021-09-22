<template>
  <div style="height: 100%;width: 100%;">
    <div>
      <canvas id="renderCanvas"></canvas>
    </div>
    <div style="display: flex;justify-content: space-around;width: 680px;">
      <div>
        <label>alpha:</label>
        <button type="button" class="btn"
                @click="setCameraPosition('alpha',Math.PI/10)">+
        </button>
        <button type="button" class="btn"
                @click="setCameraPosition('alpha',-Math.PI/10)">-
        </button>
      </div>
      <div>
        <label>beta:</label>
        <button type="button" class="btn"
                @click="setCameraPosition('beta',Math.PI/10)">+
        </button>
        <button type="button" class="btn"
                @click="setCameraPosition('beta',-Math.PI/10)">-
        </button>
      </div>
      <div>
        <label>radius:</label>
        <button type="button" class="btn"
                @click="setCameraPosition('radius',Math.PI)">+
        </button>
        <button type="button" class="btn"
                @click="setCameraPosition('radius',-Math.PI)">-
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as BABYLON from 'babylonjs';
import * as BABYLON_MATERAIAL from "babylonjs-materials"
import * as GUI from 'babylonjs-gui';
import ammo from "ammo.js";
import utils from "./utils";



const url = "http://localhost:8088/static/simulator/"

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

//质量 、摩擦系数、反弹系数
const bodyMass = 0.5, bodyFriction = 0.5, bodyRestitution = 0.9;
const groundFriction = 0.8, groundRestitution = 0.5;

let speedSelect = null//显示速度选择窗
let buttonClicked = false//按钮是否被点击

async function loadScene() {
  //场景初始化，可看文章一
  scene = initScene()

  //可看文章五，自定义启动动画
  customLoadingUI()

  //加载网络模型，可看文章二
  await initRobot()

  //可看文章三，监听拖动事件，实现点击拖动模型
  dragListening()

  //可看文章四，实现碰撞效果
  // 1、初始化重力碰撞系统
  await initAmmo()
  // 2、将地面和小车加入碰撞体
  addPhysicEffect()
  //3、加入碰撞体方块
  initCubes()

  //可看文章五，关闭启动动画
  setTimeout(() => {
    hideLoadingUI()
  }, 1000)

  //可看文章六，相机控制与相机动画
  setTimeout(function () {
    console.log(camera.alpha, camera.beta, camera.radius)
    //摄像机原位置 1.1383885512243588 1.3642551964995249 50
    //通过相机控制输出获取期望值，然后填入
    ArcAnimation(-1.5649881922490174, 0, 68.84955592153878)
  }, 1500)

  //本文内容，babylonjs-gui 按钮实现
  initButtons()

}


function initButtons() {
  //在场景中设置一个全屏的前景2d界面
  var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("btnsUI", true, scene);

  //初始化重启按钮
  var restartBtn = GUI.Button.CreateImageOnlyButton(
      "but",
      url + "restart.png"
  );
  restartBtn.height = "60px";
  restartBtn.width = "60px";
  restartBtn.thickness = 0;//边框
  restartBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT//在全屏的水平排列方位
  restartBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM//在全屏的垂直排列方位
  restartBtn.top = "-20px"//顶部偏移量
  restartBtn.left = "-20px"//左侧偏移量
  //按钮点击时间监听回调
  restartBtn.onPointerClickObservable.add(function () {
    console.log("重启引擎")
  });

  //初始化速度选择弹窗框（包含了龟速和兔速按钮的向上弹出框）
  speedSelect = new GUI.Rectangle("speedSelect");
  speedSelect.height = "110px";
  speedSelect.width = "60px";
  speedSelect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  speedSelect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
  speedSelect.top = "-90px"
  speedSelect.left = "20px"
  speedSelect.thickness = 3;
  speedSelect.color = "#505781";
  speedSelect.background = "white";
  speedSelect.cornerRadius = 15;
  speedSelect.isVisible = false

  //初始化龟速按钮
  var slowImg = GUI.Button.CreateImageOnlyButton(
      "slowlyBtn",
      url + "turtle.png"
  );
  slowImg.width = "30px";
  slowImg.height = "30px";
  slowImg.thickness = 0;
  slowImg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
  slowImg.top = 15;
  slowImg.onPointerClickObservable.add(function () {
    console.log("slowImg click")
    image.source = url + "turtle.png"
    // robotCotroller.setSpeed(1)
    //后续通过robot控制器实例设置移动速度参数
    console.log('设置移动速度：1')
    speedSelect.isVisible = false//选择完，关闭速度选择弹窗
  });

  //初始化兔速按钮
  var fastImg = GUI.Button.CreateImageOnlyButton(
      "fastBtn",
      url + "rabbit.png"
  );
  fastImg.width = "30px";
  fastImg.height = "30px";
  fastImg.thickness = 0;
  fastImg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
  fastImg.top = -15;
  fastImg.onPointerClickObservable.add(function () {
    console.log("fastImg click")
    image.source = url + "rabbit.png"
    // robotCotroller.setSpeed(6)
    console.log('设置移动速度：6')
    speedSelect.isVisible = false//选择完，关闭速度选择弹窗
  });

  speedSelect.addControl(slowImg)
  speedSelect.addControl(fastImg)

  //当前选择速度模式按钮（点击会弹出速度选择弹窗）
  var speedBtn = new GUI.Button("speedBtn");
  speedBtn.height = "60px";
  speedBtn.width = "60px";
  speedBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  speedBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
  speedBtn.top = "-20px"
  speedBtn.left = "20px"
  speedBtn.thickness = 0;
  speedBtn.onPointerClickObservable.add(function () {
    speedSelect.isVisible = !speedSelect.isVisible
    if(speedSelect.isVisible){
      buttonClicked = true//设置速度选择弹窗弹窗状态为true，用于弹窗后移动模型时取消弹窗状态
    }
  });

  //当前选择速度模式按钮的边框
  var speedBtnBorder = new GUI.Ellipse();
  speedBtnBorder.width = "60px"
  speedBtnBorder.height = "60px";
  speedBtnBorder.color = "#505781";
  speedBtnBorder.thickness = 3;
  speedBtnBorder.background = "white";
  //当前选择速度模式按钮的图案
  var image = new GUI.Image("currentSpeedBtn", url + "turtle.png");
  image.width = "30px";
  image.height = "30px";
  image.thickness = 0;
  speedBtn.addControl(speedBtnBorder);
  speedBtn.addControl(image);

  //将按钮添加在全屏的2d前景界面中
  advancedTexture.addControl(restartBtn);
  advancedTexture.addControl(speedBtn);
  advancedTexture.addControl(speedSelect);
}


/**
 * 相机动画
 * @param toAlpha  动画完成时的alpha
 * @param toBeta  动画完成时的beta
 * @param toRadius 动画完成时的radius
 * @constructor
 */
function ArcAnimation(toAlpha, toBeta, toRadius) {

  let animCamAlpha = new BABYLON.Animation("animCam",
      "alpha",//需要设置动画的属性名称
      30,//每秒帧数
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,//属性变量类型  浮点型
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT//动画循环模式 保持最终状态
  );

  let begin = 0, end = 100

  let keysAlpha = [];//alpha动画关键帧列表，从0-100%，alpha从camera.alpha变化到传入的toAlpha参数值
  keysAlpha.push({
    frame: begin,
    value: camera.alpha
  });
  keysAlpha.push({
    frame: end,
    value: toAlpha
  });
  animCamAlpha.setKeys(keysAlpha)//配置动画关键帧列表到动画对象中

  //初始化beta动画参数
  let animCamBeta = new BABYLON.Animation("animCam", "beta", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
  let keysBeta = []
  keysBeta.push({frame: begin, value: camera.beta})
  keysBeta.push({frame: end, value: toBeta})
  animCamBeta.setKeys(keysBeta)

  //初始化radius动画参数
  let animCamRadius = new BABYLON.Animation("animCam", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)
  let keysRadius = [];
  keysRadius.push({frame: begin, value: camera.radius})
  keysRadius.push({frame: end, value: toRadius})
  animCamRadius.setKeys(keysRadius)

  //加入相机动画列表中
  camera.animations.push(animCamAlpha, animCamBeta, animCamRadius)

  //通过scene开启camera的动画列表
  scene.beginAnimation(
      camera,//开始动画列表的对象
      begin,//动画开始帧
      end,//动画结束帧
      false,//动画是否循环
      6,//动画的速度比
      () => {
        console.log('camera')
      }//动画执行完成回调
  )
}

function hideLoadingUI() {
  engine.hideLoadingUI()
  document.getElementById("customLoadingScreenDiv").remove()
}

function customLoadingUI() {

  BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    if (document.getElementById("customLoadingScreenDiv")) {
      document.getElementById("customLoadingScreenDiv").style.display = "initial";
      return;
    }
    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "customLoadingScreenDiv";
    this._loadingDiv.style.background = "#505781";
    this._loadingDiv.style.height = "100%";
    this._loadingDiv.style.width = "700px";
    this._loadingDiv.style.alignContent = "center";
    this._loadingDiv.style.zIndex = "10006"
    var img = new Image()
    img.src = url + "loading.gif";
    img.style.padding = "15%";
    img.style.paddingTop = "30%";
    this._loadingDiv.appendChild(img);

    this._resizeLoadingUI();
    window.addEventListener("resize", this._resizeLoadingUI);
    document.body.appendChild(this._loadingDiv);
  };

  engine.displayLoadingUI();
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
  // physicsRoot.position.y -= 2
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
function createBasicRoundedBox(scene, name, size) {
  let mass = 0.25, restitution = 0.5, friction = 0.5
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
    // console.log("pickInfo", pickInfo)
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
    //如果速度选择窗口位关闭，则关闭窗口
    if(buttonClicked){
      buttonClicked = false
      speedSelect.isVisible = false
    }


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
  camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
  //这里的值可通过课程6的相机控制手动控制获取期望位置
  camera.alpha = 1.1383885512243588
  camera.beta = 1.3642551964995249
  camera.radius = 50
  // (new BABYLON.Vector3(18, 9, 39));
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
  methods: {
    setCameraPosition(type, value) {
      console.log(type, value)

      switch (type) {
        case 'alpha':
          camera.alpha += value
          break;
        case 'beta':
          camera.beta += value
          break
        case 'radius':
          camera.radius += value
          break
      }
      let {alpha, beta, radius} = camera
      console.log(`更改后的值:${alpha},${beta},${radius}`)
    }
  }
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

.btn {
  background-color: #D9D9D9;
  padding: 2px 15px;
  margin: 5px;
  border-radius: 4px;
  width: 50px;
}
</style>