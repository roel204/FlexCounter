import kNear from "./knear.js";

const machine = new kNear(3);

// Train the KNN model
async function trainKNN() {
    try {
        const response = await fetch('data/trainData.json');
        const data = await response.json();

        for (const point of data) {
            machine.learn(point.pose, point.label);
        }
        console.log("KNN has been trained")
    } catch (error) {
        console.error(error)
    }
}
trainKNN()


// Use the KNN model
export async function useKNN(shoulderY, elbowY, handY) {
    const result = await machine.classify([shoulderY, elbowY, handY])
    return (result)
}

