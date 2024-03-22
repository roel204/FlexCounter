import {useEffect, useRef, useState} from 'react';
import {PoseLandmarker, FilesetResolver, DrawingUtils,} from '@mediapipe/tasks-vision'
import kNear from "./knear.js"

function CounterPage() {
    const videoElement = useRef(null)
    const canvasElement = useRef(null)
    const enableWebcamButton = useRef(null)
    let canvasCtx = useRef(null)
    let drawingUtils = useRef(null)
    let poseLandmarker = undefined;
    let predictionsRunning = false;
    let lastVideoTime = -1;
    const videoHeight = "720px";
    const videoWidth = "1280px";
    let disableButton = false

    let lDown = false
    let rDown = false
    const [lScore, setLScore] = useState(0)
    const [rScore, setRScore] = useState(0)

    // Set canvasCtx & drawingUtils when the canvasElement has loaded
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        canvasCtx = canvasElement.current.getContext("2d");
        // eslint-disable-next-line react-hooks/exhaustive-deps
        drawingUtils = new DrawingUtils(canvasCtx);
    }, [canvasElement.current]);

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
        enableWebcamButton.current.innerText = "Enable Webcam"
        enableWebcamButton.current.enabled
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
            enableWebcamButton.current.innerText = "ENABLE PREDICTIONS";
        } else {
            predictionsRunning = true;
            enableWebcamButton.current.innerText = "DISABLE PREDICTIONS";
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
        if (lastVideoTime !== videoElement.current.currentTime) {
            lastVideoTime = videoElement.current.currentTime;
            poseLandmarker.detectForVideo(videoElement.current, startTimeMs, (result) => {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height);
                for (const landmark of result.landmarks) {
                    drawingUtils.drawLandmarks(landmark, {radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)});
                    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                }
                canvasCtx.restore();
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

                if (lHandY < lShoulderY) {
                    // console.log("Left up")
                    if (lDown) {
                        setLScore((lScore) => lScore + 1)
                        lDown = false
                    }
                }

                if (lHandY > lElbowY) {
                    // console.log("Left down")
                    lDown = true
                }
            }

            if (poseLandmarker.landmarks[0] && poseLandmarker.landmarks[0][11].visibility > 0.9 && poseLandmarker.landmarks[0][13].visibility > 0.9 && poseLandmarker.landmarks[0][19].visibility > 0.9) {
                let rShoulderY = poseLandmarker.landmarks[0][11].y
                let rElbowY = poseLandmarker.landmarks[0][13].y
                let rHandY = poseLandmarker.landmarks[0][19].y

                if (rHandY < rShoulderY) {
                    // console.log("Right up")
                    if (rDown) {
                        setRScore((rScore) => rScore + 1)
                        rDown = false
                    }
                }

                if (rHandY > rElbowY) {
                    // console.log("Right down")
                    rDown = true
                }
            }
        }
    }

    startApp()

    const k = 3
    const machine = new kNear(k);

    // machine.learn([6, 5, 9, 4], 'cat')
    // machine.learn([12, 20, 19, 3], 'dog')
    // machine.learn([6, 5, 9, 4], 'cat')
    // machine.learn([12, 20, 19, 3], 'dog')
    // machine.learn([6, 5, 9, 4], 'cat')
    // machine.learn([12, 20, 19, 3], 'dog')

    machine.learn([18, 9.2, 8.1, 2], 'cat')
    machine.learn([20.1, 17, 15.5, 5], 'dog')
    machine.learn([17, 9.1, 9, 1.95], 'cat')
    machine.learn([23.5, 20, 20, 6.2], 'dog')
    machine.learn([16, 9, 10, 2.1], 'cat')
    machine.learn([21, 16.7, 16, 3.3], 'dog')

    let prediction = machine.classify([21, 16, 16, 4])
    console.log(`I think this is a ${prediction}`)

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ff8c00] to-[#ffe312] px-[5vw] pt-[3vh] flex flex-col items-center gap-4">
            <h1 className="text-6xl font-bold">FLEX COUNTER</h1>
            <p>Left arm: {lScore} | Right arm: {rScore}</p>
            <button className="bg-lime-400 rounded p-2 w-[40vw]" disabled={disableButton} ref={enableWebcamButton} onClick={enableCam}>Loading...</button>
            <div className="bg-black/25 h-[720px] w-[1280px]">
                <video autoPlay playsInline id="webcam" className="absolute h-[720px] w-[1280px]" ref={videoElement}></video>
                <canvas id="output_canvas" className="absolute" width={videoWidth} height={videoHeight} ref={canvasElement}></canvas>
            </div>
        </div>
    )

}

export default CounterPage;