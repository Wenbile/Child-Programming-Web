import * as BABYLON from 'babylonjs';
import utils from "../utils/utils";

/**
 * 方向枚举
 */
if (typeof Direction == "undefined") {
    var Direction = {};
    Direction.Left = 0;
    Direction.Right = 1;
    Direction.Forward = 2;
    Direction.Back = 3;
}

/**
 * 画笔枚举
 */
if (typeof DrawState == "undefined") {
    var DrawState = {};
    DrawState.UP = 0;
    DrawState.DOWN = 1;
}


//运行状态
var isRun = false
//场景
var sceneToRender = null
//模拟器
var robotEmulator = null

var robotSize = null

//物体当前位置（用于点击移动）
var startingPoint = null

//当前车头朝向
// var heading = 0
// var _headingInc = 1


var debug = true

var debugEnable = {
    turn: true,
    move: true,
    arc: true
}

//画笔
var drawPencil = null

//优化版本画笔
var penclDynamicTexture = null
var currentX = 0
var currentY = 0


// var lineGMath.round = null

//画笔是否按下
var isDraw = null

//网格大小
// const grid_width = 50
// var final_position = null

var current_position = null

var drawPoints = []
var drawPointColors = []
// var bezierInitialPoints = [];

var fps = 20
var speed = 1

var line_grounp = 0
var line_color = new BABYLON.Color4(0, 1, 0, 1)
// var line_width = 4
// var line_parent = null;

var _headingDeltaSign = null; //车头转向方向 +向左  -向右
// var _turnLeftFinalHeading = null; //车头最终角度
var _turnLeftInitialHeading = null; // 相对旋转角度.
var _turnLeftInitialBodyHeading = null; // Absolute, body rotation.
var heading = null;

//TODO:和scenceCanvas.js参数合并
//画线材质分辨率
var textureResolution = 512;
const padGridCellCount = 9;
const padGridSide = 0.16; // pads aren't necessarily square.   m  x100  to cm
const padSide = padGridCellCount * padGridSide;
// var textureScale = 3.6
// const gMath.roundFriction = 0.8;
// const gMath.roundRestitution = 0.5;


// var _arcInfiniteLoop = false; // Used for the setSpeeds command.


var robot = {
    getRobotInstance() {
        return this
    },


    //初始化场景参数
    initScene: function (aScene, aRobotSim, robotCurrentPoint) {
        sceneToRender = aScene
        robotEmulator = aRobotSim
        robotSize = utils.getMeshSize(robotEmulator)
        this.resetBodyPose()
        this.setSpeed(1)

        startingPoint = robotCurrentPoint

        //运行状态
        isRun = false
        //画笔
        drawPencil = null
        //画笔是否按下
        isDraw = null
        current_position = null
        drawPoints = []
        drawPointColors = []
        // bezierInitialPoints = [];
        // line_parent = new BABYLON.TransformNode("lineParent");

    },

    initRobotPenclDynamicTexture(penclDynamicTex) {
        penclDynamicTexture = penclDynamicTex
        // console.log(penclDynamicTexture)
    },


    resetScene: function (aScene, aRobotSim, robotCurrentPoint) {
        sceneToRender = aScene
        robotEmulator = aRobotSim
        robotSize = utils.getMeshSize(robotEmulator)
        this.resetBodyPose()
        this.setSpeed(1)
        startingPoint = robotCurrentPoint

        currentX = 0
        currentY = 0

        //运行状态
        isRun = false
        //画笔
        drawPencil = null
        //画笔是否按下
        isDraw = null
        current_position = null
        drawPoints = []
        drawPointColors = []
        // bezierInitialPoints = [];
    },

    //模块化程序初始化
    init: function () {
        console.log("robot模块化程序初始化")
        isRun = true
    },

    upadteCurrentPosition(x,z){
        currentX = x
        currentY = z
    },

    setSpeed: function (s) {
        console.log("setSpeed")
        speed = s
    },

    checkStatus: function () {
        if (!isRun && !debug) {
            throw '程序需要初始化模块'
        }
    },

    stop: function () {
        console.log("robot模块运行结束")
        this.resetPencil()
        isRun = false
    },

    pencilTo(x, y) {
        if(!isDraw){
            currentX = x
            currentY = y
            return
        }
        //Draw on canvas
        var pencilContext = penclDynamicTexture.getContext()
        pencilContext.beginPath();
        pencilContext.lineWidth = 2;
        pencilContext.fillStyle = "green";
        pencilContext.strokeStyle = "green";
        var ax = this.sceneToPadX(currentX)
        var ay = this.sceneToPadY(currentY)
        var bx = this.sceneToPadX(x)
        var by = this.sceneToPadY(y)

        // console.log("ax,ay,x,y", ax, ay, x, y)

        pencilContext.moveTo(ax, ay);
        pencilContext.lineTo(bx, by);
        pencilContext.quadraticCurveTo(ax, ay, bx, by);
        pencilContext.stroke();

        penclDynamicTexture.update();

        currentX = x
        currentY = y
    },

    sceneToPadX(x) {
        var padSideCm = padSide * 100; //*100 to cm
        var textureMoveUnit = textureResolution / padSideCm
        return (-x * textureMoveUnit + textureResolution / 2);
    },
    sceneToPadY(z) {
        var padSideCm = padSide * 100; //*100 to cm
        var textureMoveUnit = textureResolution / padSideCm
        return (z * textureMoveUnit + textureResolution / 2);
    },

    robotPosition() {
        return {
            z: Math.round(robotEmulator.position.z, 2),
            x: Math.round(robotEmulator.position.x, 2)
        }
    },


    drawable: async function (drawable) {
        // console.log("drawable",drawable)
        var oldDrawState = isDraw
        var newDrawState = DrawState.DOWN == drawable ? true : false;
        if (oldDrawState == DrawState.DOWN && newDrawState == false) {
            //如果下笔后，抬笔，则line组id+1
            line_grounp += 1
            console.log("drawable.line_grounp", line_grounp)
            drawPoints = []
            drawPointColors = []
        }
        isDraw = newDrawState;
        for (let i = 0; i < robotEmulator._children.length; i++) {
            var pencil = robotEmulator._children[i]
            if (pencil.id == "pencil") {
                //获取笔的部件
                await this.pencilDown(drawable, pencil)

                break
            }
        }
    },

    resetPencil(){
        if(isDraw){
            for (let i = 0; i < robotEmulator._children.length; i++) {
                var pencil = robotEmulator._children[i]
                if (pencil.id == "pencil") {
                    //获取笔的部件
                    pencil.position.y += robotSize.y / 1000
                    isDraw = false
                    break
                }
            }
        }


    },

    drawableBlockly(drawable,callback){
        var oldDrawState = isDraw
        var newDrawState = DrawState.DOWN == drawable ? true : false;
        if (oldDrawState == DrawState.DOWN && newDrawState == false) {
            //如果下笔后，抬笔，则line组id+1
            line_grounp += 1
            drawPoints = []
            drawPointColors = []
        }
        isDraw = newDrawState;
        for (let i = 0; i < robotEmulator._children.length; i++) {
            var pencil = robotEmulator._children[i]
            if (pencil.id == "pencil") {
                //获取笔的部件
                this.pencilDown(drawable, pencil).then(result=>{
                    callback(result)
                })
                break
            }
        }
    },

    pencilDown: async function (pencilState, pencil) {

        // var robotBody = utils.getChildMeshFromMeshs(robotEmulator, "bumpers")

        // var robotSize2 = utils.getMeshSize(pencil)

        var oldPosition = new BABYLON.Vector3(pencil.position._x, pencil.position._y, pencil.position._z)

        var pencilDownOffset = robotSize.y / 1000
        if (oldPosition.y == -pencilDownOffset && pencilState == DrawState.DOWN) {
            console.log("[pencil already down]")
            return "pencil already down";
        } else if (oldPosition.y == 0 && pencilState == DrawState.UP) {
            console.log("[pencil already up]")
            return "pencil already up";
        }
        var count = 0

        var pencilSpeed = speed * 0.00025

        console.log("pencilDownOffset,pencilSpeed",pencilDownOffset,pencilSpeed)

        return await new Promise(resolve => {
            //刷新移动动画
            var interval = setInterval(function () {
                var isContinue = false
                if ((pencilDownOffset - count) < pencilSpeed) {
                    setTimeout(function () {
                        pencil.position.y = oldPosition.y - pencilDownOffset * (pencilState == DrawState.DOWN ? 1 : -1)
                        console.log(pencilState == DrawState.DOWN ? "[pencil down done]" : "[pencil up done]", pencil.position.y)
                        resolve("pencil down/up done");
                        clearInterval(interval);
                    })
                } else {
                    isContinue = true
                }
                if (!isContinue) {
                    return
                }

                pencil.position.y -= pencilSpeed * (pencilState == DrawState.DOWN ? 1 : -1)
                count += pencilSpeed

            }, fps)
        })

    },

    pencilcolor: async function (r, g, b) {
        //换颜色后，则line组id+1
        line_grounp += 1
        console.log("pencilcolor.line_grounp", line_grounp)
        drawPoints = []
        drawPointColors = []

        line_color.r = r
        line_color.g = g
        line_color.b = b
        return new Promise(resolve => {
            setTimeout(function () {
                console.log("[pencil color set]")
                resolve("[pencil color set]")
            }, 1000 / fps)
        })
    },


    draw: function (positionToDraw) {

        if (!isDraw) {
            return
        }
        positionToDraw.y = 0.01
        drawPoints.push(positionToDraw)
        drawPointColors.push(new BABYLON.Vector3(0, 1, 0))

        if (drawPencil == null) {

            console.log("new line")

            drawPencil = BABYLON.MeshBuilder.CreateLines(
                'line',
                {
                    points: drawPoints, colors: drawPointColors, updatable: true, useVertexAlpha: true
                },
                sceneToRender
            )

        } else {
            if (drawPencil != null) {
                drawPencil.dispose();
            }

            // console.log("old line")
            drawPencil = BABYLON.MeshBuilder.CreateLines('line', {
                points: drawPoints,
                colors: drawPointColors,
                updatable: true,
                useVertexAlpha: true
            }, sceneToRender);

        }

        drawPencil.material.freeze()
        drawPencil.freezeWorldMatrix()

        drawPencil.enableEdgesRendering();
        drawPencil.edgesWidth = 50;
        drawPencil.edgesColor = new BABYLON.Color4(line_color.r, line_color.g, line_color.b, line_color.a);

    },

    /**
     * 移动
     * @param distance 距离
     */
    move: async function (distance) {
        this.checkStatus()
        await this.slowRunMoveTask(distance)

    },

    //block不能使用async，构造普通回调方法
    moveBlockly: function (distance, callback) {
        this.checkStatus()
        this.slowRunMoveTask(distance).then(result => {
            callback(result)
        })
    },


    slowRunMoveTask: async function (distance) {

        // console.log("robotEmulator.rotation.y", robotEmulator.rotation.y)

        var localPosition = robotEmulator.getAbsolutePosition();
        // var degree = Math.round(robotEmulator.rotationQuaternion.toEulerAngles()._y / Math.PI * 180,0)
        var degree = Math.round(heading, 0)
        // console.log("move_degree", degree)
        // console.log("start.position.x,.z", localPosition._x, localPosition._z)
        var posX = -Math.round(Math.cos(utils.degToRad(degree)) * distance, 2);
        var posZ = -Math.round(Math.sin(utils.degToRad(degree)) * distance, 2);


        var orginPostion = new BABYLON.Vector3(localPosition._x, localPosition._y, localPosition._z)


        current_position = localPosition
        currentX = current_position._x
        currentY = current_position._z
        // console.log("init x,y", currentX, currentY)
        // this.draw(new BABYLON.Vector3(current_position._x, 1, current_position._z))
        this.pencilTo(current_position._x, current_position._z)
        var currentPositionOffsetX = 0
        var currentPositionOffsetZ = 0
        var that = this
        var moveSpeed = speed / 4
        return await new Promise(resolve => {


            //刷新移动动画
            var interval = setInterval(function () {

                if (!isRun) {
                    setTimeout(function () {
                        clearInterval(interval);
                        resolve("move force stop")
                    })
                }

                var currentDistance = Math.sqrt(Math.pow(currentPositionOffsetX, 2) + Math.pow(currentPositionOffsetZ, 2))
                var isCcontinue = false
                if ((distance - currentDistance) <= moveSpeed) {
                    setTimeout(function () {
                        current_position._x = orginPostion._x + posX
                        current_position._z = orginPostion._z + posZ
                        robotEmulator.position = current_position
                        // var drawPointEnd = new BABYLON.Vector3(current_position._x, 1, current_position._z)
                        // that.draw(drawPointEnd)
                        that.pencilTo(current_position._x, current_position._z)

                        //完成回调
                        if (debugEnable.move) {
                            console.log("[move done]z,x", that.robotPosition().z, that.robotPosition().x)
                        }
                        resolve("move done");
                        clearInterval(interval);
                    })

                } else {
                    isCcontinue = true
                }

                if (!isCcontinue) {
                    return
                }

                var constOffsetX = posX / distance * moveSpeed
                var constOffsetZ = posZ / distance * moveSpeed

                currentPositionOffsetX += constOffsetX
                currentPositionOffsetZ += constOffsetZ

                current_position._x += constOffsetX
                current_position._z += constOffsetZ

                // console.log("new x,y", current_position._x, current_position._z)
                that.pencilTo(current_position._x, current_position._z)

                robotEmulator.position = current_position
                // var drawPoint = new BABYLON.Vector3(current_position._x, 1, current_position._z)
                // console.log("drawPoint", drawPoint)
                // that.draw(drawPoint)


                // console.log("runingCurrentDistance", currentDistance)

            }, fps)
        })

    },


    turn: async function (dir, degree) {
        // var that = this
        // console.log("before rotation", this.getBodyHeading())
        await this.turnTask(dir, degree)
        // this.setBodyHeading(degree)
        // return await new Promise(resolve => {
        //     setTimeout(function () {
        //         // console.log("rotation", that.getBodyHeading())
        //         if (debugEnable.turn) {
        //             console.log("[turn done]rotation.y", that.getBodyHeading())
        //         }
        //         resolve("turn success")
        //     }, 100)
        // })
    },

    turnBlockly: function (dir, degree, callback) {
        this.turnTask(dir, degree).then(result => {
            callback(result)
        })

    },

    async turnTask(dir, degree) {
        _headingDeltaSign = dir == Direction.Left ? 1 : -1;
        // _turnLeftFinalHeading = Math.abs(degree);
        // _turnLeftFinalHeading
        _turnLeftInitialHeading = heading; // Relative rotation tracking.
        _turnLeftInitialBodyHeading = this.getBodyHeading(); // Absolute, body rotation.



        var that = this
        var count = 0
        return await new Promise(resolve => {
            //刷新移动动画
            var interval = setInterval(function () {

                if (!isRun) {
                    setTimeout(function () {

                        //更新车头朝向
                        heading = _turnLeftInitialHeading + _headingDeltaSign * (count - speed);//当前朝向
                        if (heading > 360) {
                            heading -= 360
                        } else if (heading < -360) {
                            heading += 360
                        }

                        clearInterval(interval);
                        resolve("turn force stop")
                    })
                }

                var isCcontinue = false
                if ((degree - count) <= speed) {
                    setTimeout(function () {
                        that.setBodyHeading(_turnLeftInitialBodyHeading + _headingDeltaSign * degree);

                        //更新车头朝向
                        heading = _turnLeftInitialHeading + _headingDeltaSign * degree;//当前朝向
                        if (heading > 360) {
                            heading -= 360
                        } else if (heading < -360) {
                            heading += 360
                        }

                        //完成回调
                        if (debugEnable.turn) {
                            console.log("[turn done]rotation.y", heading)
                        }
                        resolve("turn done");
                        clearInterval(interval);
                    })

                } else {
                    isCcontinue = true
                }

                if (!isCcontinue) {
                    return
                }

                that.setBodyHeading(_turnLeftInitialBodyHeading + _headingDeltaSign * count);
                count += speed


            }, fps)
        })

        // this.setBodyHeading(_turnLeftInitialBodyHeading + _headingDeltaSign * degree);
        // return "turn success"
    },

    turnTaskSync(dir,degree){
        _headingDeltaSign = dir == Direction.Left ? 1 : -1;
        _turnLeftInitialHeading = heading; // Relative rotation tracking.
        _turnLeftInitialBodyHeading = this.getBodyHeading(); // Absolute, body rotation.

        //车头转到指定方向
        this.setBodyHeading(_turnLeftInitialBodyHeading + _headingDeltaSign * degree)

        //更新车头朝向
        heading = _turnLeftInitialHeading + _headingDeltaSign * degree;//当前朝向
        if (heading > 360) {
            heading -= 360
        } else if (heading < -360) {
            heading += 360
        }
    },

    arc: async function (dir, degree, radius) {
        this.checkStatus()


        var localPosition = robotEmulator.getAbsolutePosition();
        currentX = localPosition._x
        currentY = localPosition._z

        var currentHeadingDegree = Math.round(heading, 0)
        // console.log("currentHeadingDegree",currentHeadingDegree)
        var posX = Math.round(Math.sin(utils.degToRad(currentHeadingDegree)) * radius, 2);
        var posZ = Math.round(Math.cos(utils.degToRad(currentHeadingDegree)) * radius, 2);
        if (dir == Direction.Left) {
            posZ = -posZ
            // posX = posX
        } else {
            posX = -posX
        }

        // console.log("poZ,poxX",posZ,posX)
        //圆弧中心点
        var arcPosition = new BABYLON.Vector3(localPosition._x + posX, localPosition._y, localPosition._z + posZ);


        startingPoint = new BABYLON.Vector3(localPosition._x, localPosition._y, localPosition._z)


        if (dir == Direction.Right) {
            return await this.arc_right(degree, radius, localPosition, arcPosition)
        } else if (dir == Direction.Left) {
            return await this.arc_left(degree, radius, localPosition, arcPosition)
        }

    },

    arcBlockly: function (dir, degree, radius,callback) {
        this.checkStatus()


        var localPosition = robotEmulator.getAbsolutePosition();
        var currentHeadingDegree = Math.round(heading, 0)
        // console.log("currentHeadingDegree",currentHeadingDegree)
        var posX = Math.round(Math.sin(utils.degToRad(currentHeadingDegree)) * radius, 2);
        var posZ = Math.round(Math.cos(utils.degToRad(currentHeadingDegree)) * radius, 2);
        if (dir == Direction.Left) {
            posZ = -posZ
            // posX = posX
        } else {
            posX = -posX
        }

        // console.log("poZ,poxX",posZ,posX)
        //圆弧中心点
        var arcPosition = new BABYLON.Vector3(localPosition._x + posX, localPosition._y, localPosition._z + posZ);


        startingPoint = new BABYLON.Vector3(localPosition._x, localPosition._y, localPosition._z)
        currentX = localPosition._x
        currentY = localPosition._z
        this.pencilTo(startingPoint._x, startingPoint._z)

        if (dir == Direction.Right) {
            this.arc_right(degree, radius, localPosition, arcPosition).then(result=>{
                callback(result)
            })
        } else if (dir == Direction.Left) {
            this.arc_left(degree, radius, localPosition, arcPosition).then(result=>{
                callback(result)
            })
        }

    },

    arc_left: async function (degree, radius, localPosition, arcPosition) {
        var offset = this.get_angle(startingPoint._z, startingPoint._x, arcPosition._z, arcPosition._x) + 270
        offset = 180 - offset
        offset = (offset < 0 ? (offset + 360) : offset)
        offset = (offset >= 360 ? (offset - 360) : offset)

        // console.log("offset", offset)

        // var orgin_radian = robotEmulator.rotation.y
        current_position = localPosition
        var count = 0
        var that = this

        return await new Promise(resolve => {

            //刷新移动动画
            var interval = setInterval(function () {

                if (!isRun) {
                    setTimeout(function () {
                        clearInterval(interval);
                        resolve("arc left force stop")
                    })
                }

                var isCcontinue = false
                if ((degree - count) <= speed) {
                    setTimeout(function () {
                        clearInterval(interval);
                        var turnDegree = degree - count
                        offset += turnDegree
                        var finalZArcPosition = arcPosition._z + radius * Math.cos(utils.degToRad(offset))
                        var finalXArcPosition = arcPosition._x - radius * Math.sin(utils.degToRad(offset))
                        //向左画弧
                        current_position._x = finalXArcPosition
                        current_position._z = finalZArcPosition
                        robotEmulator.position = current_position

                        that.turnTaskSync(Direction.Left, turnDegree)

                        that.pencilTo(current_position._x, current_position._z)

                        //完成回调
                        if (debugEnable.arc) {
                            console.log("[arc left done]z,x,roation.y", that.robotPosition().z, that.robotPosition().x, heading)
                        }

                        resolve("arc done");
                    })

                } else {
                    isCcontinue = true
                }

                if (!isCcontinue) {
                    return
                }

                var currentZArcPosition = arcPosition._z + radius * Math.cos(utils.degToRad(offset))
                var currentXArcPosition = arcPosition._x - radius * Math.sin(utils.degToRad(offset))

                //向左画弧
                current_position._x = currentXArcPosition
                current_position._z = currentZArcPosition
                robotEmulator.position = current_position


                var turnDegree = speed
                that.turnTaskSync(Direction.Left, turnDegree)
                that.pencilTo(current_position._x, current_position._z)
                offset += speed
                count += speed

            }, fps)
        })
    },

    arc_right: async function (degree, radius, localPosition, arcPosition) {
        var offset = this.get_angle(startingPoint._z, startingPoint._x, arcPosition._z, arcPosition._x) + 270

        offset = (offset >= 360 ? (offset - 360) : offset)


        // var orgin_radian = robotEmulator.rotation.y

        current_position = localPosition
        var count = 0
        var that = this
        return await new Promise(resolve => {

            //刷新移动动画
            var interval = setInterval(function () {

                if (!isRun) {
                    setTimeout(function () {
                        clearInterval(interval);
                        resolve("arc right force stop")
                    })
                }

                var isCcontinue = false
                if ((degree - count) <= speed) {
                    setTimeout(function () {
                        clearInterval(interval);

                        var turnDegree = degree - count
                        offset += turnDegree
                        var finalZArcPosition = arcPosition._z - radius * Math.cos(utils.degToRad(offset))
                        var finalXArcPosition = arcPosition._x - radius * Math.sin(utils.degToRad(offset))
                        //向左画弧
                        current_position._x = finalXArcPosition
                        current_position._z = finalZArcPosition
                        robotEmulator.position = current_position

                        that.turnTaskSync(Direction.Right, turnDegree)

                        that.pencilTo(current_position._x, current_position._z)

                        //完成回调
                        if (debugEnable.arc) {
                            console.log("[arc right done]z,x,roation.y", that.robotPosition().z, that.robotPosition().x, heading)
                        }
                        resolve("arc done");

                    })

                } else {
                    isCcontinue = true
                }
                if (!isCcontinue) {
                    return
                }

                var currentZArcPosition = arcPosition._z - radius * Math.cos(utils.degToRad(offset))
                var currentXArcPosition = arcPosition._x - radius * Math.sin(utils.degToRad(offset))

                //向右画弧
                current_position._x = currentXArcPosition
                current_position._z = currentZArcPosition
                robotEmulator.position = current_position

                var turnDegree = speed
                that.turnTaskSync(Direction.Right, turnDegree)
                that.pencilTo(current_position._x, current_position._z)

                offset += speed
                count += speed

            }, fps)
        })
    },


    //utils
    /**
     * 计算角度
     *      * @param px robot点x
     * @param px robot点y
     * @param mx 原点x
     * @param my 原点y

     * @returns {number}
     */
    get_angle: function (px, py, mx, my) {
        var x = Math.abs(px - mx);
        var y = Math.abs(py - my);
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var cos = y / z;
        var radina = Math.acos(cos);//用反三角函数求弧度
        var angle = Math.floor(180 / (Math.PI / radina));//将弧度转换成角度

        if (mx > px && my > py) {//鼠标在第四象限
            angle = 180 - angle;
        }

        if (mx == px && my > py) {//鼠标在y轴负方向上
            angle = 180;
        }

        if (mx > px && my == py) {//鼠标在x轴正方向上
            angle = 90;
        }

        if (mx < px && my > py) {//鼠标在第三象限
            angle = 180 + angle;
        }

        if (mx < px && my == py) {//鼠标在x轴负方向
            angle = 270;
        }

        if (mx < px && my < py) {//鼠标在第二象限
            angle = 360 - angle;
        }

        return angle;
    },


    //新方案
    /// All SimBots have an initial, constant heading of pi/2 in this Simulator (that's just a convention).
    /// The value of this initial heading, in degrees, can always be known by calling this function.

    resetBodyPose(x = 0, z = 0) {
        heading = 0
        this.setBodyHeading(this.initialHeading());
        this.setBodyPosition(x, z);

        // // Initial positioning in the associated DrawingPad instance.
        // if (this.drawingPad != null) {
        //     this.drawingPad.movePenTo(
        //         this.pen,
        //         this.drawingPad.sceneToPadX(this.physicsBody.position.x),
        //         this.drawingPad.sceneToPadY(this.physicsBody.position.z)
        //     );
        // }
        //
        // // Each time the pose is reset, the robot is re-positioned, so the navigation system must also be reset.
        // this.resetNavigation(() => { });
    },
    setBodyPosition(x, z) {
        robotEmulator.position.x = x; // The 0.01 factor converts cm to m.
        robotEmulator.position.z = z;
    },

    //初始化车头方向
    initialHeading() {
        return 90;
    },

    /// Returns the heading angle in deg. Axis convention: heading === -yaw.
    getBodyHeading() {
        return -utils.radToDeg(robotEmulator.rotationQuaternion.toEulerAngles().y);
    },
    setBodyHeading(angle) {
        const rotationVector = robotEmulator.rotationQuaternion.toEulerAngles();
        robotEmulator.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(
            utils.degToRad(-angle), // yaw.
            rotationVector.x, // pitch.
            rotationVector.z // roll.
        );
    },

}
export default robot
