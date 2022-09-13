// eslint-disable-next-line no-unused-vars
class Robot {
    constructor() {
        this.isRun = false
    }
    init() {
        console.log("robot模块化程序初始化")
        this.isRun = true
    }
    stop() {
        console.log("robot模块运行结束")
        this.isRun = false
    }
    checkStatus() {
        if (!this.isRun) {
            throw '程序需要初始化模块'
        }
    }
    async move(distance) {
        this.checkStatus()
        // 模拟小车运动
        return new Promise(resolve => {
            let moveDis = 0
            let interval = setInterval(() => {
                if (moveDis < distance) {
                    console.log(`move ${moveDis++}`)
                } else {
                    clearInterval(interval)
                    interval = undefined
                    resolve()
                }
            }, 100)
        })
    }
    async arc(direction, degree, distance) {
        this.checkStatus()
        // 模拟小车运动
        return new Promise(resolve => {
            let moveDis = 0
            let interval = setInterval(() => {
                if (moveDis < distance) {
                    console.log(`direction: ${direction}, move:${moveDis++}, degree: ${degree}`)
                } else {
                    clearInterval(interval)
                    interval = undefined
                    resolve()
                }
            }, 100)
        })
    }
}
export default Robot
