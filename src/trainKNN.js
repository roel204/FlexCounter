const delay = async (ms) => {
    return new Promise((resolve) =>
        setTimeout(resolve, ms));
};

// Train the model
export async function trainKnn(machine) {
    const response = await fetch('src/data.json');
    const data = await response.json();

    for (const point of data) {
        machine.learn(point.pose, point.label);
    }
}

// Get datapoints in the console for when training model
export async function getDataPoints(poseLandmarker) {
    for (let i = 0; i < 5; i++) {
        await delay(3000);

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