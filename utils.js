function lerp(A, B, percentage) {
    return A + (B - A) * percentage
}

function circleLineCollision(circle, line) {
    const [start, end] = line;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const A = dx * dx + dy * dy;
    const B = 2 * (dx * (start.x - circle.x) +
        dy * (start.y - circle.y));
    const C = (start.x - circle.x) * (start.x - circle.x) +
        (start.y - circle.y) * (start.y - circle.y) - 36;


    const intersections = [];
    const discriminant = B * B - 4 * A * C;

    if (discriminant >= 0) {
        const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
        const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

        if (t1 >= 0 && t1 <= 1) {
            const intersectionX1 = start.x + dx * t1;
            const intersectionY1 = start.y + dy * t1;
            intersections.push({ cell: circle, x: intersectionX1, y: intersectionY1, offset: t1 });
        }

        if (t2 >= 0 && t2 <= 1) {
            const intersectionX2 = start.x + dx * t2;
            const intersectionY2 = start.y + dy * t2;
            intersections.push({ cell: circle, x: intersectionX2, y: intersectionY2, offset: t2 });
        }
    }

    return intersections;
}

function circleCircleCollision(circle1, circle2) {
    const distance = Math.sqrt(
        (circle1.x - circle2.x) * (circle1.x - circle2.x) +
        (circle1.y - circle2.y) * (circle1.y - circle2.y)
    );
    return distance < circle1.radius + circle2.radius;
}

function calculateFPS() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    if (elapsedTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsedTime);
        framerateP.textContent =   fps + " FPS  -   Indivíduos:" + cells.length;

        // Reiniciar as variáveis para o próximo cálculo
        frameCount = 0;
        startTime = currentTime;
    }

    frameCount++;
    requestAnimationFrame(calculateFPS)
}

function debugView(ctx) {
    const nearbyCells = quadTree.queryCircle(new Circle(mouseX, mouseY, 128));
    nearbyCells.forEach(c => c.color = "green")
    setTimeout(() => { nearbyCells.forEach(c => c.color = "red") }, 1000)
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 128, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    ctx.beginPath();
}

function createPrey({
    x = Math.random() * gameCanvas.clientWidth,
    y = Math.random() * gameCanvas.clientHeight,
    brain = undefined }) {

    if (preyCount > 640) return;
    preyCount++;
    const cell = new Prey(
        x,
        y,
        undefined,
        brain,
        true
    );
    cells.push(cell);
    return cell;
}
function createPredator({
    x = Math.random() * gameCanvas.clientWidth,
    y = Math.random() * gameCanvas.clientHeight,
    brain = undefined }) {
    if (predatorCount > 140) return;
    predatorCount++;
    const cell = new Predator(
        x,
        y,
        undefined,
        brain,
        true
    );
    cells.push(cell);
    return cell;
}