/**
 * babylon
 ***/
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import * as BABYLON_MATERAIAL from "babylonjs-materials"

import * as GUI from 'babylonjs-gui';

import ammo from "../../../../node_modules/ammo.js/builds/ammo";
import utils from "../utils/utils";
import api from "../../../api"

var debug = false
//显示速度选择窗
var speedSelect = null

//场景
var scene = null;

var canvas = null;

var engine = null;

//摄像机
var camera = null;


//大绿地
var splane = null;
//网格地板
var sground = null
//画线地板
var spencilGround = null
//画线的材质主体  context
var penclDynamicTexture = null
// 天空盒
var sskybox = null

//robotD的根节点
var sparent = null

//当前点击位置
var sstartingPoint = null

//机器人控制实例
var robotCotroller = null
var scale = 1 //机器人大小缩放
const scalingFactor = scale / 10;

var robotScale = 50
const robotScalingFactor = robotScale / 10;

// [Kg]
var bodyMass = 0.5, bodyFriction = 0.5, bodyRestitution = 0.9;

// var bodyFriction = 0;
// var bodyRestitution = 0;

//网格地面
const padGridCellCount = 9;
const padGridSide = 0.16; // pads aren't necessarily square.
const padSide = padGridCellCount * padGridSide;
const groundFriction = 0.8;
const groundRestitution = 0.5;
//画线材质分辨率
var textureResolution = 512;
// const groundFriction = 0;
// const groundRestitution = 0;

const url = api.simulatorUrl
var cubeParent = []

let divFps = null;

var buttonClicked = false


var scenceCanvas = {


    async init(cas, fpsView) {
        canvas = cas
        divFps = fpsView
        this.initEngine()
        this.initCamera()
        //灯光
        this.initLights()
        //初始化重力碰撞系统
        await this.initAmmo()
        //地面
        this.initGreenGround()
        //网格地板
        this.initGridPlane()
        this.initPencilGround()
        // 天空盒
        this.initSkyBox()
        // 小方块组
        this.initCubes()
        // 操作按钮
        this.initButtons()
        //机器人
        await this.initRobot()
        //拖动事件监听
        this.dragListening()
        if (debug) {
            scene.debugLayer.show()
        }
        return scene
    },

    async initAmmo() {
        const Ammo = await ammo();
        utils.debugLog("Ammo", Ammo)
        //y 重力
        scene.enablePhysics(new BABYLON.Vector3(0, -100, 0), new BABYLON.AmmoJSPlugin(true, Ammo));

        scene.onReadyObservable.add(function () {
            utils.debugLog("getPhysicsEngine", scene.getPhysicsEngine()._physicsPlugin.bjsAMMO.btDefaultCollisionConfiguration());
            utils.debugLog(scene.getPhysicsEngine()._physicsPlugin._collisionConfiguration);
            utils.debugLog(scene.getPhysicsEngine()._physicsPlugin._dispatcher);
            utils.debugLog(scene.getPhysicsEngine()._physicsPlugin._solver);
            utils.debugLog(scene.getPhysicsEngine()._physicsPlugin.world);
        });
    },

    bindRobotController(robot) {
        robotCotroller = robot
    },

    cleanDrawLines() {
        camera = null;
        splane = null;
        sground = null
        sskybox = null
        sparent = null
        sstartingPoint = new BABYLON.Vector3(0, 0, 0)


    },

    async retsetScene() {
        this.cleanDrawLines();
        //销毁旧场景
        scene.dispose()
        // 获取到renderCanvas这个元素
        this.initEngine()
        if (debug) {
            scene.debugLayer.show()
        }
        //摄像机
        this.initCamera()
        //灯光
        this.initLights()
        //初始化重力碰撞系统
        await this.initAmmo()
        //地面
        this.initGreenGround()
        //网格地板
        this.initGridPlane()
        this.initPencilGround()
        // 天空盒
        this.initSkyBox()
        // 小方块组
        this.initCubes()

        // 操作按钮
        this.initButtons()

        await this.initRobot(sparent)

        //机器人控制实例初始化
        robotCotroller.resetScene(scene, sparent, sstartingPoint)
        robotCotroller.initRobotPenclDynamicTexture(penclDynamicTexture)
        console.log("robotCotroller", robotCotroller)

    },

    createDefaultEngine() {
        return new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    },
    async resizeEngine() {
        await this.retsetScene()
        engine.resize()
    },
    initEngine() {
        engine = this.createDefaultEngine();
        if (!engine) throw 'engine should not be null.';
        scene = new BABYLON.Scene(engine);

        this.customLoadingUI()
        engine.displayLoadingUI();
        engine.runRenderLoop(function () {
            if (scene) {
                scene.render();
                divFps.innerHTML = "(" + engine.getFps().toFixed() + " fps)";
            }
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
    },


    initCamera() {
        camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
        //z水平
        // camera.setPosition(new BABYLON.Vector3(-200 * scalingFactor, 300 * scalingFactor, 200 * scalingFactor));
        camera.setPosition(new BABYLON.Vector3(-210 * scalingFactor, 250 * scalingFactor, 200 * scalingFactor));
        //相机角度限制
        camera.upperBetaLimit = 1.5;//最大z轴旋转角度差不多45度俯瞰
        camera.lowerRadiusLimit = 20;//最小缩小比例
        camera.upperRadiusLimit = 500;//最大放大比例
        //变焦速度
        camera.wheelPrecision = 5; //电脑滚轮速度 越小灵敏度越高
        camera.pinchPrecision = 20; //手机放大缩小速度 越小灵敏度越高
        scene.activeCamera.panningSensibility = 100;//右键平移灵敏度
        // // 将相机和画布关联
        camera.attachControl(canvas, true);
        return camera;
    },

    initLights() {
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 10, 0), scene);
        light.specular = new BABYLON.Color3(0, 0, 0);
        light.intensity = 1

    },

    initGreenGround() {
        // const scalingFactor = scale / 10;
        const groundSide = scale * 100 * padSide;
        const skySize = groundSide * 50 / 2
        //绿地
        //Creation of a repeated textured material
        var materialPlane = new BABYLON.StandardMaterial("texturePlane", scene);
        materialPlane.diffuseColor = new BABYLON.Color3(152 / 255.0, 209 / 255.0, 115 / 255.0)
        materialPlane.backFaceCulling = false;//Allways show the front and the back of an element
        materialPlane.freeze()
        var plane = BABYLON.MeshBuilder.CreateDisc("ground", {radius: skySize}, scene);
        // plane.position.x = 25;
        plane.rotation.x = Math.PI / 2;
        plane.material = materialPlane;

        plane.freezeWorldMatrix()
        // plane.material.diffuseColor = new BABYLON.Color3(0,1,0)
        plane.position.y = -0.01;

        plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: groundRestitution,
            friction: groundFriction
        }, scene);


        splane = plane
        return plane
    },

    initGridPlane() {

        const groundSide = scale * 100 * padSide;
        var ground = BABYLON.Mesh.CreateGround("ground", groundSide, groundSide, 1, scene, true);
        var groundMaterial = new BABYLON_MATERAIAL.GridMaterial("grid", scene);
        groundMaterial.freeze(); // Optimization.
        groundMaterial.mainColor = BABYLON.Color3.White();//底板颜色
        groundMaterial.alpha = 1;//透明度
        const gridLineGray = 0.95;
        groundMaterial.lineColor = new BABYLON.Color3(gridLineGray, gridLineGray, gridLineGray);
        groundMaterial.backFaceCulling = true; // Change this if the back of the pad needs to be visible.

        //大网格间距
        groundMaterial.majorUnitFrequency = groundSide / padGridCellCount;
        //小网格间距
        groundMaterial.minorUnitVisibility = 0;
        const gridOffset = 0.5 * groundSide / padGridCellCount; // This makes the grid cells to be aligned with the pad's borders.
        groundMaterial.gridOffset = new BABYLON.Vector3(gridOffset, 0, gridOffset);

        ground.material = groundMaterial

        sground = ground
        return ground
    },

    getRobotPenclDynamicTexture() {
        return penclDynamicTexture
    },

    initPencilGround() {
        const groundSide = scale * 100 * padSide;
        var ground = BABYLON.MeshBuilder.CreateGround("pencilGround", {
            width: groundSide,
            height: groundSide,
            subdivisions: 1
        }, scene);
        //创建动态材质
        penclDynamicTexture = new BABYLON.DynamicTexture("dynamic texture", textureResolution, scene);
        // var pencilContext = penclDynamicTexture.getContext();

        var materialGround = new BABYLON.StandardMaterial("Mat", scene);
        materialGround.diffuseTexture = penclDynamicTexture;
        materialGround.opacityTexture = penclDynamicTexture;
        materialGround.specularColor = new BABYLON.Color3(0, 0, 0);
        materialGround.backFaceCulling = false;
        materialGround.useAlphaFromDiffuseTexture = true;
        materialGround.freeze();
        ground.material = materialGround;
        ground.rotation.y -= Math.PI
        ground.position.y += 0.01
        ground.freezeWorldMatrix()
        ground.alphaIndex = 0

        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: groundRestitution,
            friction: groundFriction
        }, scene);

        spencilGround = ground
    },

    initSkyBox() {
        const groundSide = scale * 100 * padSide;
        const skySize = groundSide * 50
        // const scalingFactor = scale / 10;
        var skyMaterial = new BABYLON_MATERAIAL.SkyMaterial("skyMaterial", scene);
        skyMaterial.backFaceCulling = false;
        //设置日出日落
        skyMaterial.inclination = 0
        //设置地平线
        skyMaterial.cameraOffset.y = skySize / 10;
        // skyMaterial.freeze()

        // Sky mesh (box)
        var skybox = BABYLON.Mesh.CreateBox("skyBox", skySize, scene);
        skybox.material = skyMaterial;
        // skybox.freezeWorldMatrix()
        sskybox = skybox
        return skybox;
    },


    createBasicRoundedBox: function (scene, name, size) {
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
            {mass: mass, restitution: restitution, /*1,*/ friction: friction}
        );
        roundedBox.material.freeze();
        roundedBox.material.specularColor = new BABYLON.Color3(0, 0, 0);
        roundedBox.freezeWorldMatrix()

        return roundedBox;
    },

    initCubes() {
        cubeParent = new BABYLON.TransformNode("cubes");
        const cubeHeight = 80 * scalingFactor
        var cube = this.createBasicRoundedBox(scene, "cube", cubeHeight)

        cube.position._y += cubeHeight / 2
        cube.position._x -= 100
        cube.material = new BABYLON.StandardMaterial("amaterial", scene);
        cube.material.diffuseColor = new BABYLON.Color3(16 / 255.0, 156 / 255.0, 73 / 255.0);
        // cube.parent = cubeParent
        cubeParent[0] = cube

        var cube2 = this.createBasicRoundedBox(scene, "cube2", cubeHeight)
        cube2.position._y += cubeHeight / 2
        cube2.position._x -= 100
        cube2.position._z += cubeHeight * 2
        cube2.material = new BABYLON.StandardMaterial("amaterial", scene);
        cube2.material.diffuseColor = new BABYLON.Color3(48 / 255.0, 102 / 255.0, 150 / 255.0);
        // cube2.parent = cubeParent
        cubeParent[1] = cube2

        var cube3 = this.createBasicRoundedBox(scene, "cube3", cubeHeight)
        cube3.position._y += cubeHeight / 2
        cube3.position._x -= 100
        cube3.position._z -= cubeHeight * 2
        cube3.material = new BABYLON.StandardMaterial("amaterial", scene);
        cube3.material.diffuseColor = new BABYLON.Color3(199 / 255.0, 88 / 255.0, 93 / 255.0);
        // cube3.parent = cubeParent
        cubeParent[2] = cube3

        //对象事件监听
        let actionManager = new BABYLON.ActionManager(scene);
        cube.actionManager = actionManager;
        cube2.actionManager = actionManager;
        cube3.actionManager = actionManager;

        // Add the highlight layer.

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
        //if hover is over remove highlight of the mesh
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
    },

    initButtons() {
        console.log('gui',GUI)
        var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

        var restartBtn = GUI.Button.CreateImageOnlyButton(
            "but",
            url + "restart.png"
        );
        restartBtn.height = "60px";
        restartBtn.width = "60px";
        restartBtn.thickness = 0;
        restartBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
        restartBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        restartBtn.top = "-20px"
        restartBtn.left = "-20px"
        restartBtn.onPointerClickObservable.add(function () {
            console.log("重启引擎")
            scenceCanvas.resizeEngine()
        });


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


        var slowImg = GUI.Button.CreateImageOnlyButton(
            "slowlyBtn",
            url + "turtle.png"
        );
        // var slowImg = new GUI.Image("slowlyBtn",  url + "turtle.png");
        slowImg.width = "30px";
        slowImg.height = "30px";
        slowImg.thickness = 0;
        slowImg.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP
        slowImg.top = 15;
        slowImg.onPointerClickObservable.add(function () {
            console.log("slowImg click")
            image.source = url + "turtle.png"
            robotCotroller.setSpeed(1)
            speedSelect.isVisible = false
        });

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
            robotCotroller.setSpeed(6)
            speedSelect.isVisible = false
        });

        speedSelect.addControl(slowImg)
        speedSelect.addControl(fastImg)


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
                buttonClicked = true
            }
        });
        speedBtn.isPointerBlocker = true


        var ellipse1 = new GUI.Ellipse();
        ellipse1.width = "60px"
        ellipse1.height = "60px";
        ellipse1.color = "#505781";
        ellipse1.thickness = 3;
        ellipse1.background = "white";

        var image = new GUI.Image("currentSpeedBtn", url + "turtle.png");
        image.width = "30px";
        image.height = "30px";
        image.thickness = 0;
        speedBtn.addControl(ellipse1);
        speedBtn.addControl(image);


        advancedTexture._shouldBlockPointer = false
        advancedTexture.addControl(restartBtn);
        advancedTexture.addControl(speedBtn);
        advancedTexture.addControl(speedSelect);
    },

    makePhysicsObjects(newMeshes, scene, scaling,size) {
        var physicsRoot = new BABYLON.Mesh("robot", scene);

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
        const impostorOffset = - (size.y) / 1.1
        physicsRoot.physicsImpostor.setDeltaPosition(new BABYLON.Vector3(0, impostorOffset,0));
        physicsRoot.position.subtractInPlace(new BABYLON.Vector3(0, -impostorOffset, 0));


        return physicsRoot
    },


    async initRobot() {
        // const modelName = "robot.babylon"
        const modelName = "sportcar.babylon"
        // const modelName = "aodi.babylon"
        console.log("api.modelUrl",api.modelUrl)
        var result = await BABYLON.SceneLoader.ImportMeshAsync(null, api.modelUrl, modelName, scene);

        var newMeshes = result.meshes
        // var robotBody = utils.getMeshFromMeshs(newMeshes, "bumpers")
        var robotBody = utils.getMeshFromMeshs(newMeshes, "Glass_Plane.006")
        // var robotBody = utils.getMeshFromMeshs(newMeshes, "car_Mesh.154_car_Mesh.001_Material_#25.002")
        console.log('robotBody',robotBody)

        var robotSize = utils.getMeshSize(robotBody)
        console.log('robotSize',robotSize)

        var parent = new BABYLON.Mesh("robot", scene);
        // //
        //2、笔
        var pencil = new BABYLON.Mesh("pencil");
        var faceUV = [];
        //0 1 2 底 中 顶
        faceUV[0] = new BABYLON.Vector4(0, 0, 0, 0);
        //水平拉伸比例 1不拉伸     垂直放大比例 0不放大    水平左边裁剪量    垂直顶部裁剪量
        faceUV[1] = new BABYLON.Vector4(1, 0.2, 0, 1);
        faceUV[2] = new BABYLON.Vector4(0, 0, 0.25, 1);
        var faceColors = [];
        //0 1 2 底 中 顶
        faceColors[0] = new BABYLON.Color4(0.5, 0.5, 0.5, 1)
        faceColors[2] = new BABYLON.Color3(16 / 255.0, 156 / 255.0, 73 / 255.0)//顶部绿色
        var pencilHeight = robotSize.y * 4
        var pencilDownOffset = robotSize.y / 2
        var pencilDiameter = 0.3 * robotSize.x
        var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
            height: pencilHeight,
            diameter: pencilDiameter,
            faceUV: faceUV,
            faceColors: faceColors,
            updatable: true,
        }, scene);
        cylinder.position._y = pencilHeight / 2 + pencilDownOffset
        cylinder.rotation._y = cylinder.rotation._y + Math.PI / 2
        var canMaterial = new BABYLON.StandardMaterial("material", scene);
        canMaterial.diffuseTexture = new BABYLON.Texture(url + "marker.png", scene)


        cylinder.material = canMaterial

        canMaterial.freeze()

        cylinder.parent = pencil
        // newMeshes.push(cylinder)

        //笔头
        var innerDiameter = pencilDiameter * 0.8;
        var outerDiameter = pencilDiameter;
        var pencilHeadHeight = pencilHeight / 20;

        var tess = 50;

        var inner = BABYLON.Mesh.CreateCylinder("inner", pencilHeadHeight, innerDiameter, innerDiameter, tess, 1, scene, true);
        var outer = BABYLON.Mesh.CreateCylinder("outer", pencilHeadHeight, outerDiameter, outerDiameter, tess, 1, scene, true);

        var innerCSG = BABYLON.CSG.FromMesh(inner);
        var outerCSG = BABYLON.CSG.FromMesh(outer);

        var subCSG = outerCSG.subtract(innerCSG);

        var mat0 = new BABYLON.StandardMaterial("mat0", scene);

        var out_in = subCSG.toMesh("csg2", mat0, scene);

        out_in.material.mainColor = new BABYLON.Color3(0, 1, 0);
        var myMaterial = new BABYLON.StandardMaterial("outinMaterial", scene);

        myMaterial.diffuseColor = new BABYLON.Color3(16 / 255.0, 156 / 255.0, 73 / 255.0);
        myMaterial.freeze()
        out_in.material = myMaterial
        out_in.position._y = pencilHeight + pencilDownOffset + pencilHeadHeight / 2
        out_in.parent = pencil

        inner.scaling._z = 0.7
        inner.scaling._x = 0.7
        inner.material = myMaterial
        inner.position = out_in.position
        inner.parent = pencil
        outer.dispose()

        newMeshes.push(pencil)

        var physicsRoot = this.makePhysicsObjects(newMeshes, scene, robotScalingFactor,robotSize)

        console.log("physicsRoot",physicsRoot)
        // physicsRoot.position.y += 2
        var robotEmulator = physicsRoot


        parent = robotEmulator



        engine.hideLoadingUI();
        var lodingDiv = document.getElementById("customLoadingScreenDiv")
        if(lodingDiv){
            lodingDiv.outerHTML = ""
        }


        setTimeout(function () {
            scenceCanvas.ArcAnimation(0, 0, 470 * scale / 5)
        }, 1500)


        parent.freezeWorldMatrix()

        parent.position.y += 0.1
        sparent = parent
        return parent
    },

    getRobot() {
        return sparent
    },

    getStartPoint() {
        return sstartingPoint
    },

    customLoadingUI() {
        BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
            if (document.getElementById("customLoadingScreenDiv")) {
                // Do not add a loading screen if there is already one
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
    },


    //开机动画
    ArcAnimation(toAlpha, toBeta, toRadius) {

        var animCamAlpha = new BABYLON.Animation("animCam", "alpha", 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        var keysAlpha = [];
        keysAlpha.push({
            frame: 0,
            value: camera.alpha
        });
        keysAlpha.push({
            frame: 100,
            value: toAlpha
        });
        var animCamBeta = new BABYLON.Animation("animCam", "beta", 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        var keysBeta = [];
        keysBeta.push({
            frame: 0,
            value: camera.beta
        });
        keysBeta.push({
            frame: 100,
            value: toBeta
        });
        var animCamRadius = new BABYLON.Animation("animCam", "radius", 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        var keysRadius = [];
        keysRadius.push({
            frame: 0,
            value: camera.radius
        });
        keysRadius.push({
            frame: 100,
            value: toRadius
        });
        animCamAlpha.setKeys(keysAlpha);
        animCamBeta.setKeys(keysBeta);
        animCamRadius.setKeys(keysRadius);
        camera.animations.push(animCamAlpha);
        camera.animations.push(animCamBeta);
        camera.animations.push(animCamRadius);
        scene.beginAnimation(camera, 0, 100, false, 6, function () {

        });

    },

    //鼠标点击拖动监听
    dragListening(startingPoint) {
        // 物体拖拽事件
        var canvas = engine.getRenderingCanvas();

        var currentMesh;

        var getGroundPosition = function () {
            // Use a predicate to get position on the ground
            var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
                return (mesh == sground || mesh == spencilGround || mesh == splane);
            });
            if (pickinfo.hit) {
                return pickinfo.pickedPoint;
            }

            return null;
        }

        var onPointerDown = function (evt) {
            if (evt.button !== 0) {
                return;
            }

            // check if we are under a mesh
            var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
                return (mesh !== sground && mesh !== spencilGround && mesh !== sskybox && mesh !== splane);
            });

            // //关闭窗口
            // if(showSpeedSelect){
            //     showSpeedSelect = false
            // }


            console.log("pickInfo", pickInfo)


            if (pickInfo.hit) {
                scene.stopAnimation(parent);
                currentMesh = pickInfo.pickedMesh;
                if (currentMesh.parent == null) {
                    console.log("no parent")
                } else if (currentMesh.parent.name == "robot") {
                    currentMesh = currentMesh.parent
                } else if (currentMesh.parent.name == "pencil") {
                    currentMesh = currentMesh.parent.parent
                }
                console.log("currentMesh", currentMesh)
                startingPoint = getGroundPosition(evt);

                if (startingPoint) { // we need to disconnect camera from canvas
                    setTimeout(function () {
                        camera.detachControl(canvas);
                    }, 0);
                }
            }
        }

        var onPointerUp = function () {
            if(buttonClicked){
                buttonClicked = false
                speedSelect.isVisible = false
            }
            if (startingPoint) {
                camera.attachControl(canvas, true);
                startingPoint = null;
                return;
            }
        }

        var onPointerMove = function (evt) {
            if (!startingPoint) {
                return;
            }

            var current = getGroundPosition(evt);

            if (!current) {
                return;
            }

            var diff = current.subtract(startingPoint);
            currentMesh.position.addInPlace(diff);
            // if(currentMesh.name == "robot"){
            //     robotCotroller.upadteCurrentPosition(currentMesh.position.x,currentMesh.position.y)
            // }
            console.log("currentMesh.name",currentMesh.name)

            startingPoint = current;
            // console.log("startingPoint",startingPoint)

        }

        canvas.addEventListener("pointerdown", onPointerDown, false);
        canvas.addEventListener("pointerup", onPointerUp, false);
        canvas.addEventListener("pointermove", onPointerMove, false);

        // scene.onDispose = function () {
        //     canvas.removeEventListener("pointerdown", onPointerDown);
        //     canvas.removeEventListener("pointerup", onPointerUp);
        //     canvas.removeEventListener("pointermove", onPointerMove);
        // }

        sstartingPoint = startingPoint
    },


}

export default scenceCanvas;