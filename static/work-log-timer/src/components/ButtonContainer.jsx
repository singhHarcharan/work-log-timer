import { useEffect, useState } from 'react';
import './ButtonContainer.css'

let normalButtonStyle = {
    backgroundColor: "#0a66e4",
    border: ".1rem solid #fff",
    borderRadius: ".3rem",
    color: "#fff",
    fontSize: ".9rem",
    maxWidth: "10rem",
    minWidth: "10rem",
    padding: ".48rem",
};
let disabledButtonStyle = {
    ...normalButtonStyle,
    backgroundColor: "#d3d3d3",
}

function ButtonContainer({ 
    startButton, 
    handleStart, 
    handleStop, 
    handleReset, 
    handleLog, 
    isButtonEnabled }) 
{
    return <div className='button-group' style={{
        display: 'flex',
        flexDirection:'column'
    }}>
        <button className='start-button' style={isButtonEnabled.Start? normalButtonStyle : disabledButtonStyle} onClick={handleStart} >
            {startButton}
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
        <div>
            Designed by HS
        </div>
    </div>
}

export default ButtonContainer;

