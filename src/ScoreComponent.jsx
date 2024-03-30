import {useEffect, useState} from "react";

function ScoreComponent({lScore, rScore, setRScore, setLScore}) {
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
    function saveScore() {
        const newLTotal = lTotal + lScore
        const newRTotal = rTotal + rScore

        setLTotal(newLTotal)
        setRTotal(newRTotal)

        localStorage.setItem("lTotal", newLTotal)
        localStorage.setItem("rTotal", newRTotal)

        if (lScore > lRecord) {
            localStorage.setItem("lRecord", lScore)
            setLRecord(lScore)
        }

        if (rScore > rRecord) {
            localStorage.setItem("rRecord", rScore)
            setRRecord(rScore)
        }

        setLScore(0)
        setRScore(0)
    }

    function resetTotal() {
        setLTotal(0)
        setRTotal(0)
        localStorage.setItem("lTotal", 0)
        localStorage.setItem("rTotal", 0)
    }

    function resetRecord() {
        setLRecord(0)
        setRRecord(0)
        localStorage.setItem("lRecord", 0)
        localStorage.setItem("rRecord", 0)
    }

    return (
        <div className="flex flex-row gap-4 w-full lg:w-[854px] justify-between">
            <div className="w-[30%] bg-black/25 rounded-2xl p-4 ">
                <button className="absolute w-4 lg:w-8" onClick={saveScore}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="fill-orange-200 hover:fill-orange-400">
                        <path
                            d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
                    </svg>
                </button>
                <p className="text-2xl lg:text-5xl text-center">Left</p>
                <p className="text-7xl lg:text-9xl text-center">{lScore}</p>
            </div>
            <div className="flex flex-col justify-between w-[40%] items-center">
                <div className="w-full h-full bg-black/25 rounded-2xl p-4 mb-2">
                    <button className="absolute w-4 lg:w-8" onClick={resetTotal}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="fill-orange-200 hover:fill-orange-400">
                            <path
                                d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                        </svg>
                    </button>
                    <p className="lg:text-3xl text-center">Total</p>
                    <p className="lg:text-4xl text-center">{lTotal} + {rTotal}</p>
                </div>
                <div className="w-full h-full bg-black/25 rounded-2xl p-4">
                    <button className="absolute w-4 lg:w-8" onClick={resetRecord}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="fill-orange-200 hover:fill-orange-400">
                            <path
                                d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                        </svg>
                    </button>
                    <p className="lg:text-3xl text-center">Record</p>
                    <p className="lg:text-4xl text-center">{lRecord} + {rRecord}</p>
                </div>
            </div>
            <div className="w-[30%] bg-black/25 rounded-2xl p-4 text-center">
                <p className="text-2xl lg:text-5xl">Right</p>
                <p className="text-7xl lg:text-9xl">{rScore}</p>
            </div>
        </div>
    )
}

export default ScoreComponent;