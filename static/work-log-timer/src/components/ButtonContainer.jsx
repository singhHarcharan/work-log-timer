import { useEffect, useState } from 'react';
import './ButtonContainer.css';
import NotificationPopUp from './NotificationPopUp';

let normalButtonStyle = {
  backgroundColor: '#0a66e4',
  border: '.1rem solid #fff',
  borderRadius: '.3rem',
  color: '#fff',
  fontSize: '.9rem',
  maxWidth: '10rem',
  minWidth: '10rem',
  padding: '.48rem',
};
let disabledButtonStyle = {
  ...normalButtonStyle,
  backgroundColor: '#d3d3d3',
};

function ButtonContainer({
  startButton,
  handleStart,
  handleStop,
  handleReset,
  handleLog,
  isButtonEnabled,
}) {
  const [notificationPopUpMessage, setNotificationPopUpMessage] = useState('');
  const [showNotificationPopUp, setShowNotificationPopUp] = useState(false);

  let handleStartClick = () => {
    handleStart();
    setTimeout(() => {
      setNotificationPopUpMessage('Timer Started Successfully');
      setShowNotificationPopUp(true);
    }, 1000); // Show the pop-up after 1 second

    // Hide the pop-up after 5 seconds
    setTimeout(() => {
      setShowNotificationPopUp(false);
    }, 5000);
  };

  let handleStopClick = () => {
    handleStop();
    setTimeout(() => {
      setNotificationPopUpMessage('Timer Paused Successfully');
      setShowNotificationPopUp(true);
    }, 1000); // Show the pop-up after 1 second

    // Hide the pop-up after 5 seconds
    setTimeout(() => {
      setShowNotificationPopUp(false);
    }, 5000);
  };

  let closePopup = () => {
    setShowNotificationPopUp(false);
  };

  return (
    <div
      className='button-group'
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <button
        className='start-button'
        style={isButtonEnabled.Start ? normalButtonStyle : disabledButtonStyle}
        onClick={handleStartClick}
      >
        {startButton}
      </button>
      <button
        className='stop-button'
        style={isButtonEnabled.Stop ? normalButtonStyle : disabledButtonStyle}
        onClick={handleStopClick}
      >
        Stop
      </button>
      <button
        className='log-button'
        style={isButtonEnabled.Log ? normalButtonStyle : disabledButtonStyle}
        onClick={handleLog}
      >
        Log
      </button>
      <button
        className='reset-button'
        style={isButtonEnabled.Reset ? normalButtonStyle : disabledButtonStyle}
        onClick={handleReset}
      >
        Reset
      </button>
      <div>Developed by HS</div>

      {showNotificationPopUp && (
        <NotificationPopUp
          message={notificationPopUpMessage}
          onClose={closePopup}
        />
      )}
    </div>
  );
}

export default ButtonContainer;
