import React from 'react';
import ReactDOM from 'react-dom';

const SimpleModal = ({ isOpen, close, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={close}>
      <div style={{
        padding: '20px',
        background: '#fff',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '80%',
        maxWidth: '800px',
        margin: '20px',
        position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default SimpleModal;