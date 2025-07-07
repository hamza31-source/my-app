import React from 'react';

export default function Alert(props) {
  const capitalize = (word) => {
    if (!word) return '';
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  return (
    props.alert && (
      <div
        className={`alert alert-${props.alert.type} fade ${
          props.visible ? 'show' : ''
        }`}
        role="alert"
        style={{ transition: 'opacity 0.5s ease' }}
      >
        <strong>{capitalize(props.alert.type)}</strong>: {props.alert.message}
      </div>
    )
  );
}
