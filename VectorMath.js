class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    length() {
        return Math.hypot(this.x, this.y);
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    static fromPolar(angle, length) {
        let vecX = length * Math.cos(angle);
        let vecY = length * Math.sin(angle);
        return new Vector2D(vecX, vecY);
    }
    inv() {
        return new Vector2D(-this.x, -this.y);
    }
    add(vec2) {
        return new Vector2D(this.x + vec2.x, this.y + vec2.y);
    }
    sub(vec2) {
        return this.add(vec2.inv());
    }
    scale(a) {
        return new Vector2D(this.x * a, this.y * a);
    }
    dot(vec2) {
        return this.x * vec2.x + this.y * vec2.y;
    }
    cross(vec2) {
        return this.x * vec2.y - this.y * vec2.x;
    }
    normalize() {
        return this.scale(1 / this.length());
    }
}
class Vector3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    length() {
        return Math.hypot(this.x, this.y, this.z);
    }
    angle() {
        return Math.atan2(this.y, this.x, this.z);
    }
    inv() {
        return new Vector3D(-this.x, -this.y, -this.z);
    }
    add(vec2) {
        return new Vector3D(this.x + vec2.x, this.y + vec2.y, this.z + vec2.z);
    }
    sub(vec2) {
        return this.add(vec2.inv());
    }
    scale(a) {
        return new Vector3D(this.x * a, this.y * a, this.z * a);
    }
    dot(vec2) {
        return this.x * vec2.x + this.y * vec2.y + this.z * vec2.z;
    }
    cross(vec2) {
        return this.x * vec2.y - this.y * vec2.x;
    }
    normalize() {
        return this.scale(1 / this.length());
    }
}