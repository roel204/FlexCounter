// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({task: 'classification', debug: true})

// Data that is being trained on
const response = await fetch('src/data.json');
const data = await response.json();

for (const point of data) {
    nn.addData(point.pose, {label: point.label})
}

// Start the training process
export function startTraining() {
    nn.normalizeData()
    nn.train({epochs: 100}, () => finishedTraining())
}

// Test the model after training
async function finishedTraining() {
    const results = await nn.classify([0.3021, 0.5212, 0.5322])
    console.log(results)
}

// Export the trained model
export async function saveModel() {
    nn.save("model", () => console.log("model was saved!"))
}

