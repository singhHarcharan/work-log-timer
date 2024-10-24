import React from 'react';

function DescriptionPopup({ setPopUp }) {
  function onClose() {
    setPopUp(false);
  }
  return (
    <div
      className='popup'
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Translucent black background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '999',
      }}
    >
      <div
        className='popup-content'
        style={{
          width: '60%',
          height: '50%',
          backgroundColor: 'white', // White popup background
          padding: '20px',
          position: 'relative', // For positioning the close icon
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.5)', // Shadow for depth
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRadius: '5px',
        }}
      >
        {console.log('Entering in Description PopUP')}
        <h3 style={{ textAlign: 'left', marginLeft: '20px' }}>Description</h3>

        {/* Close (X) button */}
        <button
          className='close-button'
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#333',
          }}
        >
          &times;
        </button>

        <input
          type='text'
          placeholder='Work Log Description'
          style={{
            // width: 'calc(100% - 40px)', // Full width minus padding on both sides
            width: '90%',
            marginLeft: '20px',
            marginRight: '20px',
            padding: '10px',
            backgroundColor: '#f1f2f4',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            border: 'none',
          }}
        />
        <button
          className='submit-btn'
          style={{
            alignSelf: 'center',
            marginTop: '20px',
            backgroundColor: '#0a66e4',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default DescriptionPopup;
