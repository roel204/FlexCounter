import {useRef} from 'react';

function CounterPage() {
    const videoElement = useRef(null)
    const enableWebcamButton = useRef(null)
    let webcamRunning = false;


    // Check if webcam access is supported.
    const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

    // If webcam supported, add event listener to button for when user wants to activate it.
    if (!hasGetUserMedia()) {
        console.warn("getUserMedia() is not supported by your browser");
    }

    // Enable the live webcam view and start detection.
    function enableCam() {
        console.log("start the webcam")

        // if (!poseLandmarker) {
        //     console.log("Wait! poseLandmaker not loaded yet.");
        //     return;
        // }

        if (webcamRunning === true) {
            webcamRunning = false;
            enableWebcamButton.current.innerText = "ENABLE PREDICTIONS";
        } else {
            webcamRunning = true;
            enableWebcamButton.current.innerText = "DISABLE PREDICTIONS";
        }

        // getUsermedia parameters.
        const constraints = {
            video: true
        };

        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            videoElement.current.srcObject = stream;
            // videoElement.current.addEventListener("loadeddata", predictWebcam);
        }).catch((error) => {
            console.error("Error accessing webcam:", error);
        });
    }

    return (
        <>
            <h1>Counter!!</h1>
            <div>
                <video autoPlay playsInline id="webcam" className="h-[720px] w-[1280px] absolute top-10" ref={videoElement}></video>
                <canvas id="output_canvas" className="absolute top-10" width="1280" height="720"></canvas>
            </div>
            <button ref={enableWebcamButton} onClick={enableCam}>Enable webcam</button>
        </>
    )
}

export default CounterPage