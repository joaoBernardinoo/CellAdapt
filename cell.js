const MAX_REPRODUCTION_AGE = 500;

class Cell {
    type = "Cell";

    constructor(x, y, color, brain, alive = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.pa = Math.random();
        this.speed = 0;
        this.age = 0;
        this.isAlive = true;
        this.feeded = 0;
        this.radius = 5;
        this.counter = 0;
        this.sensor = new Sensor({ cell: this })
        if (brain) {
            this.brain = brain;
        } else if (alive) {
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount*2,4, 2]);
        }
    }

    #feedForward(inputs) {
        const outputs = NeuralNetwork.feedForward({
            givenInputs: inputs,
            network: this.brain
        });
        return outputs;
    }
    update(ctx, nearCells) {

        if (this.age % 3 == 0) {
            this.sensor.update(nearCells)
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const types = this.sensor.readings.map(
                s => s == null ? 0 : s.cell.color == this.color ? 1 : -1
            );
            const inputs = [...offsets, ...types];
            const outputs = this.#feedForward(inputs)
            this.pa += (outputs[0]) / 4;
            this.speed = outputs[1] * 2;
        }
        this.move()
        this.age++;
        return;
    }

    move() {
        let newX = Math.round(this.x + Math.cos(this.pa) * this.speed);
        let newY = Math.round(this.y + Math.sin(this.pa) * this.speed);

        // Obtém as dimensões da arena
        const arenaWidth = gameCanvas.clientWidth;
        const arenaHeight = gameCanvas.clientHeight;

        //Verifica se a célula atravessou as paredes da arena
        if (newX < 10) {
            newX = arenaWidth-20; // Volta para o lado oposto da largura da arena
        } else if (newX > arenaWidth - 10) {
            newX = 20; // Volta para o lado oposto da largura da arena
        }

        if (newY < 10) {
            newY = arenaHeight-20; // Volta para o lado oposto da altura da arena
        } else if (newY > arenaHeight - 10) {
            newY = 20; // Volta para o lado oposto da altura da arena
        }

        // Define as novas coordenadas
        this.x = newX;
        this.y = newY;
    }


    draw(ctx) {
        //this.sensor.draw(ctx);
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 6.28, false);
        ctx.lineTo(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.fill();
        const irisRadius = this.radius * 0.3; // Tamanho da íris em relação ao tamanho da célula
        const irisDistance = this.radius * 0.5;
        const iris1X = this.x + (irisDistance * Math.cos(this.pa - 1));
        const iris1Y = this.y + (irisDistance * Math.sin(this.pa - 1));
        const iris2X = this.x + (irisDistance * Math.cos(this.pa + 1));
        const iris2Y = this.y + (irisDistance * Math.sin(this.pa + 1));


        // Desenhe a íris
        ctx.beginPath();
        ctx.arc(iris1X, iris1Y, irisRadius, 0, 6.28, false);
        ctx.arc(iris2X, iris2Y, irisRadius, 0, 6.28, false);
        ctx.fillStyle = "white"; // Cor da íris
        ctx.fill();
    }
}

class Predator extends Cell {
    type = "Cell";
    constructor(x, y, brain) {
        super(x, y, "#eb4960", brain, true);
        this.age = -50;
    }

    #reproduce() {
        if (this.feeded >= 2 && this.age >= 75) {
            const babyCell = createPredator({
                x: this.x + 1, // Mesma posição X
                y: this.y + 1, // Mesma posição Y
                brain: NeuralNetwork.mutate(this.brain.copy(), 1)
            });
            this.feeded = 0;
            this.age = Math.max(0, this.age - 100);
        }
    }
    #detectCollision(nearbyCells) {
        for (const nearbyCell of nearbyCells) {
            if (
                circleCircleCollision(this, nearbyCell) &&
                this.type == "Cell" && (nearbyCell instanceof Prey || nearbyCell instanceof SuperCell) && this.feeded < 4) {
                nearbyCell.isAlive = false;
                this.feeded++;
                return true;
            }
        }
        return false;
    }
    update(ctx, nearCells, liveCells) {
        if (this.age > 250) {
            this.isAlive = false;
            return;
        }
        super.update(ctx, nearCells);
        this.#detectCollision(nearCells);
        this.#reproduce(liveCells);
        this.draw(ctx);
    }
}
class Prey extends Cell {
    type = "Cell";
    constructor(x, y, brain) {
        super(x, y, "#9ab999", brain, true);
        this.age = -10000;

    }
    #reproduce() {
        if (this.age % 100 == 0) {
            const babyCell = createPrey({
                x: this.x + 1, // Mesma posição X
                y: this.y + 1, // Mesma posição Y
                brain: NeuralNetwork.mutate(this.brain.copy(), 1)
            });
        }
    }

    #detectCollision(nearbyCells) {
        for (const nearbyCell of nearbyCells) {
            if (nearbyCell instanceof Prey &&
                circleCircleCollision(this, nearbyCell) &&
                this != nearbyCell) {

                const angle = Math.atan2(this.y - nearbyCell.y, this.x - nearbyCell.x);
                const distX = Math.abs(this.x - nearbyCell.x);
                const distY = Math.abs(this.y - nearbyCell.y);
                const forceX = Math.min(1 / distX, 3);
                const forceY = Math.min(1 / distY, 3);

                this.x += Math.cos(angle) * forceX;
                this.y += Math.sin(angle) * forceY;
                nearbyCell.x -= Math.cos(angle) * forceX;
                nearbyCell.y -= Math.sin(angle) * forceY;

                return true;
            }
        }
        return false;
    }

    update(ctx, nearCells, liveCells) {
        super.update(ctx, nearCells);
        this.#detectCollision(nearCells);
        this.#reproduce(liveCells);
        this.draw(ctx);
    }
}
class SuperCell extends Cell {
    type = "SuperCell";
    constructor(x, y) {
        super(x, y, "yellow");
    }


    update(ctx, nearCells) {
        this.sensor.update(nearCells)
        this.draw(ctx);
    }
    addEventListeners() {
        document.onkeydown = (e) => {
            animate();
            switch (e.key) {
                case "ArrowUp":
                    this.y -= 10;
                    break;
                case "ArrowDown":
                    this.y += 10;
                    break;
                case "ArrowLeft":
                    this.x -= 10;
                    break;
                case "ArrowRight":
                    this.x += 10;
                    break;
            }
        };
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX - gameCanvas.getBoundingClientRect().left;
            mouseY = e.clientY - gameCanvas.getBoundingClientRect().top;
            const angle = Math.atan2(mouseY - this.y, mouseX - this.x);
            this.pa = angle;

        });
        document.addEventListener('mousedown', (e) => {
            this.x = e.clientX - gameCanvas.getBoundingClientRect().left;
            this.y = e.clientY - gameCanvas.getBoundingClientRect().top;

        });
    }

    draw(ctx) {
        this.sensor.draw(ctx);
        ctx.beginPath()
        ctx.arc(this.x, this.y, 8, 0, 6.28, false);
        ctx.lineTo(this.x, this.y);
        ctx.fillStyle = this.color;
        ctx.fill();

    }
}