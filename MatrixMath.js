class Matrix2D{
    constructor(a, b, c, d, e, f){
        this.x = new Vector2D(a, d);
        this.y = new Vector2D(b, e);
        this.z = new Vector2D(c, f);
    }
    times(vec){
        return this.z.add(this.x.scale(vec.x)).add(this.y.scale(vec.y));
    }
}
class Matrix3D{
    constructor(a, b, c, d, e, f, g, h, i, j, k, l){
        this.x = new Vector3D(a, e, i)
        this.y = new Vector3D(b, f, j)
        this.z = new Vector3D(c, g, k)
        this.w = new Vector3D(d, h, l)
    }
    times(vec){
        return this.w.add(this.z.scale(vec.z)).add(this.x.scale(vec.x)).add(this.y.scale(vec.y));
    }
}