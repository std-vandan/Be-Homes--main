import React from 'react';

const DrawingList = ({ drawings, viewDrawing, downloadDwg, markAsFinal, markAsNotFinal, finalDrawingId }) => {
  return (
    <div className="drawing-list" style={{ marginTop: '20px' }}>
      <h5>Drawing Details</h5>
      <div className="table-container">
        <table className="">
          <thead>
            <tr className="td-head">
              <th>Drawing File</th>
              <th>Drawing Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drawings.map((drawing) => {
              if (!drawing || !drawing.name) {
                return null;
              }
              return (
                <tr key={drawing._id}>
                  <td>{drawing.name}</td>
                  <td>{drawing.uploadDate}</td>
                  <td>
                    <button className="basic-btn" onClick={() => viewDrawing(drawing._id)}>View</button>
                    <button className="basic-btn" onClick={() => downloadDwg(drawing._id)}>Download</button>
                    <button 
                      className="basic-btn"
                      onClick={() => finalDrawingId === drawing._id ? markAsNotFinal(drawing._id) : markAsFinal(drawing._id)} 
                      disabled={finalDrawingId !== null && finalDrawingId !== drawing._id} // Disable if another drawing is final
                    >
                      {finalDrawingId === drawing._id ? 'Unmark final' : 'Mark as final'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DrawingList;