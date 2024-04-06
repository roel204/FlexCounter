import {useKNN} from "./KNN.js";
import {useNN} from "./useNN.js";

export function calcAccuracy() {
    testLogic()
    testKNN()
    testNN()
}

async function testLogic() {
    let logicUp = 0
    let logicDown = 0
    let logicOther = 0
    try {
        // Get the data that is being tested on
        const response = await fetch('data/testData.json');
        const data = await response.json();

        // Use the logic calculation on each test datapoint
        for (const point of data) {
            if (point.pose[2] < point.pose[0] && point.label === "up") {
                logicUp++
            }

            if (point.pose[2] > point.pose[1] && point.label === "down") {
                logicDown++
            }

            if (point.pose[2] > point.pose[0] && point.pose[2] < point.pose[1] && point.label === "other") {
                logicOther++
            }
        }
        console.log("Logic Up", logicUp)
        console.log("Logic Down", logicDown)
        console.log("Logic Other", logicOther)
        console.log("Logic Accuracy %:", ((logicUp + logicDown + logicOther) / 60) * 100)

    } catch (error) {
        console.error(error)
    }
}

async function testKNN() {
    let knnUp = 0
    let knnDown = 0
    let knnOther = 0
    try {
        // Get the data that is being tested on
        const response = await fetch('data/testData.json');
        const data = await response.json();

        // Use the KNN model on each test datapoint
        for (const point of data) {
            let prediction = await useKNN(point.pose[0], point.pose[1], point.pose[2])

            if (prediction === "up" && point.label === "up") {
                knnUp++
            }

            if (prediction === "down" && point.label === "down") {
                knnDown++
            }

            if (prediction === "other" && point.label === "other") {
                knnOther++
            }

        }
        console.log("KNN Up", knnUp)
        console.log("KNN Down", knnDown)
        console.log("KNN Other", knnOther)
        console.log("KNN Accuracy %:", ((knnUp + knnDown + knnOther) / 60) * 100)

    } catch (error) {
        console.error(error)
    }
}

async function testNN() {
    let nnUp = 0
    let nnDown = 0
    let nnOther = 0
    try {
        // Get the data that is being tested on
        const response = await fetch('data/testData.json');
        const data = await response.json();

        // Use the NN model on each test datapoint
        for (const point of data) {
            let prediction = await useNN(point.pose[0], point.pose[1], point.pose[2])

            if (prediction === "up" && point.label === "up") {
                nnUp++
            }

            if (prediction === "down" && point.label === "down") {
                nnDown++
            }

            if (prediction === "other" && point.label === "other") {
                nnOther++
            }

        }
        console.log("NN Up", nnUp)
        console.log("NN Down", nnDown)
        console.log("NN Other", nnOther)
        console.log("NN Accuracy %:", ((nnUp + nnDown + nnOther) / 60) * 100)

    } catch (error) {
        console.error(error)
    }
}
