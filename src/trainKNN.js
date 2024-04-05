// Train KNN model
export async function trainKnn(machine) {
    const response = await fetch('src/trainData.json');
    const data = await response.json();

    for (const point of data) {
        machine.learn(point.pose, point.label);
    }
}