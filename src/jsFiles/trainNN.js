// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({
    task: 'classification',
    debug: true,
    // Create multiple layers
    layers: [
        {
            type: 'dense',
            units: 32,
            activation: 'relu',
        },
        {
            type: 'dense',
            units: 32,
            activation: 'relu',
        },
        {
            type: 'dense',
            units: 32,
            activation: 'relu',
        },
        {
            type: 'dense',
            activation: 'softmax',
        },
    ]
})

// Start the training process
export async function trainNN() {
    // Try-catch to use await
    try {
        // Get the data that is being trained on
        const response = await fetch('data/trainData.json');
        const data = await response.json();

        // Check if data is loaded successfully
        if (!data) {
            console.error('Failed to load training data');
        }

        // Add each data point from the json file
        for (const point of data) {
            nn.addData(point.pose, {label: point.label});
        }

        // Start the training
        nn.normalizeData();
        nn.train({
            epochs: 250,
            learningRate: 0.2,
            hiddenUnits: 20,
        }, () => finishedTraining());
    } catch (error) {
        console.error('Error during training:', error);
    }
}


// Test the model after training
async function finishedTraining() {
    const results = await nn.classify([
        0.316304267379313,
        0.512323494062887,
        0.711716295837412])
    console.log(results)
}

// Export the trained model
export async function saveNN() {
    nn.save("model", () => console.log("model was saved!"))
}

