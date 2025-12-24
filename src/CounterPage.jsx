import { useEffect, useRef, useState } from 'react';
import { DrawingUtils, FilesetResolver, PoseLandmarker, } from '@mediapipe/tasks-vision'
import ScoreComponent from "./components/ScoreComponent.jsx";
import VideoCanvas from "./components/VideoCanvas.jsx";
import { useNN } from "./jsFiles/useNN.js";
import { useKNN } from "./jsFiles/KNN.js";
// import {saveNN, trainNN} from "./jsFiles/trainNN.js";
// import {getDataPoints} from "./jsFiles/getDataPoints.js";
// import {calcAccuracy} from "./jsFiles/calcAccuracy.js";

function CounterPage() {
    const videoElement = useRef(null);
    const canvasElement = useRef(null);
    const enableWebcamButton = useRef(null);
    const poseLandmarkerRef = useRef(null);
    let canvasCtx = useRef(null);
    let drawingUtils = useRef(null);

    let lastVideoTime = -1;

    const minVisibility = 0.9;
    const minFrameCount = 3;
    // TODO: adjust minFrameCount based on framerate?
    const lDownRef = useRef(0);
    const rDownRef = useRef(0);
    const lUpRef = useRef(0);
    const rUpRef = useRef(0);
    const [lScore, setLScore] = useState(0);
    const [rScore, setRScore] = useState(0);

    const [loading, setLoading] = useState(true);

    const [countingRunning, setCountingRunning] = useState(false);
    const countingRunningRef = useRef(countingRunning);

    const [activeModel, setActiveModel] = useState("Logic");
    const modelRef = useRef(activeModel);

    // Set the modelRef everytime the activeModel changes
    useEffect(() => {
        modelRef.current = activeModel
    }, [activeModel]);

    // Setup Camera and PoseLandmarker
    useEffect(() => {
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
                min_pose_detection_confidence: 0.9,
                min_pose_presence_confidence: 0.6,
                min_tracking_confidence: 0.6
            })
            setLoading(false)
            enableWebcamButton.current.innerText = "Enable Webcam"
        };

        startApp()
    }, []);

    // Enable the live webcam view and start detection or toggle predictions
    const enableWebcam = () => {
        toggleCounting();
        if (videoElement.current.srcObject) return;
        setLoading(true);

        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            videoElement.current.srcObject = stream;
            videoElement.current.addEventListener("loadeddata", predictWebcam);

        }).catch((error) => {
            console.error("Error accessing webcam:", error);
            window.alert("Error accessing webcam.");
        }).finally(() => {
            setLoading(false);
        });
    }

    const toggleCounting = () => {
        setCountingRunning((prevState) => {
            countingRunningRef.current = !prevState;
            enableWebcamButton.current.innerText = countingRunningRef.current ? "Pause Counting" : "Enable Counting";
            return !prevState;
        });
    };

    // Continuously capture images from the webcam and run the Pose Landmarker model
    const predictWebcam = async () => {
        let startTimeMs = performance.now();
        canvasCtx = canvasElement.current.getContext("2d");
        drawingUtils = new DrawingUtils(canvasCtx);

        if (lastVideoTime !== videoElement.current.currentTime) {
            lastVideoTime = videoElement.current.currentTime;
            poseLandmarkerRef.current.detectForVideo(videoElement.current, startTimeMs, (result) => {

                canvasCtx.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height);
                if (!result.landmarks || result.landmarks.length === 0) return; // No pose detected

                const shownPoints = [12, 14, 16, 20, 11, 13, 15, 19];
                for (const landmark of result.landmarks) {

                    const filteredConnections = PoseLandmarker.POSE_CONNECTIONS.filter(
                        ({ start, end }) => shownPoints.includes(start) && shownPoints.includes(end)
                    );
                    drawingUtils.drawConnectors(landmark, filteredConnections);

                    const filteredLandmarks = shownPoints.map(index => landmark[index]).filter(Boolean);
                    drawingUtils.drawLandmarks(filteredLandmarks, {
                        color: (data) => data.from.visibility < minVisibility ? 'red' : 'lime'
                    });
                }

                // console.log(countingRunningRef.current);
                if (countingRunningRef.current) countScore();
            });
        }

        window.requestAnimationFrame(predictWebcam);
    }

    function getArmY(shoulder, elbow, hand) {
        const landmarks = poseLandmarkerRef.current.landmarks[0];

        if (!landmarks || landmarks[shoulder].visibility <= minVisibility || landmarks[elbow].visibility <= minVisibility || landmarks[hand].visibility <= minVisibility) {
            return null;
        }

        return {
            shoulderY: landmarks[shoulder].y,
            elbowY: landmarks[elbow].y,
            handY: landmarks[hand].y,
        };
    }

    async function getPrediction(model, points) {
        const { shoulderY, elbowY, handY } = points;
        if (model === "KNN") {
            return await useKNN(shoulderY, elbowY, handY);
        }

        if (model === "NN") {
            return await useNN(shoulderY, elbowY, handY);
        }

        // Logic fallback
        if (handY < shoulderY) return "up";
        if (handY > elbowY) return "down";
        return null;
    }

    function handleScoreCount(prediction, downRef, upRef, setScore) {
        if (prediction === "up") {
            upRef.current = upRef.current + 1;
        }

        if (prediction === "down") {
            downRef.current = downRef.current + 1;
            upRef.current = 0;
        }

        if (upRef.current >= minFrameCount && downRef.current >= minFrameCount) {
            setScore((s) => s + 1);
            downRef.current = 0;
            upRef.current = 0;
        }
    }

    const countScore = async () => {
        // LEFT ARM
        const leftPosY = getArmY(11, 13, 19);
        if (leftPosY) {
            const pred = await getPrediction(modelRef.current, leftPosY);
            handleScoreCount(pred, lDownRef, lUpRef, setLScore);
        }

        // RIGHT ARM
        const rightPosY = getArmY(12, 14, 20);
        if (rightPosY) {
            const pred = await getPrediction(modelRef.current, rightPosY);
            handleScoreCount(pred, rDownRef, rUpRef, setRScore);
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
                <button className="text-sm lg:text-base bg-blue-500 hover:bg-blue-600 rounded-lg p-2 w-[29%] transition"
                    disabled={loading} onClick={switchModel}>
                    Mode: {activeModel}
                </button>
                <button className="bg-lime-500 hover:bg-lime-600 rounded-lg p-2 w-[70%] transition"
                    disabled={loading} ref={enableWebcamButton} onClick={enableWebcam}>
                    Loading...
                </button>
            </div>

            <VideoCanvas videoElement={videoElement} canvasElement={canvasElement} countingRunning={countingRunning} />
        </div>
    )

}

export default CounterPage;