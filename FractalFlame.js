const is3D = false;
class Color {
    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    incorporate(color) {
        const t = .5;
        this.r = lerp(this.r, color.r, t);
        this.g = lerp(this.g, color.g, t);
        this.b = lerp(this.b, color.b, t);
        this.a = lerp(this.a, color.a, t);
    }
}
const canvas = document.getElementById("canvas");
canvas.height = innerHeight * devicePixelRatio;
canvas.width = innerWidth * devicePixelRatio;
/** @type {CanvasRenderingContext2D} */
const brush = canvas.getContext("2d", { willReadFrequently: true });
let center = new Vector2D(canvas.width / 2, canvas.height / 2);
let color = 0;
function choose(f, p) {
    let r = Math.random();
    let sum = 0;
    for (let i = 0; i < f.length; i++) {
        sum += p[i];
        if (r < sum) {
            return f[i];
        }
    }
}
function toScreenSpace(p) {
    if (is3D) {
        let z = p.z + 2;
        p = new Vector2D(p.x, p.y);
        p = p.scale(1 / z);
    }
    const sharpened = p.scale(Math.min(canvas.width, canvas.height) / 2).add(center);
    return new Vector2D(Math.round(sharpened.x), Math.round(sharpened.y));
}
let points = [];
for (let i = 0; i < 100; i++) {
    points.push({
        vector: is3D ? new Vector3D(0, 0, 0) : new Vector2D(0, 0),
        color: new Color(0, 0, 0, 1)
    });
}
function sinRandom() {
    return Math.random() * 2 - 1;
}
function randomMatrix() {
    if (is3D) {
        return new Matrix3D(sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom());
    }
    return new Matrix2D(sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom());
}
function randomMatrixFn() {
    return matrixFn(randomMatrix());
}
function matrixFn(mat) {
    return mat.times.bind(mat);
}
function remap(n, initialMin, initialMax, finalMin, finalMax) {
    return (n - initialMin) / (initialMax - initialMin) * (finalMax - finalMin) + finalMin;
}
function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}
function normalizeDistribution(d) {
    let sum = 0;
    for (let i = 0; i < d.length; i++) {
        sum += d[i];
    }
    for (let i = 0; i < d.length; i++) {
        d[i] /= sum;
    }
}
function toStep(f) {
    return is3D ? (p) => new Vector3D(f(p.x), f(p.y), f(p.z)) : (p) => new Vector2D(f(p.x), f(p.y));
}
function randColor() {
    return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, .1);
}
function make2DVec(x, y) {
    return is3D ? new Vector3D(x, y, 0) : new Vector2D(x, y);
}
let time = 0;
let stepOpts = [
    // (p) => p.scale(0.5).add(new Vector3D(0, -0.36, 0)),
    //(p) => p.scale(0.5).add(new Vector3D(-0.5, 0.5, -0.5)),
    //(p) => p.scale(0.5).add(new Vector3D (0.5, 0.5, -0.5)),
    //(p) => p.scale(0.5).add(new Vector3D (0, 0.5, 0.36)),
    // (p) => p.scale(0.5).add(make2DVec(0, 0.2)),
    //(p) => p.scale(0.5).add(make2DVec(-2, -0.5)),
    //(p) => p.scale(0.5).add(make2DVec(2, -0.5)),
    //matrixFn(new Matrix(0, 0, 0, 0, 0.16, 0)),
    //  matrixFn(new Matrix(0.85, 0.04, 0, -0.04, 0.85, 1.60)),
    //  matrixFn(new Matrix(0.2, -0.26, 0, 0.23, 0.22, 1.6)),
    // matrixFn(new Matrix(-0.15, 0.28, 0, 0.26, 0.24, 0.44)),
    randomMatrixFn(),
    randomMatrixFn(),
    randomMatrixFn(),
    toStep(x => Math.sqrt(Math.abs(x))),
    //toStep(x => Math.cos(Math.cos(1/x**(Math.round(Math.random()*2))))),
    //toStep(x => Math.cos(x)/Math.sin(x)) 
];

const stepProbs = [];
while (stepProbs.length < stepOpts.length) {
    stepProbs.push(Math.random() * 1000);
}
normalizeDistribution(stepProbs);
const stepColors = new Map();
for (let i = 0; i < stepOpts.length; i++) {
    stepColors.set(stepOpts[i], randColor());
}
function animate() {
    const imageData = brush.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < points.length; j++) {
            const point = points[j];

            const currFunction = choose(stepOpts, stepProbs);
            const currColor = stepColors.get(currFunction);
            point.vector = currFunction(point.vector);
            point.color.incorporate(currColor);

            const screenPoint = toScreenSpace(point.vector);

            if ((screenPoint.x < canvas.width && screenPoint.x > 0)
                && (screenPoint.y < canvas.height && screenPoint.y > 0)) {
                const pixelChunk = (screenPoint.x + canvas.width * screenPoint.y) * 4;
                const alpha = point.color.a;
                imageData.data[pixelChunk] = lerp(imageData.data[pixelChunk], point.color.r, alpha);
                imageData.data[pixelChunk + 1] = lerp(imageData.data[pixelChunk + 1], point.color.g, alpha);
                imageData.data[pixelChunk + 2] = lerp(imageData.data[pixelChunk + 2], point.color.b, alpha);
                imageData.data[pixelChunk + 3] = lerp(imageData.data[pixelChunk + 3], 255, alpha);
            }
        }
        time++;
    }
    for (let i = 0; i < 10; i++) {
        const j = Math.floor(Math.random() * points.length);
        points[j].vector = make2DVec(0, 0);
    }
    requestAnimationFrame(animate);
    brush.putImageData(imageData, 0, 0);
}
animate();