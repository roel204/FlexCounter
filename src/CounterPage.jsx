import { useEffect, useRef, useState } from 'react';
import { DrawingUtils, FilesetResolver, PoseLandmarker, } from '@mediapipe/tasks-vision'
import ScoreComponent from "./components/ScoreComponent.jsx";
import VideoCanvas from "./components/VideoCanvas.jsx";
// import {saveNN, trainNN} from "./jsFiles/trainNN.js";
import { useNN } from "./jsFiles/useNN.js";
// import {getDataPoints} from "./jsFiles/getDataPoints.js";
// import {calcAccuracy} from "./jsFiles/calcAccuracy.js";
import { useKNN } from "./jsFiles/KNN.js";

function CounterPage() {
    const videoElement = useRef(null)
    const canvasElement = useRef(null)
    const enableWebcamButton = useRef(null)
    let canvasCtx = useRef(null)
    let drawingUtils = useRef(null)
    const poseLandmarkerRef = useRef(null)

    let predictionsRunning = false;
    let lastVideoTime = -1;

    let lDown = false
    let rDown = false
    const [lScore, setLScore] = useState(0)
    const [rScore, setRScore] = useState(0)

    const [disableButton, setDisableButton] = useState(true)
    const [activeModel, setActiveModel] = useState("Logic")
    const modelRef = useRef(activeModel)

    // Set the modelRef everytime the activeModel changes
    useEffect(() => {
        modelRef.current = activeModel
    }, [activeModel]);

    // Setup Camera and PoseLandmarker
    useEffect(() => {
        // Setup user camera
        const startApp = () => {
            const hasGetUserMedia = () => {
                let _a;
                return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia);
            };
            if (hasGetUserMedia()) {
                createPoseLandmarker();
            } else {
                console.warn("getUserMedia() is not supported by your browser");
                window.alert("Sorry, this app is not supported by your browser")
            }
        }

        // Create PoseLandmarker
        const createPoseLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
            poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 1,
                min_pose_detection_confidence: 0.8,
                min_pose_presence_confidence: 0.8,
                min_tracking_confidence: 0.8
            })
            setDisableButton(false)
            enableWebcamButton.current.innerText = "Enable Webcam"
        };

        startApp()
    }, []);

    // Enable the live webcam view and start detection or toggle predictions
    const enableCam = () => {

        if (!poseLandmarkerRef.current) {
            window.alert("Wait! poseLandmaker not loaded yet.");
            return;
        }

        if (predictionsRunning === true) {
            predictionsRunning = false;
            enableWebcamButton.current.innerText = "Enable Predictions";
        } else {
            predictionsRunning = true;
            enableWebcamButton.current.innerText = "Disable Predictions";
        }

        // Activate the webcam stream
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {

            // Set the userMedia as the src of the video element & activate predictWebcam once loaded
            videoElement.current.srcObject = stream;
            videoElement.current.addEventListener("loadeddata", predictWebcam);

        }).catch((error) => {
            console.error("Error accessing webcam:", error);
            window.alert("Error accessing webcam.")
        });
    }

    const predictWebcam = async () => {
        let startTimeMs = performance.now();
        canvasCtx = canvasElement.current.getContext("2d");
        drawingUtils = new DrawingUtils(canvasCtx);

        if (lastVideoTime !== videoElement.current.currentTime) {
            lastVideoTime = videoElement.current.currentTime;
            poseLandmarkerRef.current.detectForVideo(videoElement.current, startTimeMs, (result) => {

                // Draw landmarkers in canvas
                const shownPoints = [12, 14, 16, 20, 11, 13, 15, 19];
                canvasCtx.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height);
                for (const landmark of result.landmarks) {
                
                    const filteredConnections = PoseLandmarker.POSE_CONNECTIONS.filter(
                        ({ start, end }) => shownPoints.includes(start) && shownPoints.includes(end)
                    );
                    drawingUtils.drawConnectors(landmark, filteredConnections);

                    const filteredLandmarks = shownPoints.map(index => landmark[index]).filter(Boolean);
                    drawingUtils.drawLandmarks(filteredLandmarks, {
                        color: (data) => data.from.visibility < 0.8 ? 'red' : 'lime'
                    });
                }
                countScore()
            });
        }

        // Call this function again to keep predicting when the browser is ready
        if (predictionsRunning === true) {
            // Activate predictWebcam every frame
            window.requestAnimationFrame(predictWebcam);
        }
    }

    const countScore = async () => {
        let landmarks = poseLandmarkerRef.current.landmarks[0]

        // Code to track and count LEFT arm movement
        if (landmarks && landmarks[11].visibility > 0.8 && landmarks[13].visibility > 0.8 && landmarks[19].visibility > 0.8) {
            let lShoulderY = landmarks[11].y
            let lElbowY = landmarks[13].y
            let lHandY = landmarks[19].y

            if (modelRef.current === "KNN") {
                let prediction = await useKNN(lShoulderY, lElbowY, lHandY)
                // console.log(`KNN Left is ${prediction}`)

                if (prediction === "up") {
                    if (lDown) {
                        setLScore((lScore) => lScore + 1)
                        lDown = false
                    }
                }

                if (prediction === "down") {
                    lDown = true
                }

            } else if (modelRef.current === "NN") {
                let prediction = await useNN(lShoulderY, lElbowY, lHandY)
                // console.log(`NN Left is ${prediction}`)

                if (prediction === "up") {
                    if (lDown) {
                        setLScore((lScore) => lScore + 1)
                        lDown = false
                    }
                }

                if (prediction === "down") {
                    lDown = true
                }

            } else {
                if (lHandY < lShoulderY) {
                    if (lDown) {
                        // console.log("Logic Left is up")
                        setLScore((lScore) => lScore + 1)
                        lDown = false
                    }
                }

                if (lHandY > lElbowY) {
                    // console.log("Logic Left is down")
                    lDown = true
                }
            }
        }

        // Code to track and count RIGHT arm movement
        if (landmarks && landmarks[12].visibility > 0.8 && landmarks[14].visibility > 0.8 && landmarks[20].visibility > 0.8) {
            let rShoulderY = landmarks[12].y
            let rElbowY = landmarks[14].y
            let rHandY = landmarks[20].y

            if (modelRef.current === "KNN") {
                let prediction = await useKNN(rShoulderY, rElbowY, rHandY)
                // console.log(`KNN Right is ${prediction}`)

                if (prediction === "up") {
                    if (rDown) {
                        setRScore((rScore) => rScore + 1)
                        rDown = false
                    }
                }

                if (prediction === "down") {
                    rDown = true
                }

            } else if (modelRef.current === "NN") {
                let prediction = await useNN(rShoulderY, rElbowY, rHandY)
                // console.log(`NN Right is ${nnResRight}`)

                if (prediction === "up") {
                    if (rDown) {
                        setRScore((rScore) => rScore + 1)
                        rDown = false
                    }
                }

                if (prediction === "down") {
                    rDown = true
                }

            } else {
                if (rHandY < rShoulderY) {
                    if (rDown) {
                        // console.log("Logic Right is up")
                        setRScore((rScore) => rScore + 1)
                        rDown = false
                    }
                }

                if (rHandY > rElbowY) {
                    // console.log("Logic Right is down")
                    rDown = true
                }
            }
        }
    }

    // Function to switch the active model
    function switchModel() {
        const models = ["Logic", "KNN"]; // "NN" is removed because it didn't work.
        const currentIndex = models.indexOf(activeModel);
        const nextIndex = (currentIndex + 1) % models.length;
        setActiveModel(models[nextIndex]);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ff8c00] to-[#ffe312] flex flex-col items-center justify-center gap-4 text-white">

            {/*Dev Buttons*/}
            {/*<button className="bg-purple-400 hover:bg-purple-500 rounded p-2 absolute top-2 left-2" onClick={() => {*/}
            {/*    getDataPoints(poseLandmarkerRef.current)*/}
            {/*}}>Get Data*/}
            {/*</button>*/}
            {/*<button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-20 left-2" onClick={trainNN}>Train NN</button>*/}
            {/*<button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-40 left-2" onClick={saveNN}>Save NN</button>*/}
            {/*<button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-60 left-2" onClick={calcAccuracy}>Calc Accuracy</button>*/}

            <h1 className="text-5xl lg:text-7xl font-bold text-center">FLEX COUNTER</h1>

            <ScoreComponent lScore={lScore} rScore={rScore} setLScore={setLScore} setRScore={setRScore} />

            <div className="w-full lg:w-[854px] flex gap-4">
                <button className="text-sm lg:text-base bg-blue-500 hover:bg-blue-600 rounded-lg p-2 w-[29%] transition" disabled={disableButton} onClick={switchModel}>
                    Mode: {activeModel}
                </button>
                <button className="bg-lime-500 hover:bg-lime-600 rounded-lg p-2 w-[70%] transition" disabled={disableButton} ref={enableWebcamButton} onClick={enableCam}>Loading...</button>
            </div>

            <VideoCanvas videoElement={videoElement} canvasElement={canvasElement} />
        </div>
    )

}

export default CounterPage;