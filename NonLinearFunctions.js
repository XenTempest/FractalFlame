let is3D = false;
class NonLinearFunction {
    constructor(name, implementation, paramsRadii = []) {
        this.name = name;
        this.implementation = implementation;
        this.params = [];
        this.paramsRadii = paramsRadii;
        for (let i = 0; i < paramsRadii.length; i++) {
            this.params.push(sinRandom() * paramsRadii[i]);
        }
        if (paramsRadii.length) {
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
        const uncheckAll = document.getElementById("disableAll");
        uncheckAll.addEventListener("click", () => {
            functionCheckBox.checked = false;
            this.isActive = false;
        })
        functionContainer.appendChild(functionName);
        functionName.appendChild(functionCheckBox);
        functionName.classList.add("name");
        for (let i = 0; i < this.params.length; i++) {
            const functionSlider = document.createElement("input");
            functionSlider.setAttribute("type", "range");
            functionSlider.setAttribute("min", (-this.paramsRadii[i]).toString());
            functionSlider.setAttribute("max", this.paramsRadii[i].toString());
            functionSlider.setAttribute("value", this.params[i].toString());
            functionSlider.setAttribute("step", "0.001")
            functionSlider.addEventListener("change", () => {
                this.params[i] = +functionSlider.value;
                submitChanges();
            });
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
function disableAll() {
    syncWithUI();
}
function mod(numerator, denominator) {
    return (numerator % denominator + denominator) % denominator;
}
const nonLinearFunctions = [
    new NonLinearFunction("Spherical", p => p.scale(1 / (p.length() ** 2))),
    new NonLinearFunction("Swirl", p => {
        const r = p.length();
        const cos = Math.cos(r ** 2);
        const sin = Math.sin(r ** 2);
        return make2DVec(p.x * sin - p.y * cos, p.x * cos + p.y * sin);
    }),
    new NonLinearFunction("Horseshoe", (p, { r }) => {
        return make2DVec((p.x - p.y) * (p.x + p.y), 2 * (p.x * p.y)).scale(1 / r);
    }),
    new NonLinearFunction("Disc", ({ r, theta }) => {
        return make2DVec(Math.sin(Math.PI * r), Math.cos(Math.PI * r)).scale(theta / Math.PI);
    }),
    new NonLinearFunction("Spiral", ({ r, theta }) => {
        return make2DVec(Math.cos(theta) + Math.sin(r), Math.sin(theta) - Math.cos(r)).scale(1 / r);
    }),
    new NonLinearFunction("Popcorn", params => ({ x, y }) => {
        return make2DVec(x + params[0] * Math.sin(Math.tan(3 * y)), y + params[1] * Math.sin(Math.tan(3 * x)));
    }, [2, 2]),
    new NonLinearFunction("Polar", ({ r, theta }) => {
        return make2DVec(theta / Math.PI, r - 1);
    }),
    new NonLinearFunction("Hyperbolic", ({ r, theta }) => {
        return make2DVec(Math.sin(theta) / r, r * Math.cos(theta));
    }),
    new NonLinearFunction("Diamond", ({ r, theta }) => {
        return make2DVec(Math.sin(theta) * Math.cos(r), Math.cos(theta) * Math.sin(r));
    }),
    new NonLinearFunction("Heart", ({ r, theta }) => {
        return make2DVec(Math.sin(theta * r), Math.cos(theta * r)).scale(r);
    }),
    new NonLinearFunction("Cello Salad", ({ r, theta }) => {
        return make2DVec(Math.sin(theta + r), Math.cos(theta - r)).scale(r);
    }),
    new NonLinearFunction("X", ({ r, theta }) => {
        let p0 = Math.sin(theta + r);
        let p1 = Math.cos(theta - r);
        return make2DVec(p0 ** 3 + p1 ** 3, p0 ** 3 - p1 ** 3).scale(r);
    }),
    new NonLinearFunction("Julia", params => ({ r, theta }) => {
        return make2DVec(Math.cos(theta / 2 + params[0]), Math.sin(theta / 2 + params[0])).scale(Math.sqrt(r));
    }, [10]),
    new NonLinearFunction("Waves", params => ({ x, y }) => {
        return make2DVec((x + (params[0] * Math.sin(y / params[1] ** 2))), (y + (params[2] * Math.sin(x / params[3] ** 2))));
    }, [1, 1, 1, 1]),
    new NonLinearFunction("Exponential2", ({ x, y }) => {
        return make2DVec(Math.cos(Math.PI * y), Math.sin(Math.PI * y)).scale(Math.exp(x - 1));
    }),
    new NonLinearFunction("Curl", params => ({ x, y }) => {
        const t1 = 1 + params[0] * x + params[1] * (x ** 2 - y ** 2);
        const t2 = params[0] * y + 2 * params[1] * x * y;
        return make2DVec(x * t1 + y * t2, y * t1 - x * t2).scale(1 / (t1 ** 2 + t2 ** 2));
    }, [2, 2]),
    new NonLinearFunction("Fisheye", ({ x, y, r }) => {
        return make2DVec(y, x).scale(2 / (r + 1));
    }),
    new NonLinearFunction("Eyefish", ({x, y, r}) => {
        return make2DVec(x, y).scale(2 / (r + 1));
    }),
    new NonLinearFunction("Power", ({ r, theta }) => {
        return make2DVec(Math.cos(theta), Math.sin(theta)).scale(Math.pow(r, Math.sin(theta)));
    }),
    new NonLinearFunction("Cosine2", ({ x, y }) => {
        return make2DVec(Math.cos(Math.PI * x) * Math.cosh(y), -Math.sin(Math.PI * x) * Math.sinh(y));
    }),
    new NonLinearFunction("Rings", params => ({ r, theta }) => {
        return make2DVec(Math.cos(theta), Math.sin(theta)).scale(
            mod(r + params[0] ** 2, 2 * params[0] ** 2) -
            params[0] ** 2 + r * (1 - params[0] ** 2)
        );
    }, [2]),
    new NonLinearFunction("Fan", params => ({r, theta}) => {
        const t = Math.PI * params[0] ** 2;
        if (mod(theta + params[1], t) > t/2){
            return make2DVec(Math.cos(theta - t/2), Math.sin(theta - t/2)).scale(r);
        }
        return make2DVec(Math.cos(theta + t/2), Math.sin(theta + t/2)).scale(r); 
    }, [2, 2]),
    new NonLinearFunction("Blob", params => ({r, theta}) => {
        return make2DVec(Math.cos(theta), Math.sin(theta)).scale(r * (params[1] + (params[0] - params[1])/2 * (Math.sin(params[2] * theta) + 1)));
    }, [2, 2, 2]),
    new NonLinearFunction("PDJ", params => ({x, y}) => {
        return make2DVec(Math.sin(params[0] * y) - Math.cos(params[1] * x), Math.sin(params[2] * x) - Math.cos(params[3] * y));
    }, [2, 2, 2, 2]),
    new NonLinearFunction("Bubble", ({x, y, r}) => {
        return make2DVec(x, y).scale(4/(r ** 2 + 4)); 
    }),
    new NonLinearFunction("Cylinder", ({x, y}) => {
        return make2DVec(Math.sin(x), y);
    }),
    new NonLinearFunction("Perspective", params => ({x, y}) => {
        return make2DVec(x, y * Math.cos(params[0])).scale(params[1]/(params[1] - y * Math.sin(params[0])));
    }, [Math.PI/2, 2]),
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
