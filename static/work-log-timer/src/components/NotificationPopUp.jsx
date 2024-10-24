import { useEffect, useState } from 'react';

function NotificationPopUp({ message, onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Decrease the progress over 5 seconds (5000ms)
    const interval = setInterval(() => {
      setProgress((prevProgress) => prevProgress - 1);
    }, 30);

    // Clear the interval when progress reaches 0 or when the pop-up is closed
    if (progress <= 0) {
      clearInterval(interval);
      onClose(); // Auto-close the pop-up when the progress reaches 0
    }

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, [progress, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '15px',
        right: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '10px 70px 10px 10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minHeight: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            position: 'absolute',
            right: '5px',
            top: '5px',
          }}
        >
          ✖
        </button>
      </div>

      {/* Progress bar at the bottom of the pop-up */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: `${progress}%`, // Dynamically update the width
          height: '5px',
          backgroundColor: '#0a66e4', // Color of the progress bar
          transition: 'width 0.05s linear', // Smooth transition for width
        }}
      />
    </div>
  );
}

export default NotificationPopUp;
