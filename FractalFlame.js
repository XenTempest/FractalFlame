
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
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < f.length; i++) {
        sum += p.get(f[i]);
        if (r < sum) {
            return f[i];
        }
    }
}
function toScreenSpace(p) {
    if (is3D) {
        const z = p.z + 2;
        p = new Vector2D(p.x, p.y);
        p = p.scale(1 / z);
    }
    const sharpened = p.scale(Math.min(canvas.width, canvas.height) / 2).add(center);
    return new Vector2D(Math.round(sharpened.x), Math.round(sharpened.y));
}
function resetPoint(point) {
    point.vector = is3D ? new Vector3D(sinRandom(), sinRandom(), sinRandom()) : new Vector2D(sinRandom(), sinRandom());
}
const points = [];
for (let i = 0; i < 100; i++) {
    points.push({
        vector: is3D ? new Vector3D(0, 0, 0) : new Vector2D(0, 0),
        color: new Color(0, 0, 0, 1)
    });
    resetPoint(points[i]);
}
function randomMatrix() {
    if (is3D) {
        return new Matrix3D(sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom());
    }
    return new Matrix2D(sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom());
}
let randomMatrices = 2;
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
let matrixWeight = 0.5;
function normalizeDistribution(d) {
    let sum = 0;
    const normalizedProbs = new Map();
    for (let value of d.values()) {
        sum += value;
    }
    for (let key of d.keys()) {
        normalizedProbs.set(key, d.get(key) / sum);
    }
    return normalizedProbs;
}
function getWeightCoefficient(fn) {
    if (isNonLinearFunction(fn)) {
        const intendedPrevalence = 1 - matrixWeight;
        const currentPrevalence = (stepOpts.length - randomMatrices) / stepOpts.length
        return intendedPrevalence / currentPrevalence;
    }
    const intendedPrevalence = matrixWeight;
    const currPrevalence = randomMatrices / stepOpts.length;
    return intendedPrevalence / currPrevalence;
}
function randColor() {
    return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, .1);
}
function make2DVec(x, y) {
    return is3D ? new Vector3D(x, y, 0) : new Vector2D(x, y);
}
let matrices = [];
function randMatrices() {
    matrices = [];
    for (let i = 0; i < randomMatrices; i++) {
        matrices.push(randomMatrixFn());
    }
    submitChanges();
}
function clownToClownCommunicate(a, m, f) {
    for (const key of m.keys()) {
        if (!a.includes(key)) {
            m.delete(key);
        }
    }
    for (const key of a) {
        if (!m.has(key)) {
            m.set(key, f());
        }
    }
}
let stepOpts;
function isNonLinearFunction(fn) {
    for (let i = 0; i < stepOpts.length - randomMatrices; i++) {
        if (fn === stepOpts[i]) {
            return true;
        }
    }
    return false;
}
function submitChanges() {
    stepOpts = [];
    for (let i = 0; i < nonLinearFunctions.length; i++) {
        if (nonLinearFunctions[i].isActive) {
            stepOpts.push(nonLinearFunctions[i].implementation);
        }
    }
    if (randomMatrices !== matrices.length) {
        randMatrices();
    }


    stepOpts.push(...matrices);
    clownToClownCommunicate(stepOpts, stepProbs, Math.random);
    clownToClownCommunicate(stepOpts, stepColors, randColor);
    const distortedStepProbs = new Map();
    for (let [key, value] of stepProbs) {
        distortedStepProbs.set(key, value * getWeightCoefficient(key));
    }
    normalStepProbs = normalizeDistribution(distortedStepProbs);
    refresh();
}
function refresh() {
    for (let i = 0; i < points.length; i++) {
        resetPoint(points[i]);
    }
    imageData.data.fill(0);
}
const stepProbs = new Map();
let normalStepProbs;
function randWeights() {
    stepProbs.clear();
    for (let i = 0; i < stepOpts.length; i++) {
        stepProbs.set(stepOpts[i], Math.random());
    }
    submitChanges();
}

const stepColors = new Map();
function randColors() {
    stepColors.clear();
    for (let i = 0; i < stepOpts.length; i++) {
        stepColors.set(stepOpts[i], randColor());
    }
    submitChanges();
}
const imageData = brush.getImageData(0, 0, canvas.width, canvas.height);
function animate() {
    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < points.length; j++) {
            const point = points[j];

            const currFunction = choose(stepOpts, normalStepProbs);
            const currColor = stepColors.get(currFunction);
            point.vector = currFunction(point.vector, point.vector);
            point.color.incorporate(currColor);

            const screenPoint = toScreenSpace(point.vector);

            if ((screenPoint.y < canvas.height && screenPoint.y > 0)
                && (screenPoint.x < canvas.width && screenPoint.x > 0) && i > 20) {
                const pixelChunk = (screenPoint.x + canvas.width * screenPoint.y) * 4;
                const alpha = point.color.a;
                imageData.data[pixelChunk] = lerp(imageData.data[pixelChunk], point.color.r, alpha);
                imageData.data[pixelChunk + 1] = lerp(imageData.data[pixelChunk + 1], point.color.g, alpha);
                imageData.data[pixelChunk + 2] = lerp(imageData.data[pixelChunk + 2], point.color.b, alpha);
                imageData.data[pixelChunk + 3] = lerp(imageData.data[pixelChunk + 3], 255, alpha);
            }
        }
    }
    for (let i = 0; i < 10; i++) {
        const j = Math.floor(Math.random() * points.length);
        resetPoint(points[j]);
    }
    requestAnimationFrame(animate);
    brush.putImageData(imageData, 0, 0);
}
submitChanges();
animate();