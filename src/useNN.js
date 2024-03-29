// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({task: 'classification', debug: true})

// Load the model
const modelDetails = {
    model: 'public/model/model.json',
    metadata: 'public/model/model_meta.json',
    weights: 'public/model/model.weights.bin'
}

nn.load(modelDetails, () => console.log("NN Model has been loaded"))

// Run the model
export async function useNN(y1, y2, y3) {
    const result = await nn.classify([y1, y2, y3])
    return(result[0].label)
}
