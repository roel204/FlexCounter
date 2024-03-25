import {useState} from "react";

function Test() {
    const [activeModel, setActiveModel] = useState("Logic")

    if (activeModel === "KNN") {
        console.log("KNN")
    } else {
        console.log("Logic")
    }

    function changeModel() {
        setActiveModel((prevState) => (prevState === "Logic" ? "KNN" : "Logic"));
    }

    return (
        <button className="bg-red-500 hover:bg-red-600 rounded-lg p-2 w-[30%] transition" onClick={changeModel}>Tracking Model: {activeModel}</button>
    )


}

export default Test;

