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
bindButton(disableAll);
bindButton(randomizeAll);
bindButton(randColors);
bindButton(randMatrices);
bindButton(randWeights);
bindButton(refresh);
bindButton(submitChanges);
window.addEventListener("beforeunload", (event) => {
    event.preventDefault();

});
const reactiveBox = document.getElementById("reactive");
const matrixInput = document.getElementById("randomMatrices");
const matrixWeightInput = document.getElementById("matrixWeight");
matrixWeightInput.addEventListener("change", () => {
    matrixWeight = +matrixWeightInput.value;
    syncWithUI();
})

reactiveBox.addEventListener("change", syncWithUI);
matrixInput.addEventListener("change", () => {
    const matrixCount = +matrixInput.value;
    if (0 <= matrixCount && matrixCount <= 50) {
        randomMatrices = matrixCount;
    }
    syncWithUI()
});
function syncWithUI() {
    if (reactiveBox.checked) {
        submitChanges();
    }
}
const functionList = document.getElementById("functionList");
for (let fn of nonLinearFunctions) {
    functionList.appendChild(fn.createUI());
}
