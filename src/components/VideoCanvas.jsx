import {useEffect, useRef, useState} from "react";

function VideoCanvas({videoElement, canvasElement}) {
    const videoHeight = useRef("854px");
    const videoWidth = useRef("480px");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1240);

    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight / 2; // Limit height to half of the screen height
            const aspectRatio = 16 / 9;

            let width, height;

            // Calculate width based on the aspect ratio
            width = Math.min(screenWidth, screenHeight / aspectRatio);

            // Calculate height based on the calculated width
            height = width * aspectRatio;

            // Set the size of the video and canvas elements
            videoWidth.current = `${Math.floor(width)}px`;
            videoHeight.current = `${Math.floor(height)}px`;

            setIsMobile(screenWidth < 1240);
            console.log(videoWidth.current)
            console.log(videoHeight.current)
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Invoke on mount

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            {isMobile ? (
                // Mobile
                <div className={`bg-black/25 w-[${videoWidth.current}] h-[${videoHeight.current}] rounded-2xl relative`}>
                    <video
                        autoPlay
                        playsInline
                        id="webcam"
                        className={`absolute rounded-2xl -scale-x-100`}
                        width={videoWidth.current}
                        height={videoHeight.current}
                        ref={videoElement}
                    ></video>
                    <canvas
                        id="output_canvas"
                        className={`absolute rounded-2xl -scale-x-100`}
                        width={videoWidth.current}
                        height={videoHeight.current}
                        ref={canvasElement}
                    ></canvas>
                </div>
            ) : (
                // Desktop
                <div className={`bg-black/25 aspect-video w-[854px] rounded-2xl relative`}>
                    <video
                        autoPlay
                        playsInline
                        id="webcam"
                        className={`absolute aspect-video rounded-2xl -scale-x-100`}
                        width={"854px"}
                        height={"480px"}
                        ref={videoElement}
                    ></video>
                    <canvas
                        id="output_canvas"
                        className={`absolute aspect-video rounded-2xl -scale-x-100`}
                        width={"854px"}
                        height={"480px"}
                        ref={canvasElement}
                    ></canvas>
                </div>
            )}
        </>

    );
}

export default VideoCanvas;