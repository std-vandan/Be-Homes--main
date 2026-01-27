import React from 'react';

const DashCard = ({ title, image, counter }) => {
  return (
    <div className="dash-card">
      <div className="d-flex justify-content-between align-items-center">
        <div className="dash-card-title">{title}</div>
        <div className="dash-card-icon">
          <img src={image} alt={title} />
        </div>
      </div>
      <div className="counter">
        {counter}
      </div>
    </div>
  );
};

export default DashCard; 