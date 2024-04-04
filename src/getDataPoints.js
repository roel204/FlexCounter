let data = []

const delay = async (ms) => {
    return new Promise((resolve) =>
        setTimeout(resolve, ms));
};

// Get datapoints in the console for when training model
export async function getDataPoints(poseLandmarker) {
    data = []

    for (let label of ["up", "down", "other"]) {
        for (let i = 0; i < 2; i++) {
            await delay(2000)

            if (poseLandmarker.landmarks[0]) {
                let lShoulder = poseLandmarker.landmarks[0][12];
                let lElbow = poseLandmarker.landmarks[0][14];
                let lHand = poseLandmarker.landmarks[0][20];

                if (lShoulder.visibility > 0.8 && lElbow.visibility > 0.8 && lHand.visibility > 0.8) {
                    data.push({
                        pose: [lShoulder.y, lElbow.y, lHand.y],
                        label: label
                    });
                    console.log("Point logged:", i, label)
                } else {
                    console.log("Points not visible enough!")
                }
            }
        }
    }
    // Save the data
    console.log(data)
}