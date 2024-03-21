import {useEffect, useRef} from "react";

// eslint-disable-next-line react/prop-types
function Goal({goal, setGoal}) {

    const goalInput = useRef(null)

    useEffect(() => {
        const localGoal = parseInt(localStorage.getItem("goal") || 40);
        console.log(localGoal)
        setGoal(localGoal)
        goalInput.current.value = goal
    }, []);

    function increaseGoal() {
        setGoal(goal += 2)
        console.log(goal)
        goalInput.current.value = goal
        localStorage.setItem("goal", goal);
    }

    function decreaseGoal() {
        setGoal(goal -= 2)
        console.log(goal)
        goalInput.current.value = goal
        localStorage.setItem("goal", goal);
    }

    function inputChanged() {
        console.log(`A${goalInput.current.value}`)
        console.log(`B${goal}`)
        setGoal(goalInput.current.value)
        console.log(`C${goal}`)
    }


    return (
        <div>
            <div className="flex items-center max-w-[8rem]">
                <button className="bg-gray-600 hover:bg-gray-500 border border-gray-900 rounded-s-lg p-3 h-11" onClick={decreaseGoal}>
                    <svg className="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16"/>
                    </svg>
                </button>
                <input type="text" aria-describedby="helper-text-explanation" ref={goalInput} onChange={inputChanged}
                       className="bg-gray-500 border-y border-gray-900 h-11 text-center text-white text-sm block w-full py-2.5"
                       defaultValue={goal} required/>
                <button className="bg-gray-600 hover:bg-gray-500 border border-gray-900 rounded-e-lg p-3 h-11" onClick={increaseGoal}>
                    <svg className="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default Goal