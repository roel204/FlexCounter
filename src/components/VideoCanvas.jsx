import { useEffect, useState } from "react";

function VideoCanvas({ videoElement, canvasElement, countingRunning }) {
    const [videoSize, setVideoSize] = useState({ width: "256px", height: "144px" });

    useEffect(() => {
        const updateSize = () => {
            if (!videoElement.current) return;

            const naturalWidth = videoElement.current.videoWidth || 854;
            const naturalHeight = videoElement.current.videoHeight || 480;

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight / 2; // Limit height to half of the screen height
            const aspectRatio = naturalWidth / naturalHeight;

            // Calculate video size based on screen size and natural dimensions
            if (screenWidth < 1024) {
                const width = Math.min(screenWidth, screenHeight * aspectRatio);
                const height = width / aspectRatio;
                setVideoSize({
                    width: `${Math.floor(width)}px`,
                    height: `${Math.floor(height)}px`,
                });
            } else {
                setVideoSize({
                    width: `${naturalWidth}px`,
                    height: `${naturalHeight}px`,
                });
            }
        };

        // Update size on metadata load and window resize
        const handleResize = () => updateSize();
        if (videoElement.current) {
            videoElement.current.addEventListener("loadedmetadata", updateSize);
        }
        window.addEventListener("resize", handleResize);

        // Initial size calculation
        updateSize();

        return () => {
            if (videoElement.current) {
                videoElement.current.removeEventListener("loadedmetadata", updateSize);
            }
            window.removeEventListener("resize", handleResize);
        };
    }, [videoElement]);

    return (
        <>
            <div
                className={`bg-black/25 rounded-2xl relative flex items-center justify-center`}
                style={{ width: videoSize.width, height: videoSize.height }}
            >
                <video
                    autoPlay
                    playsInline
                    id="webcam"
                    className={`absolute rounded-2xl -scale-x-100`}
                    style={{
                        width: videoSize.width,
                        height: videoSize.height,
                    }}
                    ref={videoElement}
                ></video>
                <canvas
                    id="output_canvas"
                    className={`absolute rounded-2xl -scale-x-100`}
                    width={parseInt(videoSize.width, 10)}
                    height={parseInt(videoSize.height, 10)}
                    ref={canvasElement}
                ></canvas>
                {!countingRunning && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="fill-black absolute w-52 h-52 opacity-80">
                        <path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" />
                    </svg>
                )}
            </div>
        </>
    );
}

export default VideoCanvas;
