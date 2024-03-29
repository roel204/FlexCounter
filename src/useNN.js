// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({ task: 'classification', debug: true })

const modelDetails = {
    model: 'public/model/model.json',
    metadata: 'public/model/model_meta.json',
    weights: 'public/model/model.weights.bin'
}

nn.load(modelDetails, () => console.log("het model is geladen!"))

export async function testModel() {
    const results = await nn.classify([29,11,10,3])
    console.log(results)
}
