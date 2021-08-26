
//盒子滚动条拖拽
import { on, off } from './dom';

let targetDrag = {  //托拽
    isDown: false,
    coord:{
        x: 0,
        y: 0
    }
}

//x轴拖动回调 鼠标按下
const scrollMousedown = event=>{
    targetDrag.isDown = true;
    targetDrag.coord.x = event.pageX;
    targetDrag.coord.y = event.pageY;
}
//x轴拖动回调  鼠标释放

const scrollMouseup = ()=>{
    targetDrag.isDown = false;
    targetDrag.coord.x = 0;
    targetDrag.coord.y = 0;
}
//x轴拖动回调  鼠标移动

const scrollMousemove = ()=>{

}

export const scrollx = {
    inserted:function(el){
        //鼠标按下
        on(el,'mousedown',scrollMousedown);
        //鼠标释放
        on(el,'mouseup',scrollMouseup);
        //鼠标托拽
        on(el,'mousemove',event=>{
            let movX = targetDrag.coord.x - event.pageX;
            targetDrag.coord.x = event.pageX;
            if(targetDrag.isDown){
                el.scrollLeft = el.scrollLeft + movX;
            }
        });
    },
    unbind:function(el){
        off(el,'mousedown',scrollMousedown);
        off(el,'mouseup',scrollMouseup);
        off(el,'mousemove',scrollMousemove);
        //清空
        targetDrag = {  //托拽
            isDown: false,
            coord:{
                x: 0,
                y: 0
            }
        }
    }
}
