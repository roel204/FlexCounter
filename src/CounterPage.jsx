import {useEffect, useRef, useState} from 'react';
import {PoseLandmarker, FilesetResolver, DrawingUtils,} from '@mediapipe/tasks-vision'
import Goal from "./Goal.jsx";

function CounterPage() {
    const videoElement = useRef(null)
    const canvasElement = useRef(null)
    const [goal, setGoal] = useState(69);
    const enableWebcamButton = useRef(null)
    let predictionsRunning = false;
    const videoHeight = "720px";
    const videoWidth = "1280px";
    let poseLandmarker = undefined;

    // Create tge PoseLandmarker
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
    };
    createPoseLandmarker();

    // Check if webcam access is supported.
    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;
    if (!hasGetUserMedia()) {
        console.warn("getUserMedia() is not supported by your browser");
    }

    // Enable the live webcam view and start detection.
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

        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
            videoElement.current.srcObject = stream;
            videoElement.current.addEventListener("loadeddata", predictWebcam);
        }).catch((error) => {
            console.error("Error accessing webcam:", error);
        });
    }

    let lastVideoTime = -1;
    let canvasCtx = useRef(null)
    let drawingUtils = useRef(null)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        canvasCtx = canvasElement.current.getContext("2d");
        // eslint-disable-next-line react-hooks/exhaustive-deps
        drawingUtils = new DrawingUtils(canvasCtx);
    }, [canvasElement]);

    async function predictWebcam() {
        canvasElement.current.style.height = videoHeight;
        videoElement.current.style.height = videoHeight;
        canvasElement.current.style.width = videoWidth;
        videoElement.current.style.width = videoWidth;

        let startTimeMs = performance.now();
        if (lastVideoTime !== videoElement.current.currentTime) {
            lastVideoTime = videoElement.current.currentTime;
            poseLandmarker.detectForVideo(videoElement.current, startTimeMs, (result) => {
                canvasCtx.save();
                canvasCtx.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height);
                for (const landmark of result.landmarks) {
                    drawingUtils.drawLandmarks(landmark, {
                        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
                    });
                    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                }
                canvasCtx.restore();
            });
        }

        // Call this function again to keep predicting when the browser is ready.
        if (predictionsRunning === true) {
            window.requestAnimationFrame(predictWebcam);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ff8c00] to-[#ffe312] px-[5vw] pt-[3vh] flex flex-col items-center gap-4">
            <h1 className="text-6xl font-bold">FLEX COUNTER</h1>
            <Goal goal={goal} setGoal={setGoal}/>
            <button className="bg-lime-400 rounded p-2 w-[40vw]" ref={enableWebcamButton} onClick={enableCam}>Enable webcam</button>
            <div className="bg-black/25 h-[720px] w-[1280px]">
                <video autoPlay playsInline id="webcam" className="absolute h-[720px] w-[1280px]" ref={videoElement}></video>
                <canvas id="output_canvas" className="absolute" width="1280" height="720" ref={canvasElement}></canvas>
            </div>
        </div>
    )

}

export default CounterPage;