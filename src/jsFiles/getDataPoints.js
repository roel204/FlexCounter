const delay = async (ms) => {
    return new Promise((resolve) =>
        setTimeout(resolve, ms));
};

// Get datapoints in the console
export async function getDataPoints(poseLandmarker) {
    let data = []

    for (let label of ["up", "down", "other"]) {
        await delay(2000)
        for (let i = 0; i < 20; i++) {
            await delay(1000)

            if (poseLandmarker.landmarks[0]) {
                let lShoulder = poseLandmarker.landmarks[0][11];
                let lElbow = poseLandmarker.landmarks[0][13];
                let lHand = poseLandmarker.landmarks[0][19];

                if (lShoulder.visibility > 0.8 && lElbow.visibility > 0.8 && lHand.visibility > 0.8) {
                    data.push({
                        pose: [lShoulder.y, lElbow.y, lHand.y],
                        label: label
                    });
                    console.log("Point logged:", i, label)
                } else {
                    console.log("Points not visible enough! (skipped)")
                }
            }
        }
    }
    // Show the data in the console so it can be copied
    console.log(data)
}