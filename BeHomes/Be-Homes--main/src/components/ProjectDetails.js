import React from 'react';

const ProjectDetails = ({ projectDetails }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <div className="general-details-container mt-4">
        <h5>General Details</h5>
        <div className="row">
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Project Name: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.projectName || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Assigned To: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.assigned || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Client Name: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.clientName || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Email Address: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.emailAddress || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Phone Number: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.contactNumber || ''}
              readOnly
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Start Date: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.startDate || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">End Date: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.endDate || ''}
              readOnly
            />
          </div>
        </div>
        <h5 className="mt-3">Architect Details</h5>
        <div className="row">
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Architect Name: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.architectName || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Architect's Company Name: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.architectCompanyName || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Architect Phone Number: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.architectPhone || ''}
              readOnly
            />
          </div>
          <div className="col-md-6 mt-3">
            <label className="project-form-label">Architect Email: </label>
            <input className="form-control project-form-control"
              type="text"
              value={projectDetails.architectEmail || ''}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 