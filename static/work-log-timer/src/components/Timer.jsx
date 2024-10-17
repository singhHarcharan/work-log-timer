import ButtonContainer from "./ButtonContainer";
import { FiRefreshCw } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import DescriptionPopup from "./DescriptionPopup";
import { invoke } from '@forge/bridge'
// import { storage } from "@forge/api";

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

// Check if the TimeLog is already present in Forge Storage 
const isTimePresent = async () => {
    console.log("Entered in isTimePresent function");
    let isPresent = false;
    try {
        isPresent = await invoke('isTimeLogPresent');
    } catch (error) {
        console.error('Error invoking function:', error);
    }
    return isPresent;
}

const timeToDisplay = async () => {
    let timeStored = 0;
    if (await isTimePresent()) {  // Await isTimePresent
        try {
            const { timeToDisplay, isRunning } = await invoke('GET TimeLog'); // Fetch both time and running status
            timeStored = timeToDisplay;
            return { time: secondsToTimeFormat(timeStored), isRunning };
        } catch (error) {
            console.error('Error invoking function:', error);
        }
    } 
    return { time: initialTime, isRunning: false };
};

// const startButtonState = async () => {
//     let {timeToDisplayValue, timerRunning} = await timeToDisplay();
//     if(timerRunning)    return "Start";
//     else                return "Resume"
// }

function Timer() {
    const [seconds, setSeconds] = useState(0);
    const [time, setTime] = useState(initialTime);
    const [isButtonEnabled, setButtonEnabled] = useState(buttonState);
    // const [startButton, setStartButton] = useState(startButtonState);
    const [startButton, setStartButton] = useState("Start");
    const [isRunning, setIsRunning] = useState(false); // Initially false
    const [popUp, setPopUp] = useState(false);
    const timerRef = useRef(null);

    // MAIN COUNTER
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

    // When 'Browser' is re-loaded
    // Fetch the time from forge storage if present
    useEffect(() => {
        async function fetchTime() {
            const { time: fetchedTime, isRunning: wasRunning } = await timeToDisplay()
            // .then((fetchedTime, runningStatus) => {
            //     console.log("Entered in dot then")
            //     setTime(fetchedTime);
            // })

            // If 'timer' was running at the backend
            if (wasRunning) {
                // Reverse conversion from 'time format' to 'seconds'
                setSeconds(fetchedTime.d * 86400 + fetchedTime.h * 3600 + fetchedTime.m * 60 + fetchedTime.s); 
                setIsRunning(true); 
                setStartButton("Start");
                setButtonEnabled({ Start: false, Stop: true, Log: true, Reset: true });
            }
            // If 'timer' was 'paused'
            else {
                // console.log("Entered in else condition");
                // setSeconds(fetchedTime.d * 86400 + fetchedTime.h * 3600 + fetchedTime.m * 60 + fetchedTime.s); 
                // // Handling Colors and States of Buttons on the behalf of 'time' stored.
                // if(time == initialTime) {
                //     console.log("Enterd in first condition");
                //     setStartButton("Start");
                //     setButtonEnabled(buttonState);  // Default button State
                // }
                // // This condition needs to be re-checked
                // // Coz it's not working properly, if we pause the time and refresh page.
                // else {
                //     console.log("Enterd in second condition");
                //     setStartButton("Resume");
                //     setButtonEnabled({ Start: true, Stop: false, Log: true, Reset: true });
                // }
                console.log("Enterd in second condition");
                setStartButton("Resume");
                setTime(fetchedTime);
                setSeconds(fetchedTime.d * 86400 + fetchedTime.h * 3600 + fetchedTime.m * 60 + fetchedTime.s);
                setIsRunning(false);
                setButtonEnabled({ Start: true, Stop: false, Log: true, Reset: true });
            }
        }
        fetchTime();
    }, []);

    // BUTTONS HANDLING FUNCTIONS. 
    async function handleStart() {
        console.log("handleStart Function Called now");

        if (!isRunning) {
            
            // If 'Start' button was clicked earlier
            // Then get 'newTime' in seconds and setSeconds(newTime);
            // let startButtonClickedBefore = await storage.get(uniqueKey);

            // Make this initialization during first render of Front-end.
      
            // setTime(fetchedTime);
            // setSeconds(fetchedTime.d * 86400 + fetchedTime.h * 3600 + fetchedTime.m * 60 + fetchedTime.s); 
            setIsRunning(true);
            setButtonEnabled({ Start: false, Stop: true, Log: true, Reset: true });
            setStartButton("Start");
            setPopUp(false);
            // If Start Button is clicked, Disable 'start' and enable all other three buttons
            // After hittin stop buttons, 'start' should become 'resume'
            // but after hitting 'resume', it should become 'start' again
            // Store current State of Time in Backend...
            try {
                invoke('SET TimeLog', { seconds }) // Store the current second in forge storage
                .then((data) => {
                        if(data.success) {
                            console.log("Data Stored in Backend");
                        }
                })
            } catch (error) {
                console.error('Error invoking function:', error);
            }
        }
    };

    async function handleStop() {
        if (isRunning) {
            console.log("Entered in handleStop function");
            setIsRunning(false);
            setStartButton("Resume");
            // If Stop Button is clicked, Disable 'Stop' and enable all other three buttons
            // Make Start Button as "Resume" Button
            setButtonEnabled({Start: true, Stop: false, Log: true, Reset: true });
            try {
                await invoke('UPDATE TimeLog', { seconds }); // Store updated time in forge storage
            } catch (error) {
                console.error('Error invoking function:', error);
            }
        }
    };

    async function handleReset() {
        setSeconds(0);
        setIsRunning(false);
        setStartButton("Start");
        // If Reset Button is clicked, Enable 'start' and diable all other three buttons
        setButtonEnabled({ Start: true, Stop: false, Log: false, Reset: false })
        // Delete the old Timer from Storage
        try {
            await invoke('RESET TimeLog');
        } catch (error) {
            console.error('Error invoking function:', error);
        }
    }

    async function handleLog() {

        // One can click Log button only, if the (current time != initialTime)
        if (time != initialTime) {
            console.log("Current time is: " + time.d + "days " + time.h + "hours " + time.m + "minutes " + time.s + "seconds ");
            // PopUp a react component
            // alert("Current time is: " + time.d + "days " + time.h + "hours  " + time.m + "minutes " + time.s + "seconds ");
            //  If Log Button is clicked, Reset the clock and enable 'start' button only
            handleReset();
            // Open Pop-up element
            setPopUp(true);
        }
        // Delete the old Timer from Storage
        try {
            await invoke('RESET TimeLog');
        } catch (error) {
            console.error('Error invoking function:', error);
        }
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