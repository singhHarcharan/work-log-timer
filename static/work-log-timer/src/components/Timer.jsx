import ButtonContainer from './ButtonContainer';
import { FiRefreshCw } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';
import DescriptionPopup from './DescriptionPopup';
import { invoke, view } from '@forge/bridge';

let initialTime = {
  d: 0,
  h: 0,
  m: 0,
  s: 0,
};

function secondsToTimeFormat(seconds) {
  if (seconds === 0) return initialTime; // Ensure to return valid initial time
  const days = Math.floor(seconds / 86400); // 1 day = 86400 seconds
  const hours = Math.floor((seconds % 86400) / 3600); // 1 hour = 3600 seconds
  const minutes = Math.floor((seconds % 3600) / 60); // 1 minute = 60 seconds
  const sec = Math.floor(seconds % 60); // Remaining seconds
  return {
    d: days,
    h: hours,
    m: minutes,
    s: sec,
  };
}

const buttonState = {
  Start: true,
  Stop: false,
  Log: false,
  Reset: false,
};

// Check if the TimeLog is already present in Forge Storage
const isTimePresent = async () => {
  console.log('Entered in isTimePresent function');
  let isPresent = false;
  try {
    isPresent = await invoke('isTimeLogPresent');
  } catch (error) {
    console.error('Error invoking function:', error);
  }
  return isPresent;
};

// const timeToDisplay = async () => {
//     let timeStored = 0;
//     if (await isTimePresent()) {  // Await isTimePresent
//         try {
//             const { timeToDisplay, isRunning } = await invoke('GET TimeLog'); // Fetch both time and running status
//             timeStored = timeToDisplay;
//             return { time: secondsToTimeFormat(timeStored), isRunning };
//         } catch (error) {
//             console.error('Error invoking function:', error);
//         }
//     }
//     return { time: initialTime, isRunning: false };
// };

const timeToDisplay = () => {
  let timeStored = 0;

  // Check if time is present
  return isTimePresent().then((isPresent) => {
    if (isPresent) {
      // If time is present, invoke the 'GET TimeLog' function
      return invoke('GET TimeLog')
        .then(({ timeToDisplay, isRunning }) => {
          timeStored = timeToDisplay;
          return { time: secondsToTimeFormat(timeStored), isRunning };
        })
        .catch((error) => {
          console.error('Error invoking function:', error);
          // You may return a default value or rethrow the error as needed
          return { time: initialTime, isRunning: false }; // Handle error
        });
    }
    return { time: initialTime, isRunning: false }; // If time is not present
  });
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
  const [startButton, setStartButton] = useState('Start');
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
  }, [seconds]);

  // When 'Browser' is re-loaded and some entry of 'time' was there in storage
  // Fetch the time from forge storage...
  useEffect(() => {
    async function fetchTime() {
      // const { time: fetchedTime, isRunning: wasRunning }
      timeToDisplay().then(({ time: fetchedTime, isRunning: wasRunning }) => {
        // If 'timer' was running at the backend
        if (wasRunning) {
          // Reverse conversion from 'time format' to 'seconds'
          setSeconds(
            fetchedTime.d * 86400 +
              fetchedTime.h * 3600 +
              fetchedTime.m * 60 +
              fetchedTime.s
          );
          setIsRunning(true);
          setStartButton('Start');
          setButtonEnabled({
            Start: false,
            Stop: true,
            Log: true,
            Reset: true,
          });
        }
        // If 'timer' was 'paused'
        else {
          // If (initialTime != fetchedTime),  then it means time was paused and now it needs to be resumed.
          // So, we need to set the start button to 'Resume' and disable the 'Stop
          if (fetchedTime != initialTime) {
            let storedSeconds =
              fetchedTime.d * 86400 +
              fetchedTime.h * 3600 +
              fetchedTime.m * 60 +
              fetchedTime.s;
            setSeconds(storedSeconds);
            setTime(fetchedTime);
            setIsRunning(false);
            setStartButton('Resume');
            setButtonEnabled({
              Start: true,
              Stop: false,
              Log: true,
              Reset: true,
            });
          }
          // IF Clock is 00 : 00 : 00 : 00
          // No need to do anything extra, useState will automatically handle it.
        }
      });
    }
    fetchTime();
  }, []);

  // BUTTONS HANDLING FUNCTIONS.
  async function handleStart() {
    console.log('handleStart Function Called now');

    let accountId = undefined;
    let issueId = undefined;
    let projectId = undefined;

    await view.getContext()
    .then((context) => {
      let { extension } = context;
      console.log("Extension at frontend is", extension);
      
      accountId = context.accountId;
      issueId = extension.issue?.id;
      projectId = extension.project?.id;
      console.log("account id is ", accountId);
      console.log("Issue id is", issueId);
      console.log("Project Id is", projectId)
    })
    // console.log(payload);
    // console.log("Account id at frontend is", payload.accountId);
    // console.log("Issue id at frontend is", payload.extension.issueId);
    // Printing into json format


    if (!isRunning) {
      // If 'Start' button was clicked earlier
      // Then get 'newTime' in seconds and setSeconds(newTime);
      // let startButtonClickedBefore = await storage.get(uniqueKey);

      // Make this initialization during first render of Front-end.
      setIsRunning(true);
      setButtonEnabled({ Start: false, Stop: true, Log: true, Reset: true });
      setStartButton('Start');
      setPopUp(false);

      // If Start Button is clicked, Disable 'start' and enable all other three buttons
      // After hittin stop buttons, 'start' should become 'resume'
      // but after hitting 'resume', it should become 'start' again
      // Store current State of Time in Backend...
      try {
        invoke('SET TimeLog', { seconds })
          .then(() => {
            console.log('Data Stored in Backend');
          })
          .catch((error) => {
            console.error('Error in .then():', error);
          });
      } catch (error) {
        console.error('Error invoking function:', error);
      }
    }
  }

  async function handleStop() {
    if (isRunning) {
      console.log('Entered in handleStop function');
      setIsRunning(false);
      setStartButton('Resume');
      // If Stop Button is clicked, Disable 'Stop' and enable all other three buttons
      // Make Start Button as "Resume" Button
      setButtonEnabled({ Start: true, Stop: false, Log: true, Reset: true });
      try {
        let elapsedTimeLog = Math.floor(new Date().getTime() / 1000);
        await invoke('UPDATE TimeLog', { elapsedTimeLog }); // Store updated time in forge storage
      } catch (error) {
        console.error('Error invoking function:', error);
      }
    }
  }

  async function handleReset() {
    setSeconds(0);
    setIsRunning(false);
    setStartButton('Start');
    // If Reset Button is clicked, Enable 'start' and diable all other three buttons
    setButtonEnabled({ Start: true, Stop: false, Log: false, Reset: false });
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
      console.log(
        'Current time is: ' +
          time.d +
          'days ' +
          time.h +
          'hours ' +
          time.m +
          'minutes ' +
          time.s +
          'seconds '
      );
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

  return (
    <div>
      <div
        className='main-container'
        style={{
          display: 'flex',
          height: '100vh',
        }}
      >
        <div
          className='timer-panel'
          style={{
            maxWidth: '28rem',
            minWidth: '28rem',
            height: '57%',
            backgroundColor: '#f1f2f4',
            borderRadius: '10px',
            fontSize: '2rem',
            fontWeight: '700',
            position: 'relative',
            display: 'flex', // This centers the text inside the box
            justifyContent: 'center', // Horizontally centers text
            alignItems: 'center', // Vertically centers text
          }}
        >
          <div className='timer-bar'>
            {' '}
            {time.d}d {time.h}h {time.m}m {time.s}s{' '}
          </div>
          <div className='refresh-button'>
            <FiRefreshCw
              style={{
                position: 'absolute',
                top: '5%',
                right: '2%',
                color: 'grey',
              }}
            />
          </div>
        </div>
        <div
          className='button-panel'
          style={{
            height: '57%',
            marginLeft: '5px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            className='button-group'
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ButtonContainer
              {...{
                startButton,
                handleStart,
                handleStop,
                handleReset,
                handleLog,
                isButtonEnabled,
              }}
            />
            {/* Short form of ternary operator */}
            {popUp && <DescriptionPopup {...{ setPopUp }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer;
