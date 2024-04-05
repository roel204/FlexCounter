import kNear from "./knear.js";
import {trainKnn} from "./trainKNN.js";
import {useNN} from "./useNN.js";

let logicUp = 0
let logicDown = 0
let logicOther = 0

let knnUp = 0
let knnDown = 0
let knnOther = 0

let nnUp = 0
let nnDown = 0
let nnOther = 0

export async function testLogic() {
    console.log("Start testLogic")
    logicUp = 0
    logicDown = 0
    logicOther = 0
    try {
        // Get the data that is being tested on
        const response = await fetch('src/testData.json');
        const data = await response.json();

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
        console.log("Logic Accuracy %:",((logicUp + logicDown + logicOther) / 60) * 100)

    } catch (error) {
        console.error(error)
    }
}

export async function testKNN() {
    console.log("Start testKNN")
    knnUp = 0
    knnDown = 0
    knnOther = 0
    try {
        // Get the data that is being tested on
        const response = await fetch('src/testData.json');
        const data = await response.json();

        const machine = new kNear(3);
        await trainKnn(machine);

        for (const point of data) {
            let prediction = machine.classify([point.pose[0], point.pose[1], point.pose[2]])

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
        console.log("KNN Accuracy %:",((knnUp + knnDown + knnOther) / 60) * 100)

    } catch (error) {
        console.error(error)
    }
}

export async function testNN() {
    console.log("Start testNN")
    nnUp = 0
    nnDown = 0
    nnOther = 0
    try {
        // Get the data that is being tested on
        const response = await fetch('src/testData.json');
        const data = await response.json();

        for (const point of data) {
            let res = ""
            // eslint-disable-next-line react-hooks/rules-of-hooks
            await useNN(point.pose[0], point.pose[1], point.pose[2]).then(r => res = r[0].label)


            // I NEED TO CHECK IF THE ANSWER IN THE TEST DATA IS ALSO THE SAME


            if (res === "up" && point.label === "up") {
                nnUp++
            }

            if (res === "down" && point.label === "down") {
                nnDown++
            }

            if (res === "other" && point.label === "other") {
                nnOther++
            }

        }
        console.log("NN Up", nnUp)
        console.log("NN Down", nnDown)
        console.log("NN Other", nnOther)
        console.log("NN Accuracy %:",((nnUp + nnDown + nnOther) / 60) * 100)

    } catch (error) {
        console.error(error)
    }
}
