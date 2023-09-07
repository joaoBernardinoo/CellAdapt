const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext("2d");
const networkCanvas = document.getElementById("network-canvas");
const networkCtx = networkCanvas.getContext("2d");
const zoomCanvas = document.getElementById("zoom-canvas");
const zoomCtx = zoomCanvas.getContext("2d");
const sliderContainer = document.getElementById("slider-container");
const debugDiv = document.getElementById("debug-info");
const rainbowColors = [
    "rgba(255, 0, 0, 1)",     // Red
    "rgba(255, 165, 0, 1)", // Orange
    "rgba(255, 255, 0, 1)", // Yellow
    "rgba(0, 128, 0, 1)",   // Green
    "rgba(0, 0, 255, 1)",   // Blue
    "rgba(75, 0, 130, 1)",  // Indigo
    "rgba(148, 0, 211, 1)", // Violet
    "rgba(255, 192, 203, 1)", // Pink
    "rgba(0, 255, 255, 1)",   // Cyan
    "rgba(0, 255, 0, 1)"      // Lime
];

let frameCount = 0;
let startTime = Date.now();
let optimized = true;
let debug = false;
let cells = [];
let quadTree = undefined;
let lastCell = undefined;
let preyCount = 0;
let predatorCount = 0;
let updateTime = 0;
let mouseX = 0;
let mouseY = 0;
let mutation = 0.08;
function toggleGlobalVariable() {
    optimized = !optimized;
}

//document.addEventListener('mousedown', (e) => {
//    nearbyCells = quadTree.queryCircle(new Circle(e.clientX - gameCanvas.getBoundingClientRect().left, e.clientY - gameCanvas.getBoundingClientRect().top, 128))
//    nearbyCells.forEach(c => c.color = "red")
//    setTimeout(() => { nearbyCells.forEach(c => c.color = "green") }, 1000)
//});

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX - gameCanvas.getBoundingClientRect().left;
    mouseY = e.clientY - gameCanvas.getBoundingClientRect().top;
});

gameCanvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (debug)
            debug = false;
        else
            debug = true;
});

networkCanvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});



let button1 = document.createElement("button");
button1.textContent = "Create Predator";
debugDiv.appendChild(button1);
button1.addEventListener("click", () => {
    createPredator({});
});
let button2 = document.createElement("button");
button2.textContent = "Create Prey";
debugDiv.appendChild(button2);
button2.addEventListener("click", () => {
    createPrey({});
});
let framerateP = document.createElement("p");
debugDiv.appendChild(framerateP);
