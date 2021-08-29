var utils = {
    //meshs中根据名称获取mesh
    getMeshFromMeshs(newMeshes, name) {
        var mesh = null
        newMeshes.forEach(m => {
            if (m.name == name) {
                mesh = m
            }
        })
        return mesh
    },

    //获取mesh的尺寸信息
    getMeshSize(checkmesh) {
        const sizes = checkmesh.getHierarchyBoundingVectors()
        const size = {
            x: (sizes.max.x - sizes.min.x),
            y: (sizes.max.y - sizes.min.y),
            z: (sizes.max.z - sizes.min.z)
        }
        return size
    },
}
export default utils;
