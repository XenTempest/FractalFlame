"use strict";
class Matrix2D {
    x;
    y;
    z;
    constructor(a, b, c, d, e, f) {
        this.x = new Vector2D(a, d);
        this.y = new Vector2D(b, e);
        this.z = new Vector2D(c, f);
    }
    times(vec) {
        return this.z.add(this.x.scale(vec.x)).add(this.y.scale(vec.y));
    }
}
// class Matrix3D {
//     x: Vector3D;
//     y: Vector3D;
//     z: Vector3D;
//     w: Vector3D;
//     constructor(a:number, b:number, c:number, d:number, e:number, f:number, g:number, h:number, i:number, j:number, k:number, l: number) {
//         this.x = new Vector3D(a, e, i);
//         this.y = new Vector3D(b, f, j);
//         this.z = new Vector3D(c, g, k);
//         this.w = new Vector3D(d, h, l);
//     }
//     times(vec: Vector3D) {
//         return this.w.add(this.z.scale(vec.z)).add(this.x.scale(vec.x)).add(this.y.scale(vec.y));
//     }
// }
// type MatrixND = typeof is3D extends true ? Matrix3D : Matrix2D;
