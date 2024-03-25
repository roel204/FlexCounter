import {useEffect, useState} from "react";

function ScoreComponent() {
    const [lScore, setLScore] = useState(0)
    const [rScore, setRScore] = useState(0)
    const [lTotal, setLTotal] = useState(0)
    const [rTotal, setRTotal] = useState(0)
    const [lRecord, setLRecord] = useState(0)
    const [rRecord, setRRecord] = useState(0)

    useEffect(() => {
        setLTotal(parseInt(localStorage.getItem("lTotal") || 0))
        setRTotal(parseInt(localStorage.getItem("rTotal") || 0))
        setLRecord(parseInt(localStorage.getItem("lRecord") || 0))
        setRRecord(parseInt(localStorage.getItem("rRecord") || 0))
    }, []);

    function getAlert() {
        alert("getAlert from Child");
    }

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

    return (
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
    )
}

export default ScoreComponent;