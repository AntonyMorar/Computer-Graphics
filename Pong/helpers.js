// Helpers ********************************************

//return num between min and max
function clamp(num, min, max) {
    if (num < min) return min;
    else if (num > max) return max;
    else return num;
};

// Random with range of numbers
function randomRange(a, b) {
    return Math.floor(Math.random() * (b + 1)) + (a);
}

// Return true if ball collides with object
function onCollideBall(b, obj) {
    if (b.y - b.radius > obj.y + obj.h) return false;
    if (b.y + b.radius < obj.y) return false;
    if (b.x - b.radius > obj.x + obj.w) return false;
    if (b.x + b.radius < obj.x) return false;
    return true;
}

//Fix the Y defletion error (return false if deflects normal)
function deflectY(b, obj) {
    if (b.dy == 0) return false;
    else if (b.dx == 0) return true;
    // if the movement is diagonal
    else {
        let slp = b.dy / b.dx;
        let cx, cy;
        // Q2: Moving Up to the Right
        if (slp < 0 && b.dx > 0) {
            cx = obj.x - b.x;
            cy = obj.y + obj.h - b.y;
            console.log(cy / cx)
            if (cx < 0) return true;
            else if (cy / cx > slp) return false;
            else return true;
        } // Q4: Moving Down to the Right
        else if (slp > 0 && b.dx > 0) {
            cx = obj.x - b.x
            cy = obj.y - b.y
            console.log(cy / cx)
            if (cx < 0) return true;
            else if (cy / cx > slp) return true;
            else return false;
        } // Q3: Moving Down to the Left
        else if (slp < 0 && b.dx < 0) {
            cx = obj.x + obj.w - b.x;
            cy = obj.y - b.y;

            if (cx > 0) return true;
            else if (cy / cx < slp) return true;
            else return false;
        } // Q1: Moving Up to the Left
        else if (slp > 0 && b.dx < 0) {
            cx = obj.x + obj.w - b.x;
            cy = obj.y + obj.h - b.y;

            if (cx > 0) return true;
            else if (cy / cx > slp) return true;
            else return false;
        }
    }
    return false;
}

function overlap(a, b) {
    return !(a.x > b.x + b.w || a.y > b.y + b.h || a.x + a.w < b.x || a.y + a.h < b.y);
}