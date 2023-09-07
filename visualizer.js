class Visualizer {
    // WIDTH = NODES.LENGTH * RADIUS * 2 + GAP * (NODES.LENGTH - 1)
    static #getNodeX(nodes, index, totalWidth, left, radius) {
        const gap = nodes.length * radius * 2+1;
        const width = totalWidth - gap;
        const right = left+ totalWidth/2 + gap/2;
        const maxGap = 80;
        return lerp(
            Math.min(left + width / 2, maxGap),
            Math.max(right, maxGap*2),
            nodes.length == 1 ? 0.5 : index / (nodes.length - 1)
        )
    }
    
    static drawNetowrk(ctx, network) {
        const margin = 20;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;

        for (let i = network.levels.length - 1; i >= 1; i--) {
            const levelTop = top +
                lerp(height - levelHeight,
                    0,
                    network.levels.length == 1 ? 0.5
                        : i / (network.levels.length - 1)
                );

            Visualizer.drawLevel(ctx, network.levels[i],
                left, levelTop,
                width, levelHeight,
                false
            );
        }
        const levelTop = top +
            lerp(height - levelHeight,
                0,
                network.levels.length == 1 ? 0.5
                    : 0
            );

        Visualizer.drawLevel(ctx, network.levels[0],
            left, levelTop,
            width, levelHeight,
            true
        );

    }


    static drawLevel(ctx, level, left, top, width, height, first) {
        const { inputs, outputs, weights, biases } = level;
        const right = left + width;
        const inputRadius = 10 - inputs.length / 4;
        const outputRadius = 10 - outputs.length / 4;
        const bottom = top + height;

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(Visualizer.#getNodeX(inputs, i, width, left, inputRadius), bottom);
                ctx.lineTo(Visualizer.#getNodeX(outputs, j, width, left, inputRadius), top);
                ctx.lineWidth = weights[i][j] * 2.5;
                ctx.strokeStyle = inputs[i] * weights[i][j] > 0 ? "#7192b0" : "#eb4960";
                ctx.stroke();
            }
        }

        for (let i = 0; i < outputs.length; i++) {
            const x = Visualizer.#getNodeX(outputs, i, width, left, inputRadius);
            const value = lerp(1, outputRadius, Math.abs(outputs[i]))
            ctx.beginPath();
            ctx.arc(x, top, outputRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#29363c";
            ctx.fill()
            ctx.beginPath();
            ctx.arc(x, top, value, 0, Math.PI * 2);
            ctx.fillStyle = "white"
            ctx.fill();
        }

        if (!first) return;

        for (let i = 0; i < inputs.length; i++) {
            const value = lerp(1, inputRadius - 1, Math.abs(inputs[i]));
            const x = Visualizer.#getNodeX(inputs, i, width, left, inputRadius);

            ctx.beginPath();
            ctx.arc(x, bottom, inputRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#29363c";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, bottom, value, 0, Math.PI * 2);
            ctx.fillStyle = "white"
            ctx.fill();
        }
    }
}