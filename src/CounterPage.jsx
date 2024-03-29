import {useRef, useState} from 'react';
import {PoseLandmarker, FilesetResolver, DrawingUtils,} from '@mediapipe/tasks-vision'
import kNear from "./knear.js"
import ScoreComponent from "./ScoreComponent.jsx";

function CounterPage() {
    const videoElement = useRef(null)
    const canvasElement = useRef(null)
    const enableWebcamButton = useRef(null)
    let canvasCtx = useRef(null)
    let drawingUtils = useRef(null)
    let poseLandmarker = undefined;
    let predictionsRunning = false;
    let lastVideoTime = -1;
    const videoHeight = "480px";
    const videoWidth = "854px";
    // const videoHeight = "720px";
    // const videoWidth = "1280px";
    const [disableButton, setDisableButton] = useState(true)

    let lDown = false
    let rDown = false
    const [lScore, setLScore] = useState(0)
    const [rScore, setRScore] = useState(0)

    const [activeModel, setActiveModel] = useState("Logic")

    const delay = async (ms) => {
        return new Promise((resolve) =>
            setTimeout(resolve, ms));
    };

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
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numPoses: 2
        });
        await delay(500)
        setDisableButton(false)
        enableWebcamButton.current.innerText = "Enable Webcam"
    };

    // Enable the live webcam view and start detection
    function enableCam() {
        console.log("start the webcam")

        if (!poseLandmarker) {
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

    const k = 3
    const machine = new kNear(k);

    machine.learn([0.29699888825416565, 0.5170987844467163, 0.19376200437545776], 'up')
    machine.learn([0.25645995140075684, 0.5157449245452881, 0.18175971508026123], 'up')
    machine.learn([0.29640400409698486, 0.5498039722442627, 0.23758822679519653], 'up')
    machine.learn([0.29363715648651123, 0.5336388945579529, 0.28399333357810974], 'up')
    machine.learn([0.31886687874794006, 0.46447107195854187, 0.16273164749145508], 'up')

    machine.learn([0.30467694997787476, 0.5444952845573425, 0.7781786918640137], 'down')
    machine.learn([0.31995970010757446, 0.5650004744529724, 0.7957270741462708], 'down')
    machine.learn([0.29677191376686096, 0.5260168313980103, 0.6818185448646545], 'down')
    machine.learn([0.33023908734321594, 0.5576013922691345, 0.68390953540802], 'down')
    machine.learn([0.2913947105407715, 0.551878809928894, 0.6582819223403931], 'down')
    console.log("KNN Trained")


    async function predictWebcam() {
        let startTimeMs = performance.now();
        canvasCtx = canvasElement.current.getContext("2d");
        drawingUtils = new DrawingUtils(canvasCtx);

        if (lastVideoTime !== videoElement.current.currentTime) {
            lastVideoTime = videoElement.current.currentTime;
            poseLandmarker.detectForVideo(videoElement.current, startTimeMs, (result) => {

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
            if (poseLandmarker.landmarks[0] && poseLandmarker.landmarks[0][12].visibility > 0.9 && poseLandmarker.landmarks[0][14].visibility > 0.9 && poseLandmarker.landmarks[0][20].visibility > 0.9) {
                let lShoulderY = poseLandmarker.landmarks[0][12].y
                let lElbowY = poseLandmarker.landmarks[0][14].y
                let lHandY = poseLandmarker.landmarks[0][20].y

                if (activeModel === "KNN") {
                    console.log("KNN")

                    let prediction = machine.classify([lShoulderY, lElbowY, lHandY])
                    console.log(`I think this is ${prediction}`)

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
                    console.log("Logic")

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

            if (poseLandmarker.landmarks[0] && poseLandmarker.landmarks[0][11].visibility > 0.9 && poseLandmarker.landmarks[0][13].visibility > 0.9 && poseLandmarker.landmarks[0][19].visibility > 0.9) {
                let rShoulderY = poseLandmarker.landmarks[0][11].y
                let rElbowY = poseLandmarker.landmarks[0][13].y
                let rHandY = poseLandmarker.landmarks[0][19].y

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

    startApp()

    function changeModel() {
        setActiveModel((prevState) => (prevState === "Logic" ? "KNN" : "Logic"));
    }

    async function getDataPoints() {
        for (let i = 0; i < 5; i++) {
            await delay(4000);

            if (poseLandmarker.landmarks[0]) {
                let lShoulder = poseLandmarker.landmarks[0][12]
                let lElbow = poseLandmarker.landmarks[0][14]
                let lHand = poseLandmarker.landmarks[0][20]

                if (lShoulder.visibility > 0.9 && lElbow.visibility > 0.9 && lHand.visibility > 0.9) {
                    console.log({pose: [lShoulder.y, lElbow.y, lHand.y], label: "up/down"})
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ff8c00] to-[#ffe312] flex flex-col items-center justify-center gap-4 text-white">
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-2 left-2" onClick={getDataPoints}>Train Data</button>
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-2 left-40" onClick={() => {
                setLScore((lScore) => lScore + 1)
            }}>Test Points
            </button>

            <h1 className="text-7xl font-bold">FLEX COUNTER</h1>

            <ScoreComponent lScore={lScore} rScore={rScore} setLScore={setLScore} setRScore={setLScore}/>

            <div className="w-[854px] flex gap-4">
                <button className="bg-red-500 hover:bg-red-600 rounded-lg p-2 w-[30%] transition" disabled={disableButton} onClick={changeModel}>Tracking Model: {activeModel}</button>
                <button className="bg-lime-500 hover:bg-lime-600 rounded-lg p-2 w-[40%] transition" disabled={disableButton} ref={enableWebcamButton} onClick={enableCam}>Loading...</button>
                <button className="bg-blue-400 hover:bg-blue-500 rounded-lg p-2 w-[30%] transition" disabled={disableButton} >Save Score</button>
            </div>

            <div className="bg-black/25 h-[480px] w-[854px] rounded-2xl">
                <video autoPlay playsInline id="webcam" className="absolute h-[480px] w-[854px] rounded-2xl" ref={videoElement}></video>
                <canvas id="output_canvas" className="absolute rounded-2xl" width={videoWidth} height={videoHeight} ref={canvasElement}></canvas>
            </div>
        </div>
    )

}

export default CounterPage;