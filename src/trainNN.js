// eslint-disable-next-line no-undef
const nn = ml5.neuralNetwork({task: 'classification', debug: true})

// Data that is being trained on

nn.addData([0.29699888825416565, 0.5170987844467163, 0.19376200437545776], {label: "up"})
nn.addData([0.25645995140075684, 0.5157449245452881, 0.18175971508026123], {label: "up"})
nn.addData([0.29640400409698486, 0.5498039722442627, 0.23758822679519653], {label: "up"})
nn.addData([0.29363715648651123, 0.5336388945579529, 0.28399333357810974], {label: "up"})
nn.addData([0.31886687874794006, 0.46447107195854187, 0.16273164749145508], {label: "up"})

nn.addData([0.30467694997787476, 0.5444952845573425, 0.7781786918640137], {label: "down"})
nn.addData([0.31995970010757446, 0.5650004744529724, 0.7957270741462708], {label: "down"})
nn.addData([0.29677191376686096, 0.5260168313980103, 0.6818185448646545], {label: "down"})
nn.addData([0.33023908734321594, 0.5576013922691345, 0.68390953540802], {label: "down"})
nn.addData([0.2913947105407715, 0.551878809928894, 0.6582819223403931], {label: "down"})

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

