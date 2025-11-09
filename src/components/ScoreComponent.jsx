import { useEffect, useState } from "react";

function ScoreComponent({ lScore, rScore, setRScore, setLScore }) {
    const [lTotal, setLTotal] = useState(0)
    const [rTotal, setRTotal] = useState(0)
    const [lRecord, setLRecord] = useState(0)
    const [rRecord, setRRecord] = useState(0)

    // Get total & record from localstorage
    useEffect(() => {
        setLTotal(parseInt(localStorage.getItem("lTotal") || 0))
        setRTotal(parseInt(localStorage.getItem("rTotal") || 0))
        setLRecord(parseInt(localStorage.getItem("lRecord") || 0))
        setRRecord(parseInt(localStorage.getItem("rRecord") || 0))
    }, []);

    // Function to save total & record into localstorage
    const saveScore = () => {
        const newLTotal = lTotal + lScore
        const newRTotal = rTotal + rScore

        setLTotal(newLTotal)
        setRTotal(newRTotal)

        localStorage.setItem("lTotal", newLTotal)
        localStorage.setItem("rTotal", newRTotal)

        if (lScore > lRecord) {
            setLRecord(lScore)
            localStorage.setItem("lRecord", lScore)
        }

        if (rScore > rRecord) {
            setRRecord(rScore)
            localStorage.setItem("rRecord", rScore)
        }

        setLScore(0)
        setRScore(0)
    }

    const resetScore = () => {
        setLScore(0)
        setRScore(0)
    }

    const resetTotal = () => {
        setLTotal(0)
        setRTotal(0)
        localStorage.setItem("lTotal", 0)
        localStorage.setItem("rTotal", 0)
    }

    const resetRecord = () => {
        setLRecord(0)
        setRRecord(0)
        localStorage.setItem("lRecord", 0)
        localStorage.setItem("rRecord", 0)
    }

    return (
        <div className="flex flex-row gap-4 w-full lg:w-[854px] justify-between">

            {/* Left */}
            <div className="relative w-[30%] bg-black/25 rounded-2xl p-4">
                <button
                    className="absolute bottom-2 left-2 lg:bottom-4 lg:left-4 inline-flex w-6 h-6 lg:w-8 lg:h-8"
                    onClick={saveScore}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="fill-orange-200 hover:fill-orange-400">
                        <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                    </svg>
                </button>
                <p className="text-2xl lg:text-5xl text-center">Left</p>
                <p className="text-5xl sm:text-7xl lg:text-9xl text-center">{lScore}</p>
            </div>

            <div className="flex flex-col justify-between w-[40%] items-center">

                {/* Total */}
                <div className="relative w-full h-full bg-black/25 rounded-2xl p-2 mb-2">
                    <button
                        className="absolute top-3 left-3 inline-flex w-3 h-3 sm:w-6 sm:h-6"
                        onClick={resetTotal}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="fill-orange-200 hover:fill-orange-400">
                            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                        </svg>
                    </button>
                    <p className="lg:text-2xl text-center">Total</p>
                    <p className="lg:text-4xl text-center">{lTotal} + {rTotal}</p>
                </div>

                {/* Record */}
                <div className="relative w-full h-full bg-black/25 rounded-2xl p-2">
                    <button
                        className="absolute top-3 left-3 inline-flex w-3 h-3 sm:w-6 sm:h-6"
                        onClick={resetRecord}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="fill-orange-200 hover:fill-orange-400">
                            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                        </svg>
                    </button>
                    <p className="lg:text-2xl text-center">Record</p>
                    <p className="lg:text-4xl text-center">{lRecord} + {rRecord}</p>
                </div>
            </div>

            {/* Right */}
            <div className="relative w-[30%] bg-black/25 rounded-2xl p-4 text-center">
                <button
                    className="absolute bottom-2 right-2 lg:bottom-4 lg:right-4 inline-flex w-6 h-6 lg:w-8 lg:h-8"
                    onClick={resetScore}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="fill-orange-200 hover:fill-orange-400">
                        <path d="M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z" />
                    </svg>
                </button>
                <p className="text-2xl lg:text-5xl">Right</p>
                <p className="text-5xl sm:text-7xl lg:text-9xl text-center">{rScore}</p>
            </div>
        </div>
    )
}

export default ScoreComponent;