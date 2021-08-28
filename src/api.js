const ApiUrl = "http://127.0.0.1:8088/"//接口根目录
const ApiRootUrl = ApiUrl + "robot/"
const resourceUrl = ApiUrl + "static/"

// 路由管理
export default {
    carouselUrl:resourceUrl + "carousel/",//轮播图资源根目录
    coverUrl:resourceUrl + "cover/",//案例卡片资源根目录
    modelUrl:resourceUrl + "model/",//模型资源根目录
    simulatorUrl:resourceUrl + "simulator/",//仿真器素材资源根目录
    getAllBlocks: ApiRootUrl + "getAllBlocks",
    getQuickStartBlocks:ApiRootUrl +"getQuickStartBlocks",
    getStudyCaseBlocks:ApiRootUrl+"getStudyCaseBlocks",
    saveBlock:ApiRootUrl+"saveBlock",
    addBlock:ApiRootUrl+"addBlock",
    deleteBlock:ApiRootUrl+"deleteBlock",
    addNewProjectType:ApiRootUrl+"addNewProjectType",
    getProjectTypes:ApiRootUrl+"getProjectTypes",
    editProjectType:ApiRootUrl+"editProjectType",
    addProjectType:ApiRootUrl+"addProjectType",
    deleteProjectType:ApiRootUrl+"deleteProjectType",
};
