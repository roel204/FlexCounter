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

    function resetScore() {
        setLScore(0)
        setRScore(0)
    }

    return (
        <>
            <div className="flex flex-row gap-4 w-[854px] h-[25vh] justify-between">
                <div className="w-[30%] bg-black/25 rounded-2xl p-4 text-center">
                    <p className="text-5xl">Left</p>
                    <p className="text-9xl">{lScore}</p>
                </div>
                <div className="flex flex-col justify-between w-[40%] items-center">
                    <div className="w-full h-full bg-black/25 rounded-2xl p-4 mb-2 text-center">
                        <p className="text-3xl">Total</p>
                        <p className="text-4xl">{lTotal} + {rTotal}</p>
                    </div>
                    <div className="w-full h-full bg-black/25 rounded-2xl p-4 text-center">
                        <p className="text-3xl">Record</p>
                        <p className="text-4xl">{lRecord} + {rRecord}</p>
                    </div>
                </div>
                <div className="w-[30%] bg-black/25 rounded-2xl p-4 text-center">
                    <p className="text-5xl">Right</p>
                    <p className="text-9xl">{rScore}</p>
                </div>
            </div>
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-2 left-2" onClick={saveScore}>Save Score</button>
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-20 left-2" onClick={resetTotal}>Reset Total</button>
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-40 left-2" onClick={resetRecord}>Reset Record</button>
            <button className="bg-blue-400 hover:bg-blue-500 rounded p-2 absolute top-60 left-2" onClick={resetScore}>Reset Score</button>
        </>
    )
}

export default ScoreComponent;