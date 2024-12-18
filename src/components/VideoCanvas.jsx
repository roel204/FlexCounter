import { useEffect, useState } from "react";

function VideoCanvas({ videoElement, canvasElement }) {
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
                className={`bg-black/25 rounded-2xl relative`}
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
            </div>
        </>
    );
}

export default VideoCanvas;
