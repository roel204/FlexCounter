import {useEffect} from "react";

function VideoCanvas({videoHeight, videoWidth, videoElement, canvasElement}) {

    // Resize for mobile
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth <= 1024 ? window.innerWidth : 854;
            videoHeight.current = `${Math.floor(width / (16 / 9))}px`;
            videoWidth.current = `${width}px`;
            console.log(videoHeight.current)
            console.log(videoWidth.current)
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Invoke on mount

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className={`bg-black/25 aspect-video w-full lg:w-[854px] rounded-2xl`}>
            <video
                autoPlay
                playsInline
                id="webcam"
                className={`absolute aspect-video rounded-2xl -scale-x-100`}
                width={videoWidth.current}
                height={videoHeight.current}
                ref={videoElement}
            ></video>
            <canvas
                id="output_canvas"
                className={`absolute aspect-video rounded-2xl -scale-x-100`}
                width={videoWidth.current}
                height={videoHeight.current}
                ref={canvasElement}
            ></canvas>
        </div>
    );
}

export default VideoCanvas;