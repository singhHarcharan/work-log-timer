import { useEffect, useState } from 'react';
import './ButtonContainer.css'

// const [backendMessage, setBackendMessage] = useState('');
// useEffect(() => {
//     const result = fetch('http://localhost:5000/')
//     .then(
//         setBackendMessage(result))
// }, [])


// const result = await fetch('https://fakestoreapi.com/products');
// console.log(result)

function ButtonContainer({ 
    startButton, 
    handleStart, 
    handleStop, 
    handleReset, 
    handleLog, 
    isButtonEnabled }) 
{
    let normalButtonStyle = {
        backgroundColor: "#0a66e4",
        border: ".1rem solid #fff",
        borderRadius: ".3rem",
        color: "#fff",
        fontSize: ".9rem",
        maxWidth: "10rem",
        minWidth: "10rem",
        padding: ".58rem",
    };
    let disabledButtonStyle = {
        ...normalButtonStyle,
        backgroundColor: "#d3d3d3",
    }
    
    return <div className='button-group' style={{
        display: 'flex',
        flexDirection:'column'
    }}>
        <button className='start-button' style={isButtonEnabled.Start? normalButtonStyle : disabledButtonStyle} onClick={handleStart} >
            {startButton}
            {/* {backendMessage} */}
        </button>
        <button className='stop-button' style={isButtonEnabled.Stop? normalButtonStyle: disabledButtonStyle} onClick={handleStop} >
            Stop
        </button>
        <button className='log-button' style={isButtonEnabled.Log? normalButtonStyle: disabledButtonStyle} onClick={handleLog} >
            Log
        </button>
        <button className='reset-button' style={isButtonEnabled.Reset? normalButtonStyle: disabledButtonStyle} onClick={handleReset}>
            Reset
        </button>
    </div>
}

export default ButtonContainer;

