// In the data: Hand, Elbow, Shoulder

let logicUp = 0
let logicDown = 0

export async function testLogic() {
    console.log("Start testLogic")
    try {
        // Get the data that is being tested on
        const response = await fetch('src/testData.json');
        const data = await response.json();

        for (const point of data) {
            if (point.pose[2] < point.pose[0]) {
                logicUp++
            }

            if (point.pose[2] > point.pose[1]) {
                logicDown++
            }
        }
        console.log("Logic Up", logicUp)
        console.log("Logic Down", logicDown)

    } catch (error) {
        console.error(error)
    }
}

// function testKNN() {
//
// }
//
// function testNN() {
//
// }