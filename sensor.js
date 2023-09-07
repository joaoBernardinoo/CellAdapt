class Sensor {
    constructor({ cell = undefined, rayCount = 10, rayLength = 128 }) {
        this.cell = cell;
        if (cell instanceof Prey) {
            this.rayCount = 9;
            this.rayLength = 150;
            this.raySpread = 4
        } else {
            this.rayCount = 6;
            this.rayLength = 110;
            this.raySpread = Math.PI / 3;
        }
        this.colors = new Array(this.rayCount).fill(0);
        this.rays = [];
        this.readings = [];
    }



    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                - this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.cell.pa;
            const start = { x: this.cell.x, y: this.cell.y }
            const end = {
                x: this.cell.x +
                    Math.cos(rayAngle) * this.rayLength,
                y: this.cell.y +
                    Math.sin(rayAngle) * this.rayLength
            };
            this.rays.push([start, end]);
        }
    }

    #getReading(ray, nearCells) {
        const collisions = [];
        for (const cell of nearCells) {
            if (cell === this.cell) continue;
            let intersections = circleLineCollision(cell, ray);
            if (intersections.length > 0) {
                collisions.push(...intersections);

            }
        }
        if (collisions.length === 0)
            return null;
        const offsets = collisions.map(c => c.offset);
        const closest = Math.min(...offsets);
        const closestCell = collisions.find(e => e.offset == closest)
        return closestCell;
    }


    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            let color = "aqua";
            ctx.beginPath();
            //let end = this.readings[i];
            let end = this.rays[i][1];

            if (this.readings[i]) {
                end = this.readings[i];
                color = "red"
            }
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = color;
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

        }
    }

    update(nearCells) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rayCount; i++) {
            this.readings.push(this.#getReading(this.rays[i], nearCells));
        }
    }
}