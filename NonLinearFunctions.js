let is3D = false;
class NonLinearFunction {
    constructor(name, implementation, params = 0) {
        this.name = name;
        this.implementation = implementation;
        this.params = [];
        for (let i = 0; i < params; i++){
            this.params.push(sinRandom() * 5)
        }
        if (params){
           this.implementation = this.implementation(this.params);
        }
        this.isActive = false;
    }
    createUI() {
        const functionContainer = document.createElement("div");
        const functionName = document.createElement("span");
        const functionCheckBox = document.createElement("input");
        functionName.textContent = this.name;
        functionCheckBox.setAttribute("type", "checkbox");
        
        functionCheckBox.checked = this.isActive;
        functionCheckBox.addEventListener("change", () => {
            this.isActive = functionCheckBox.checked;
            syncWithUI();
        });
        functionContainer.appendChild(functionName);
        functionName.appendChild(functionCheckBox);
        functionName.classList.add("name");
        for (let i = 0; i < this.params.length; i++) {
            const functionSlider = document.createElement("input");
            functionSlider.setAttribute("type", "range");
            functionSlider.setAttribute("min", "-5");
            functionSlider.setAttribute("max", "5");
            functionSlider.setAttribute("value", this.params[i].toString());
            functionSlider.addEventListener("change", () => {
                this.params[i] = +functionSlider.value;
                submitChanges(); 
            })
            functionContainer.appendChild(functionSlider);
        }
        return functionContainer;
    }
}

function toStep(f) {
    return is3D ? (p) => new Vector3D(f(p.x), f(p.y), f(p.z)) : (p) => new Vector2D(f(p.x), f(p.y));
}
function sinRandom() {
    return Math.random() * 2 - 1;
}
const nonLinearFunctions = [
    new NonLinearFunction("Spherical", p => p.scale(1 / (p.length() ** 2))),
    new NonLinearFunction("Swirl", p => {
        let r = p.length();
        let cos = Math.cos(r ** 2);
        let sin = Math.sin(r ** 2);
        return make2DVec(p.x * sin - p.y * cos, p.x * cos + p.y * sin);
    }),
    new NonLinearFunction("Horseshoe", (p) => {
        let r = p.length();
        return make2DVec((p.x - p.y) * (p.x + p.y), 2 * (p.x * p.y)).scale(1 / r);
    }),
    new NonLinearFunction("Popcorn", params => p => {
        const { x, y } = p;
        return make2DVec(x + params[0] * Math.sin(Math.tan(3 * y)), y + params[1] * Math.sin(Math.tan(3 * x)));
    }, 2),
    new NonLinearFunction("Square Root", toStep(x => Math.sqrt(Math.abs(x)))),
    new NonLinearFunction("Cube Root", toStep(Math.cbrt)),
    new NonLinearFunction("Sine", toStep(Math.sin)),
    new NonLinearFunction("Cosine", toStep(Math.cos)),
    new NonLinearFunction("Tangent", toStep(Math.tan)),
    new NonLinearFunction("Hyperbolic Tangent", toStep(Math.tanh)),
    new NonLinearFunction("Sinc", toStep(x => x ? Math.sin(x) / x : 1)),
    new NonLinearFunction("Tanc", toStep(x => x ? Math.tan(x) / x : 1)),
    new NonLinearFunction("Exponential", toStep(Math.exp)),
    new NonLinearFunction("Quadratic", toStep(x => x ** 2)),
    new NonLinearFunction("Absolute Value", toStep(Math.abs)),
    new NonLinearFunction("TRANGLe 1", (p) => p.scale(0.5).add(new Vector3D(0, -0.36, 0))),
    new NonLinearFunction("TRANGLe 2", (p) => p.scale(0.5).add(new Vector3D(-0.5, 0.5, -0.5))),
    new NonLinearFunction("TRANGLe 3", (p) => p.scale(0.5).add(new Vector3D(0.5, 0.5, -0.5)))

];
function setActive(name, isActive = true) {
    for (let i = 0; i < nonLinearFunctions.length; i++) {
        if (name === nonLinearFunctions[i].name) {
            nonLinearFunctions[i].isActive = isActive;
        }
    }
}
setActive("Swirl");
setActive("Cube Root");
// activate("TRANGLe 1");
// activate("TRANGLe 2");
// activate("TRANGLe 3");