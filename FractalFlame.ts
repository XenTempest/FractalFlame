
class Color {
    constructor(public r: number, public g: number, public b: number, public a = 1) {
    }
    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
    incorporate(color: Color) {
        const t = .5;
        this.r = lerp(this.r, color.r, t);
        this.g = lerp(this.g, color.g, t);
        this.b = lerp(this.b, color.b, t);
        this.a = lerp(this.a, color.a, t);
    }
}
const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
canvas.height = innerHeight * devicePixelRatio;
canvas.width = innerWidth * devicePixelRatio;
const brush = canvas.getContext("2d")!;
const center = new Vector2D(canvas.width / 2, canvas.height / 2);
const POINT_COUNT = 100;
const POINT_OPACITY = .1;
/** Randomly chooses a function out of the provided list StepOpts, fed to CurrFunction which applies that function to the given point vector  */
function choose(functions: StepOpt[], probs: Map<StepOpt, number>): StepOpt {
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < functions.length; i++) {
        sum += probs.get(functions[i])!;
        if (r < sum) {
            return functions[i];
        }
    }
    while (true);
}
/**
 * Converts a point to screen-space
 * @param p a Vector in world-space
 * @returns the same Vector realigned to screen-space
 */
function toScreenSpace(p: Vector2D) {
    // Scales p by half of the smallest dimension then adds the center to finalize shift to screen-space
    const screenSpacedVector = p.scale(Math.min(canvas.width, canvas.height) / 2).add(center);
    return new Vector2D(Math.round(screenSpacedVector.x), Math.round(screenSpacedVector.y));
}

function resetPoint(point: Point) {
    point.vector = new Vector2D(sinRandom(), sinRandom());
    // is3D ? new Vector3D(sinRandom(), sinRandom(), sinRandom()) :
}
type Point = { vector: Vector2D, color: Color };
const points: Point[] = [];
// On initalization, creates the point array as opaque black points, and resets them to random coordinates
for (let i = 0; i < POINT_COUNT; i++) {
    points.push({
        vector: /* is3d ? new Vector3D(0, 0, 0) : */ new Vector2D(0, 0),
        color: new Color(0, 0, 0, 1)
    });
    resetPoint(points[i]);
}

function randomMatrix() {
    return new Matrix2D(sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom(), sinRandom());
}

let randomMatrices = 2;
/**
 * @returns a random linear function
 */
function randomMatrixFn() {
    // Passes in a random matrix, and returns
    return matrixFn(randomMatrix());
}

/**
 * @param matrix a matrix
 * @returns the linear function based on the matrix
 */
function matrixFn(matrix: Matrix2D) {
    return (vector: Vector2D) => matrix.times(vector);
}
/**
 * https://en.wikipedia.org/wiki/Linear_interpolation
 */
function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
}
let matrixWeight = 0.5;
/**
 * Normalizes function probability distribution
 * @param probs non-normalized StepOpt probabilities
 * @returns a map of function key probability values that sum to 1
 */
function normalizeDistribution(probs: Map<StepOpt, number>) {
    let sum = 0;
    const normalizedProbs = new Map<StepOpt, number>();
    for (let value of probs.values()) {
        sum += value;
    }
    for (let key of probs.keys()) {
        normalizedProbs.set(key, probs.get(key)! / sum);
    }
    return normalizedProbs;
}

/**
 * @returns the coefficient that, when applied to a stepProb, assists in realizing non-linear to linear function ratio according to matrixWeight
 */
function getWeightCoefficient(fn: StepOpt) {
    if (isNonLinearFunction(fn)) {
        const intendedPrevalence = 1 - matrixWeight;
        const currentPrevalence = (stepOpts.length - randomMatrices) / stepOpts.length;
        return intendedPrevalence / currentPrevalence;
    }
    const intendedPrevalence = matrixWeight;
    const currPrevalence = randomMatrices / stepOpts.length;
    return intendedPrevalence / currPrevalence;
}
function randomColor() {
    return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, POINT_OPACITY);
}
function make2DVec(x: number, y: number): Vector2D {
    return /* is3D ? new Vector3D(x, y, 0) as unknown as VectorND : */ new Vector2D(x, y);
}
let matrixFunctions: StepOpt[] = [];
/**
 * creates a new array of random linear functions and applies them
 */
function randomizeMatrices() {
    matrixFunctions = [];
    for (let i = 0; i < randomMatrices; i++) {
        matrixFunctions.push(randomMatrixFn());
    }
    submitChanges();
}
/**
 * @param keys array of ideal keys
 * @param map map to be synchronized with keys
 * @param random function to fill in missing values of keys 
 */
function syncKeys<K, V>(keys: K[], map: Map<K, V>, random: () => V) {
    for (const key of map.keys()) {
        if (!keys.includes(key)) {
            map.delete(key);
        }
    }
    for (const key of keys) {
        if (!map.has(key)) {
            map.set(key, random());
        }
    }
}
type StepOpt = (vector: Vector2D) => Vector2D;
let stepOpts: StepOpt[];
function isNonLinearFunction(fn: StepOpt) {
    for (let i = 0; i < stepOpts.length - randomMatrices; i++) {
        if (fn === stepOpts[i]) {
            return true;
        }
    }
    return false;
}
/**
 * Clears stepOpts, pushes active non-linear functions to stepOpts, synchronizes linear functions to randomMatrices, calls syncKeys on stepProbs and stepColors, normalizes stepProbs, and refreshes the screen
 */
function submitChanges() {
    stepOpts = [];
    for (let i = 0; i < nonLinearFunctions.length; i++) {
        if (nonLinearFunctions[i].isActive) {
            stepOpts.push(nonLinearFunctions[i].implementation);
            for (let j = 0; j < nonLinearFunctions[i].values.length; j++) {
                nonLinearFunctions[i].params[j] = nonLinearFunctions[i].values[j];
            }
        }

    }

    if (randomMatrices !== matrixFunctions.length) {
        randomizeMatrices();
    }


    stepOpts.push(...matrixFunctions);
    syncKeys(stepOpts, stepProbs, Math.random);
    syncKeys(stepOpts, stepColors, randomColor);
    const distortedStepProbs = new Map<StepOpt, number>();
    for (let [key, value] of stepProbs) {
        distortedStepProbs.set(key, value * getWeightCoefficient(key));
    }
    normalStepProbs = normalizeDistribution(distortedStepProbs);
    refresh();
}
/**
 * resets all points and clears the screen
 */
function refresh() {
    for (let i = 0; i < points.length; i++) {
        resetPoint(points[i]);
    }
    imageData.data.fill(0);
}
const stepProbs = new Map<StepOpt, number>();
let normalStepProbs: Map<StepOpt, number>;
/**
 * clears current stepProbs and gives each stepOpt of stepProbs a random probability
 */
function randomizeProbs() {
    stepProbs.clear();
    for (let i = 0; i < stepOpts.length; i++) {
        stepProbs.set(stepOpts[i], Math.random());
    }
    submitChanges();
}

const stepColors = new Map<StepOpt, Color>();
/**
 * clears current stepColors and gives each stepOpt of stepColors a random color
 */
function randomizeColors() {
    stepColors.clear();
    for (let i = 0; i < stepOpts.length; i++) {
        stepColors.set(stepOpts[i], randomColor());
    }
    submitChanges();
}
const imageData = brush.getImageData(0, 0, canvas.width, canvas.height);
const PIXEL_CHUNK_SIZE = 4;
const INIT_CYCLES = 20;
const CYCLES_PER_FRAME = 1000;
const POINTS_RESET_PER_FRAME = 10;
function animate() {
    for (let i = 0; i < CYCLES_PER_FRAME; i++) {
        for (let j = 0; j < points.length; j++) {
            const point = points[j];

            const currFunction = choose(stepOpts, normalStepProbs);
            const currColor = stepColors.get(currFunction)!;
            point.vector = currFunction(point.vector);
            point.color.incorporate(currColor);
            const screenPoint = toScreenSpace(point.vector);

            if ((screenPoint.y < canvas.height && screenPoint.y > 0)
                && (screenPoint.x < canvas.width && screenPoint.x > 0) && i > INIT_CYCLES) {
                const pixelChunk = (screenPoint.x + canvas.width * screenPoint.y) * PIXEL_CHUNK_SIZE;
                const alpha = point.color.a;
                imageData.data[pixelChunk] = lerp(imageData.data[pixelChunk], point.color.r, alpha);
                imageData.data[pixelChunk + 1] = lerp(imageData.data[pixelChunk + 1], point.color.g, alpha);
                imageData.data[pixelChunk + 2] = lerp(imageData.data[pixelChunk + 2], point.color.b, alpha);
                imageData.data[pixelChunk + 3] = lerp(imageData.data[pixelChunk + 3], 255, alpha);
            }
        }
    }
    for (let i = 0; i < POINTS_RESET_PER_FRAME; i++) {
        const j = Math.floor(Math.random() * points.length);
        resetPoint(points[j]);
    }
    requestAnimationFrame(animate);
    brush.putImageData(imageData, 0, 0);
}
submitChanges();
animate();