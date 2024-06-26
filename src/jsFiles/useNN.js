// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({task: 'classification', debug: true})

// Load the model
const modelDetails = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin'
}

nn.load(modelDetails, () => console.log("NN Model has been loaded"))

// Use the NN model
export async function useNN(shoulderY, elbowY, handY) {
    const result = await nn.classify([shoulderY, elbowY, handY])
    return (result[0].label)
}
