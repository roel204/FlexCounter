import {useEffect, useRef, useState} from 'react';
import {DrawingUtils, FilesetResolver, PoseLandmarker,} from '@mediapipe/tasks-vision'
import ScoreComponent from "./ScoreComponent.jsx";
import trainKnn, {getDataPoints} from "./knn.js";
import kNear from "./knear.js";

function CounterPage() {
    const videoElement = useRef(null)
    const canvasElement = useRef(null)
    const enableWebcamButton = useRef(null)
    let canvasCtx = useRef(null)
    let drawingUtils = useRef(null)
    const landmarkerRef = useRef(null)

    let predictionsRunning = false;
    let lastVideoTime = -1;
    const videoHeight = "480px";
    const videoWidth = "854px";
    // const videoHeight = "720px";
    // const videoWidth = "1280px";

    let lDown = false
    let rDown = false
    const [lScore, setLScore] = useState(0)
    const [rScore, setRScore] = useState(0)

    const [disableButton, setDisableButton] = useState(true)
    const [activeModel, setActiveModel] = useState("Logic")
    const modelRef = useRef(activeModel)

    useEffect(() => {
        modelRef.current = activeModel
    }, [activeModel]);

    const machineRef = useRef(null);

    useEffect(() => {
        if (!machineRef.current) {
            machineRef.current = new kNear(3);
            trainKnn(machineRef.current);
        }
    }, []);

    useEffect(() => {
        // Setup user camera
        function startApp() {
            const hasGetUserMedia = () => {
                let _a;
                return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia);
            };
            if (hasGetUserMedia()) {
                createPoseLandmarker();
            } else {
                console.warn("getUserMedia() is not supported by your browser");
            }
        }

        // Create PoseLandmarker
        const createPoseLandmarker = async () => {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
            landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numPoses: 2
            })
            setDisableButton(false)
            enableWebcamButton.current.innerText = "Enable Webcam"
        };

        startApp()
    }, []);


    // Enable the live webcam view and start detection
    function enableCam() {
        console.log("start the webcam")

        if (!landmarkerRef.current) {
            console.log("Wait! poseLandmaker not loaded yet.");
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
        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
            videoElement.current.srcObject = stream;
            videoElement.current.addEventListener("loadeddata", predictWebcam);

            canvasElement.current.style.height = videoHeight;
            videoElement.current.style.height = videoHeight;
            canvasElement.current.style.width = videoWidth;
            videoElement.current.style.width = videoWidth;
        }).catch((error) => {
            console.error("Error accessing webcam:", error);
        });
    }

    async function predictWebcam() {
        let startTimeMs = performance.now();
        canvasCtx = canvasElement.current.getContext("2d");
        drawingUtils = new DrawingUtils(canvasCtx);

        if (lastVideoTime !== videoElement.current.currentTime) {
            lastVideoTime = videoElement.current.currentTime;
            landmarkerRef.current.detectForVideo(videoElement.current, startTimeMs, (result) => {

                canvasCtx.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height);
                for (const landmark of result.landmarks) {
                    drawingUtils.drawLandmarks(landmark, {radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)});
                    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                }
            });
        }

        // Call this function again to keep predicting when the browser is ready
        if (predictionsRunning === true) {
            window.requestAnimationFrame(predictWebcam);

            // Code to track and count arm movement
            if (landmarkerRef.current.landmarks[0] && landmarkerRef.current.landmarks[0][12].visibility > 0.9 && landmarkerRef.current.landmarks[0][14].visibility > 0.9 && landmarkerRef.current.landmarks[0][20].visibility > 0.9) {
                let lShoulderY = landmarkerRef.current.landmarks[0][12].y
                let lElbowY = landmarkerRef.current.landmarks[0][14].y
                let lHandY = landmarkerRef.current.landmarks[0][20].y

                if (modelRef.current === "KNN") {
                    let prediction = machineRef.current.classify([lShoulderY, lElbowY, lHandY])
                    console.log(`Left is ${prediction}`)

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
                            setLScore((lScore) => lScore + 1)
                            lDown = false
                        }
                    }

                    if (lHandY > lElbowY) {
                        lDown = true
                    }
                }
            }

            if (landmarkerRef.current.landmarks[0] && landmarkerRef.current.landmarks[0][11].visibility > 0.9 && landmarkerRef.current.landmarks[0][13].visibility > 0.9 && landmarkerRef.current.landmarks[0][19].visibility > 0.9) {
                let rShoulderY = landmarkerRef.current.landmarks[0][11].y
                let rElbowY = landmarkerRef.current.landmarks[0][13].y
                let rHandY = landmarkerRef.current.landmarks[0][19].y

                if (modelRef.current === "KNN") {
                    let prediction = machineRef.current.classify([rShoulderY, rElbowY, rHandY])
                    console.log(`Right is ${prediction}`)

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
                            setRScore((rScore) => rScore + 1)
                            rDown = false
                        }
                    }

                    if (rHandY > rElbowY) {
                        rDown = true
                    }
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ff8c00] to-[#ffe312] flex flex-col items-center justify-center gap-4 text-white">
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-2 left-2" onClick={() => {
                getDataPoints(landmarkerRef.current)
            }}>Train Data
            </button>
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-2 left-40" onClick={() => {
                setLScore((lScore) => lScore + 1)
            }}>Test Points
            </button>

            <h1 className="text-7xl font-bold">FLEX COUNTER</h1>

            <ScoreComponent lScore={lScore} rScore={rScore} setLScore={setLScore} setRScore={setRScore}/>

            <div className="w-[854px] flex gap-4">
                <button className="bg-red-500 hover:bg-red-600 rounded-lg p-2 w-[30%] transition" disabled={disableButton} onClick={() => {
                    setActiveModel((prevState) => (prevState === "Logic" ? "KNN" : "Logic"));
                }}>Tracking Model: {activeModel}</button>
                <button className="bg-lime-500 hover:bg-lime-600 rounded-lg p-2 w-[40%] transition" disabled={disableButton} ref={enableWebcamButton} onClick={enableCam}>Loading...</button>
                <button className="bg-blue-400 hover:bg-blue-500 rounded-lg p-2 w-[30%] transition" disabled={disableButton}>Save Score</button>
            </div>

            <div className="bg-black/25 h-[480px] w-[854px] rounded-2xl">
                <video autoPlay playsInline id="webcam" className="absolute h-[480px] w-[854px] rounded-2xl" ref={videoElement}></video>
                <canvas id="output_canvas" className="absolute rounded-2xl" width={videoWidth} height={videoHeight} ref={canvasElement}></canvas>
            </div>
        </div>
    )

}

export default CounterPage;