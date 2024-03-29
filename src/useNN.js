// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({task: 'classification', debug: true})

// Load the model
const modelDetails = {
    model: 'public/model/model.json',
    metadata: 'public/model/model_meta.json',
    weights: 'public/model/model.weights.bin'
}

nn.load(modelDetails, () => console.log("het model is geladen!"))

// Run a test on the model
export async function testModel() {
    const results = await nn.classify([0.3021, 0.5212, 0.5322])
    console.log(results)
}
