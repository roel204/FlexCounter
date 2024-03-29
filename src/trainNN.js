// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({task: 'classification', debug: true})

// Data that is being trained on
nn.addData([18, 9.2, 8.1, 2], {label: "cat"})
nn.addData([20.1, 17, 15, 5.5], {label: "dog"})

// Start the training process
export function startTraining() {
    nn.normalizeData()
    nn.train({epochs: 30}, () => finishedTraining())
}

// Test the model after training
async function finishedTraining() {
    const results = await nn.classify([29, 11, 10, 3])
    console.log(results)
}

// Export the trained model
export async function saveModel() {
    nn.save("model", () => console.log("model was saved!"))
}

