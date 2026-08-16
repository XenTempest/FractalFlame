"use strict";
class Vector {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    get r() {
        return this.length();
    }
    get theta() {
        return this.angle();
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    sub(vec2) {
        return this.add(vec2.inv());
    }
    normalize() {
        return this.scale(1 / this.length());
    }
}
class Vector2D extends Vector {
    constructor(x, y) {
        super(x, y);
    }
    length() {
        return Math.hypot(this.x, this.y);
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
    scale(a) {
        return new Vector2D(this.x * a, this.y * a);
    }
    dot(vec2) {
        return this.x * vec2.x + this.y * vec2.y;
    }
    cross(vec2) {
        return this.x * vec2.y - this.y * vec2.x;
    }
}
// class Vector3D extends Vector<Vector3D> {
//     constructor( x: number,  y: number, public z: number) {
//         super(x, y);
//     }
//     length() {
//         return Math.hypot(this.x, this.y, this.z);
//     }
//     inv() {
//         return new Vector3D(-this.x, -this.y, -this.z);
//     }
//     add(vec2: Vector3D) {
//         return new Vector3D(this.x + vec2.x, this.y + vec2.y, this.z + vec2.z);
//     }
//     scale(a: number) {
//         return new Vector3D(this.x * a, this.y * a, this.z * a);
//     }
//     dot(vec2: Vector3D) {
//         return this.x * vec2.x + this.y * vec2.y + this.z * vec2.z;
//     }
//     cross(vec2: Vector3D) {
//         return new Vector3D(
//             this.y * vec2.z - this.z * vec2.y,
//             this.x * vec2.z - this.z * vec2.x,
//             this.x * vec2.y - this.y * vec2.x
//         );
//     }
// }
// type VectorND = typeof is3D extends true ? Vector3D: Vector2D;
