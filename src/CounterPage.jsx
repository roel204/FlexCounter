import {useEffect, useRef} from 'react';
import {PoseLandmarker, FilesetResolver, DrawingUtils,} from '@mediapipe/tasks-vision'

function CounterPage() {
    const videoElement = useRef(null)
    const canvasElement = useRef(null)
    const enableWebcamButton = useRef(null)
    let webcamRunning = false;
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

        if (webcamRunning === true) {
            webcamRunning = false;
            enableWebcamButton.current.innerText = "ENABLE PREDICTIONS";
        } else {
            webcamRunning = true;
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
        if (webcamRunning === true) {
            window.requestAnimationFrame(predictWebcam);
        }
    }

    return (
        <>
            <h1>Flex Counter!!</h1>
            <div>
                <video autoPlay playsInline id="webcam" className="h-[720px] w-[1280px] absolute top-10" ref={videoElement}></video>
                <canvas id="output_canvas" className="absolute top-10" width="1280" height="720" ref={canvasElement}></canvas>
            </div>
            <button ref={enableWebcamButton} onClick={enableCam}>Enable webcam</button>
        </>
    )

}

export default CounterPage;