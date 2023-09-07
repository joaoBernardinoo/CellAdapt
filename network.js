class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new Level({
                inputCount: neuronCounts[i],
                outputCount: neuronCounts[i + 1]
            }));
        }
    }

    feedForwardParallel(givenInputs) {
        const levels = this.levels;

        const results = new Parallel(levels).map(level => {
            return Level.feedForward(givenInputs, level);
        });

        return results[results.length - 1];
    }
    
    
    static mutate(network, mutationRate) {
        network = network.copy();
        for (let i = 0; i < network.levels.length; i++) {
            const level = network.levels[i];
            
            for (let j = 0; j < level.inputs.length; j++) {
                for (let k = 0; k < level.outputs.length; k++) {
                    // Aplicar mutação aos pesos
                    if (Math.random() <= mutationRate) {
                        level.weights[j][k] += (Math.random() * 2 - 1) * mutation; // Exemplo de mutação
                    }
                }
            }

            for (let j = 0; j < level.biases.length; j++) {
                // Aplicar mutação aos vieses
                if (Math.random() < mutationRate) {
                    level.biases[j] += (Math.random() * 2 - 1) * mutation; // Exemplo de mutação
                }
            }
        }
        return network;
    }

    static feedForward({ givenInputs, network }) {
        let outputs = Level.feedForward(
            givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = Level.feedForward(
                outputs, network.levels[i]);
        }
        return outputs;
    }

    copy() {
        const newNetwork = new NeuralNetwork([this.levels[0].inputs.length, ...this.levels.map(l => l.outputs.length)]);
        for (let i = 0; i < this.levels.length; i++) {
            for (let j = 0; j < this.levels[i].inputs.length; j++) {
                for (let k = 0; k < this.levels[i].outputs.length; k++) {
                    newNetwork.levels[i].weights[j][k] = this.levels[i].weights[j][k];
                }
            }
            for (let j = 0; j < this.levels[i].biases.length; j++) {
                newNetwork.levels[i].biases[j] = this.levels[i].biases[j];
                newNetwork.levels[i].outputs[j] = this.levels[i].outputs[j];
                newNetwork.levels[i].inputs[j] = this.levels[i].inputs[j];
            }
        }
        return newNetwork;
    }
}


class Level {
    constructor({ inputCount, outputCount }) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }
        Level.#randomize(this);
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    static #sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    static #tanh(x) {
        return Math.tanh(x);
    }

    static feedForward(givenInputs, level) {
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }
            // Rede Neural utilizando a função sigmoide
            sum += level.biases[i];
            level.outputs[i] = Math.tanh(sum);
            //if (sum > level.biases[i]) {
            //    level.outputs[i] = 1;
            //} else {
            //    level.outputs[i] = 0;
            //}
        }
        return level.outputs;
    }
}