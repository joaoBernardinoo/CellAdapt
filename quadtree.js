class Quadtree {
    constructor(bounds, capacity, depth = 0, name = "") {
        this.bounds = bounds;
        this.capacity = capacity; // Capacidade máxima de elementos em um nó
        this.depth = depth; // Altura do nó na árvore
        this.points = []; // Array para armazenar pontos em um nó
        this.divided = false; // Indica se o nó foi dividido em subnós
        this.name = name;

        this.northwest = null;
        this.northeast = null;
        this.southwest = null;
        this.southeast = null;
    }

    insert(point) {
        if (!this.bounds.contains(point)) {
            return false;
        }
        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }
        if (!this.divided) {
            this.subdivide();
        }
        if (this.northwest.insert(point)) return true;
        if (this.northeast.insert(point)) return true;
        if (this.southwest.insert(point)) return true;
        if (this.southeast.insert(point)) return true;

        this.points.push(point);
        return true;
    }

    subdivide() {
        const { x, y, width, height } = this.bounds;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const nwBounds = new Rectangle(x, y, halfWidth, halfHeight);
        const neBounds = new Rectangle(x + halfWidth, y, halfWidth, halfHeight);
        const swBounds = new Rectangle(x, y + halfHeight, halfWidth, halfHeight);
        const seBounds = new Rectangle(x + halfWidth, y + halfHeight, halfWidth, halfHeight);

        this.northwest = new Quadtree(nwBounds, this.capacity, this.depth + 1, this.name + "nw");
        this.northeast = new Quadtree(neBounds, this.capacity, this.depth + 1, this.name + "ne");
        this.southwest = new Quadtree(swBounds, this.capacity, this.depth + 1, this.name + "sw");
        this.southeast = new Quadtree(seBounds, this.capacity, this.depth + 1, this.name + "se");

        this.divided = true;
    }

    queryCircle(circle, found = []) {
        if (!circle.intersects(this.bounds)) {
            return found;
        }
        for (const point of this.points) {
            
            if (circle.contains(point)) {
                found.push(point);
            }
        }

        if (this.divided) {
            this.northwest.queryCircle(circle, found);
            this.northeast.queryCircle(circle, found);
            this.southwest.queryCircle(circle, found);
            this.southeast.queryCircle(circle, found);
        }

        return found;
    }


    static update() {
        const liveCells = [];
        const quadTree = new Quadtree(new Rectangle(0, 0, gameCanvas.clientWidth, gameCanvas.clientHeight), 1);

        for (const c of cells) {
            liveCells.push(c);
            quadTree.insert(c);
        }
        return quadTree, liveCells;
    }

    static draw(ctx, quadtree) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1/quadtree.depth;
        ctx.strokeRect(quadtree.bounds.x, quadtree.bounds.y, quadtree.bounds.width, quadtree.bounds.height);
        if (quadtree.divided) {
            Quadtree.draw(ctx, quadtree.northwest);
            Quadtree.draw(ctx, quadtree.northeast);
            Quadtree.draw(ctx, quadtree.southwest);
            Quadtree.draw(ctx, quadtree.southeast);
        }
    }

}
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(point) {
        return (
            point.x >= this.x &&
            point.x <= this.x + this.width &&
            point.y >= this.y &&
            point.y <= this.y + this.height
        );
    }

    intersects(range) {
        return !(
            range.x + range.width < this.x ||
            range.x > this.x + this.width ||
            range.y + range.height < this.y ||
            range.y > this.y + this.height
        );
    }
}

class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    contains(point) {
        const distanceSquared = (point.x - this.x) ** 2 + (point.y - this.y) ** 2;
        return distanceSquared <= this.radius ** 2;
    }

    intersects(range) {
        // Verifica se o círculo intersecta com o retângulo (range)
        const closestX = clamp(this.x, range.x, range.x + range.width);
        const closestY = clamp(this.y, range.y, range.y + range.height);

        const distanceSquared = (this.x - closestX) ** 2 + (this.y - closestY) ** 2;

        return distanceSquared <= this.radius ** 2;
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}