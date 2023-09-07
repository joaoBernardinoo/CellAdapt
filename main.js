let numPreys = 200;
let numPredators = 50;

for (let i = 0; i < numPreys; i++) createPrey({});
for (let i = 0; i < numPredators; i++) createPredator({});


const cell1 = new SuperCell(
    200,//Math.random() * gameCanvas.clientWidth,
    200,//Math.random() * gameCanvas.clientHeight,
);
// cell1.addEventListeners();
//cells.push(cell1);


function updateQuadTree() {
    liveCells = [];
    for (const cell of cells) {
        if (!cell.isAlive) {
            if (cell instanceof Prey) preyCount--;
            if (cell instanceof Predator) predatorCount--;
            continue
        };
        quadTree.insert(cell);
        liveCells.push(cell);
    }
    cells = liveCells;
}
function updateCells(liveCells) {

    liveCells.forEach(cell => {
        const nearbyCells = optimized ?
            quadTree.queryCircle(new Circle(cell.x, cell.y, 128)) :
            liveCells;

        cell.update(ctx, nearbyCells, liveCells);
    });
};
function zoomSensor(sensor) {
    for (let i = 0; i < sensor.rayCount; i++) {
        let color = "aqua";
        zoomCtx.beginPath();
        let end = sensor.rays[i][1];

        if (sensor.readings[i]) {
            end = sensor.readings[i];
            color = "red"
        }
        zoomCtx.lineWidth = 0.5;
        zoomCtx.strokeStyle = color;
        zoomCtx.moveTo(
            0, 0
        );
        zoomCtx.lineTo(
            end.x - sensor.x * zoomLevel,
            end.y - sensor.y * zoomLevel
        );
        zoomCtx.stroke();

    }
}
function animate() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);

    quadTree = new Quadtree(new Rectangle(0, 0, gameCanvas.clientWidth, gameCanvas.clientHeight), 4);

    updateQuadTree();

    let start = Date.now();
    updateCells(cells);
    updateTime = Date.now() - start;

    const ages = cells.filter(c => c.age < -200).map(c => c.age);
    const oldest = Math.max(...ages);
    const BestCell = cells.find(c => c.age == oldest);
    if (BestCell) {
        Visualizer.drawNetowrk(networkCtx, BestCell.brain);
        const centerX = (BestCell.x)  * zoomLevel;
        const centerY = (BestCell.y) * zoomLevel;
        zoomCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
        const halfWidth = zoomCanvas.width / 2;
        const halfHeight = zoomCanvas.height / 2;
        const offsetX = halfWidth - centerX;
        const offsetY = halfHeight - centerY;
        const rayX = BestCell.sensor.rays[0][1].x;
        const rayY = BestCell.sensor.rays[0][1].y;
        const endX = rayX - centerX;
        const endY = rayY - centerY;
        zoomCtx.save();
        zoomCtx.translate(offsetX, offsetY);
        BestCell.color = "orange";
        for (let i = 0; i < BestCell.sensor.rays.length; i++) {
            const sensor = BestCell.sensor.rays[i];
            let color = "aqua";
            let end = {x: sensor[1].x,
                y: sensor[1].y};
            const startX = (sensor[0].x - gameCanvas.width/2) * zoomLevel;
            const startY = (sensor[0].y - gameCanvas.height/2) * zoomLevel;

            if (BestCell.sensor.readings[i]) {
                end = BestCell.sensor.readings[i];
                color = "red"
            }
            const endX = ( end.x - gameCanvas.width/2) * zoomLevel;
            const endY = ( end.y -gameCanvas.height/2) * zoomLevel;
            const diffX = endX - startX;
            const diffY = endY - startY;

            zoomCtx.strokeStyle = color;
            zoomCtx.beginPath();
            zoomCtx.moveTo(centerX, centerY);
            zoomCtx.lineTo(centerX + diffX, centerY + diffY);
            zoomCtx.stroke();
        }
        zoomCtx.drawImage(gameCanvas, 0, 0, gameCanvas.width * zoomLevel, gameCanvas.height * zoomLevel);
        zoomCtx.restore();

    }

}

// setInterval(parallelTest, 1000)

calculateFPS()
setInterval(animate, 25)


let zoomLevel = 1.1; // Nível de zoom inicial (50%)

// Desenhe o conteúdo do game-canvas no zoom-canvas com zoom
function drawZoomedCanvas() {
}

// Evento de roda do mouse para ajustar o zoom
zoomCanvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (event.deltaY > 0) {
        zoomLevel -= 0.1; // Reduza o zoom em 10% quando rolar para baixo
    } else {
        zoomLevel += 0.1; // Aumente o zoom em 10% quando rolar para cima
    }
});

