import ButtonContainer from "./ButtonContainer";
import MainScreen from "./MainScreen";
import { FiRefreshCw } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import DescriptionPopup from "./DescriptionPopup";


let initialTime = {
    d: 0,
    h: 0,
    m: 0,
    s: 0
}

function secondsToTimeFormat(seconds) {
    if (seconds === 0)
        return initialTime; // Ensure to return valid initial time
    const days = Math.floor(seconds / 86400); // 1 day = 86400 seconds
    const hours = Math.floor((seconds % 86400) / 3600); // 1 hour = 3600 seconds
    const minutes = Math.floor((seconds % 3600) / 60); // 1 minute = 60 seconds
    const sec = Math.floor(seconds % 60); // Remaining seconds
    return {
        d: days,
        h: hours,
        m: minutes,
        s: sec
    }
}

const buttonState = {
    Start: true,
    Stop: false,
    Log: false,
    Reset: false
}

function Timer() {
    const [seconds, setSeconds] = useState(0);
    const [time, setTime] = useState(initialTime);
    const [isButtonEnabled, setButtonEnabled] = useState(buttonState);
    const [startButton, setStartButton] = useState("Start");
    const [isRunning, setIsRunning] = useState(false); // Initially false
    const [popUp, setPopUp] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setSeconds((seconds) => seconds + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current); // Clear the interval if not running
        }
        return () => clearInterval(timerRef.current); // Cleanup
    }, [isRunning]);

    useEffect(() => {
        // For every change in seconds, the overall format of time will be changed as well
        setTime(secondsToTimeFormat(seconds));
    }, [seconds])

    function handleStart() {
        if (!isRunning) {
            setIsRunning(true);
            setStartButton("Start");
            setPopUp(false);
            // If Start Button is clicked, Disable 'start' and enable all other three buttons
            setButtonEnabled({
                Start: false,
                Stop: true,
                Log: true,
                Reset: true
            });
            // After hittin stop buttons, 'start' should become 'resume'
            // but after hitting 'resume', it should become 'start' again
        }
    };

    function handleStop() {
        if (isRunning) {
            setIsRunning(false);
            setStartButton("Resume");
            // If Stop Button is clicked, Disable 'Stop' and enable all other three buttons
            setButtonEnabled({
                Start: true,
                Stop: false,
                Log: true,
                Reset: true
            });
            // Make Start Button as "Resume" Button
        }
    };

    function handleReset() {
        setSeconds(0);
        setIsRunning(false);
        setStartButton("Start");
        // If Reset Button is clicked, Enable 'start' and diable all other three buttons
        setButtonEnabled({
            Start: true,
            Stop: false,
            Log: false,
            Reset: false
        })
    }

    function handleLog() {
        console.log("Current time is: " + time.d + "days " + time.h + "hours " + time.m + "minutes " + time.s + "seconds ");
        // PopUp a react component
        // alert("Current time is: " + time.d + "days " + time.h + "hours  " + time.m + "minutes " + time.s + "seconds ");
        //  If Log Button is clicked, Reset the clock and enable 'start' button only
        handleReset();
        // Open Pop-up element
        setPopUp(true);
    }

    return <div>
        <div className="main-container" style={{
            display: "flex",
            height: "100vh",
        }}>
            <div className="timer-panel" style={{
                maxWidth: "28rem",
                minWidth: "28rem",
                height: "57%",
                backgroundColor: "#f1f2f4",
                borderRadius: "10px",
                fontSize: "2rem",
                fontWeight: "700",
                position: "relative",
                display: "flex",            // This centers the text inside the box
                justifyContent: "center",    // Horizontally centers text
                alignItems: "center",        // Vertically centers text
            }}>

                <div className='timer-bar'> {time.d}d {time.h}h {time.m}m {time.s}s   </div>
                <div className="refresh-button" >
                    <FiRefreshCw style={{
                        position: "absolute",
                        top: "5%",
                        right: "2%",
                        color: "grey",
                    }} />
                </div>
            </div>
            <div className="button-panel" style={{
                height: "57%",
                marginLeft: "5px",
                display: "flex",
                flexDirection: "column"
            }}>
                <div className='button-group' style={{
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <ButtonContainer {...{ startButton, handleStart, handleStop, handleReset, handleLog, isButtonEnabled }} />
                    {/* Short form of ternary operator */}
                    {popUp && (<DescriptionPopup {...{ setPopUp }} />)}
                </div>

            </div>
        </div>
    </div>
}

export default Timer;