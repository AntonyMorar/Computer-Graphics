// Helpers ********************************************

//return num between min and max
function clamp(num, min, max) {
    if (num<min)return min
    else if(num>max) return max;
    else return num;
};

// Random with range of numbers
function randomRange(a,b){
    return Math.floor(Math.random() * (b+1)) + (a);
}

// Return true if ball collides with object
function onCollideBall(b,obj){
    if(b.y-b.radius > obj.y+obj.h) return false;
    if(b.y+b.radius < obj.y) return false;
    if(b.x-b.radius > obj.x+obj.w) return false;
    if(b.x+b.radius < obj.x) return false;
    return true;
} 