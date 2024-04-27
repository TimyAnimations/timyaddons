export class Vector3 {
    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static distanceSq(v1, v2) {
        return (v1.x - v2.x)**2 + (v1.y - v2.y)**2 + (v1.z - v2.z)**2;
    }
    static distance(v1, v2) {
        return Math.sqrt(this.distanceSq(v1, v2));
    }
    static fromEulerAngles(x, y) {
        const cos_x = Math.cos(x * Math.PI / 180.0);
        const sin_x = Math.sin(x * Math.PI / 180.0);
        const cos_y = Math.cos(y * Math.PI / 180.0);
        const sin_y = Math.sin(y * Math.PI / 180.0);
        return {
            x: -(sin_y * cos_x),
            y: -sin_x,
            z: cos_y * cos_x
        }
    }
}

export class Vector2 {
    static dotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static distanceSq(v1, v2) {
        return (v1.x - v2.x)**2 + (v1.y - v2.y)**2;
    }
    static distance(v1, v2) {
        return Math.sqrt(this.distanceSq(v1, v2));
    }
    static fromAngle(angle) {
        return {x: -Math.sin(angle), y: Math.cos(angle)};
    }
}