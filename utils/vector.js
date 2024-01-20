export class Vector3 {

    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; };
    
    distanceSq = (v) => (this.x - v.x)**2 + (this.y - v.y)**2 + (this.z - v.z)**2; 
    distanceSq = (x, y, z) => (this.x - x)**2 + (this.y - y)**2 + (this.z - z)**2; 
    distance = (v) => Math.sqrt(this.distanceSq(v));
    distance = (x, y, z) => Math.sqrt(this.distanceSq(x, y, z));
}

export class Vector2 {

    constructor(x = 0, y = 0) { this.x = x; this.y = y; };
    
    static fromAngle = (angle) => new Vector2(-Math.sin(angle), Math.cos(angle));

    toVec3atY = (y) => new Vector3(this.x, y, this.y);
    
    distanceSq = (v) => (this.x - v.x)**2 + (this.y - v.y)**2; 
    distanceSq = (x, y) => (this.x - x)**2 + (this.y - y)**2; 
    distance = (v) => Math.sqrt(this.distanceSq(v));
    distance = (x, y) => Math.sqrt(this.distanceSq(x, y));


}