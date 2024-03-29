// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({ task: 'classification', debug: true })

nn.addData([18,9.2,8.1,2], {label:"cat"})
nn.addData([20.1,17,15,5.5], {label:"dog"})

export function startTraining() {
    nn.normalizeData()
    nn.train({ epochs: 30 }, () => finishedTraining())
}

async function finishedTraining(){
    const results = await nn.classify([29,11,10,3])
    console.log(results)
}

export async function saveModel() {
    nn.save("model", () => console.log("model was saved!"))
}

