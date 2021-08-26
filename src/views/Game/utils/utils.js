import md5 from "md5";

var debug = false
var utils = {

    radToDeg(radians) {
        var pi = Math.PI;
        return radians * (180 / pi);
    },

    degToRad(degree) {
        var pi = Math.PI;
        return degree * ( pi / 180);
    },


    getMeshSize(checkmesh){
        const sizes = checkmesh.getHierarchyBoundingVectors()
        const size = {
            x: (sizes.max.x - sizes.min.x) ,
            y: (sizes.max.y - sizes.min.y) ,
            z: (sizes.max.z - sizes.min.z)
        }
        return size
    },

    getMeshFromMeshs(newMeshes, name) {
        var mesh = null
        newMeshes.forEach((m, i) => {
            i
            // console.log("m,i",m,i)
            if (m.name == name) {
                // console.log("getMeshFromMeshs")
                mesh = m
            }
        })
        return mesh
    },


    getChildMeshFromMeshs(newMeshes, name) {
        var mesh = null
        newMeshes._children.forEach((m, i) => {
            i
            // console.log("m,i",m,i)
            if (m.name == name) {
                console.log("find child mesh")
                // console.log("getMeshFromMeshs")
                mesh = m
            }
        })
        return mesh
    },

    debugLog(...data){
      if(debug){
          console.log(...data)
      }
    },

    createProjectId(){
        return md5(new Date())
    },

    getProjectById(pro_id){
        var myProjectsList=this.getLocalProjects()
        for (const myProjectsListElement of myProjectsList) {
            if(myProjectsListElement.id==pro_id){
                return myProjectsListElement
            }
        }

        return null
    },

    deleteProjectById(pro_id){
        var myProjectsList=this.getLocalProjects()
        var idx = 0
        var isDelete = false
        for (const myProjectsListElement of myProjectsList) {
            if(myProjectsListElement.id==pro_id){
                myProjectsList.splice(idx, 1);
                isDelete = true
                break
            }
            idx++
        }

        if(isDelete){
            window.localStorage.setItem("MyProjects", JSON.stringify(myProjectsList));
            return myProjectsList
        }else {
            return false
        }

    },

    copyProjectById(pro_id){
        var myProjectsList=this.getLocalProjects()
        var isFind = false
        for (const myProjectsListElement of myProjectsList) {
            if(myProjectsListElement.id==pro_id){
                var newPro = JSON.parse(JSON.stringify(myProjectsListElement))
                newPro.name = newPro.name + "(复制)"
                newPro.id = this.createProjectId()
                myProjectsList.push(newPro)
                isFind = true
                break
            }
        }
        if(isFind){
            window.localStorage.setItem("MyProjects", JSON.stringify(myProjectsList));
            return myProjectsList
        }else {
            return false
        }
    },

    renameProjectById(pro_id,newName){
        var myProjectsList=this.getLocalProjects()
        var isRename = false
        for (const myProjectsListElement of myProjectsList) {
            if(myProjectsListElement.id==pro_id){
                myProjectsListElement.name = newName
                isRename = true
                break
            }
        }

        if(isRename){
            window.localStorage.setItem("MyProjects", JSON.stringify(myProjectsList));
            return myProjectsList
        }else {
            return false
        }
    },

    getLocalProjects(){
        var myProjectsList = window.localStorage.getItem("MyProjects");
        if(myProjectsList==null){
            myProjectsList = []
        }else {
            myProjectsList = JSON.parse(myProjectsList)
        }
        return myProjectsList
    },

}


export default utils;

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}