const delay = async (ms) => {
    return new Promise((resolve) =>
        setTimeout(resolve, ms));
};

export function trainKnn(machine) {
    machine.learn([0.29699888825416565, 0.5170987844467163, 0.19376200437545776], 'up')
    machine.learn([0.25645995140075684, 0.5157449245452881, 0.18175971508026123], 'up')
    machine.learn([0.29640400409698486, 0.5498039722442627, 0.23758822679519653], 'up')
    machine.learn([0.29363715648651123, 0.5336388945579529, 0.28399333357810974], 'up')
    machine.learn([0.31886687874794006, 0.46447107195854187, 0.16273164749145508], 'up')

    machine.learn([0.30467694997787476, 0.5444952845573425, 0.7781786918640137], 'down')
    machine.learn([0.31995970010757446, 0.5650004744529724, 0.7957270741462708], 'down')
    machine.learn([0.29677191376686096, 0.5260168313980103, 0.6818185448646545], 'down')
    machine.learn([0.33023908734321594, 0.5576013922691345, 0.68390953540802], 'down')
    machine.learn([0.2913947105407715, 0.551878809928894, 0.6582819223403931], 'down')
    console.log("KNN Trained")
}

export async function getDataPoints(poseLandmarker) {
    for (let i = 0; i < 5; i++) {
        await delay(4000);

        if (poseLandmarker.landmarks[0]) {
            let lShoulder = poseLandmarker.landmarks[0][12]
            let lElbow = poseLandmarker.landmarks[0][14]
            let lHand = poseLandmarker.landmarks[0][20]

            if (lShoulder.visibility > 0.9 && lElbow.visibility > 0.9 && lHand.visibility > 0.9) {
                console.log({pose: [lShoulder.y, lElbow.y, lHand.y], label: "up/down"})
            }
        }
    }
}