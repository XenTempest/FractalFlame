const toggleMenu = document.getElementById("toggleMenu");
const menu = document.getElementById("menu");
toggleMenu.addEventListener("click", () => { menu.classList.toggle("hidden"); });
function bindButton(f) {
    const button = document.getElementById(f.name);
    button.addEventListener("click", f);
}
function randomizeAll() {
    randColors();
    randMatrices();
    randWeights();
}
bindButton(randomizeAll);
bindButton(randColors);
bindButton(randMatrices);
bindButton(randWeights);
bindButton(refresh);
bindButton(submitChanges);
const reactiveBox = document.getElementById("reactive");
const matrixInput = document.getElementById("randomMatrices");
reactiveBox.addEventListener("change", syncWithUI);
matrixInput.addEventListener("change", syncWithUI);
function syncWithUI() {
    const matrixCount = +matrixInput.value;
    if (0 <= matrixCount && matrixCount <= 50) {
        randomMatrices = matrixCount;
    }
    if (reactiveBox.checked) {
        submitChanges();
    }
}
const functionList = document.getElementById("functionList");
for (let fn of nonLinearFunctions) {
    functionList.appendChild(fn.createUI());
}
