// Helpers ********************************************

//return num between min and max
function clamp(num, min, max) {
    if (num<min)return min
    else if(num>max) return max;
    else return num;
};

// Return true if ball collides with object
function onCollideBall(b,obj){
    if(b.y-b.radius > obj.y+obj.h) return false;
    if(b.y+b.radius < obj.y) return false;
    if(b.x-b.radius > obj.x+obj.w) return false;
    if(b.x+b.radius < obj.x) return false;

    //console.log(obj.x+obj.w)
    //console.log(b.x-b.radius + '>='+ obj.x+obj.w)
    return true;
} 