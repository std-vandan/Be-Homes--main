import axios from 'axios';
import React, { useEffect, useState } from 'react';
import UpwardHead from "../components/UpwardHead";

const EditProject = () => {
  const [projects, setProjects] = useState([]); // State to store all projects
  const [selectedProjectId, setSelectedProjectId] = useState(''); // State to store the selected project ID
  const [editableProjectDetails, setEditableProjectDetails] = useState({
    projectName: '',
    projectType: '',
    startDate: '',
    endDate: '',
    assigned: '',
    fullAddress: '',
    pincode: '',
    city: '',
    clientName: '',
    emailAddress: '',
    contactNumber: '',
    referral: '',
    architectName: '',
    architectCompanyName: '',
    architectEmail: '',
    architectPhone: '',
    aboutProject: '',
    termsAndConditions: '',
    estimatedValue: '',
  }); // State to store editable project details

  // Fetch all projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/project/view');
        setProjects(response.data.Datas);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch("http://localhost:5000/user/manager");
        if (!response.ok) {
          throw new Error("Failed to fetch managers");
        }
        const data = await response.json();
        setManagers(data.files);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  // Fetch project details when a project is selected
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProjectId) return;

      try {
        const response = await axios.get(`http://localhost:5000/project/view/${selectedProjectId}`);
        setEditableProjectDetails(response.data.response);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [selectedProjectId]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditableProjectDetails(prevDetails => ({
      ...prevDetails,
      [field]: value
    }));
  };

  // Handle submit for updates using PATCH method
  const handleSubmit = async () => {
    try {
      const response = await axios.patch(`http://localhost:5000/project/update/${selectedProjectId}`, editableProjectDetails);
      console.log('Update response:', response.data);
      alert('Project details updated successfully!');
    } catch (error) {
      console.error('Error updating project details:', error);
      alert('Failed to update project details.');
    }
  };

  return (
    <>
      <div className="padd-common-16">
        <UpwardHead pageTitle="Edit Project" />
        <div>
          <label htmlFor="projectSelect">Select Project: </label>
          <select
            className="project-form-control"
            id="projectSelect"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">-- Select a Project --</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>

        {editableProjectDetails && (
          <div>
            <div className="row">
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="projectName">
                  Project Name:
                </label>
                <input
                  className="form-control project-form-control"
                  id="projectName"
                  type="text"
                  value={editableProjectDetails.projectName || ''}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="projectType">
                  Project Type:
                </label>
                <select
                  className="project-form-control"
                  id="projectType"
                  value={editableProjectDetails.projectType || ''}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                >
                  <option value="">-- Select Project Type --</option>
                  <option value="Residential">Residential</option>
                  <option value="Office">Office</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Retail">Retail</option>
                  <option value="Hospitality">Hospitality</option>
                </select>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="row">
           
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="startDate">
                  Start Date:
                </label>
                <input
                  className="form-control project-form-control"
                  id="startDate"
                  type="date"
                  value={editableProjectDetails.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="endDate">
                  End Date:
                </label>
                <input
                  className="form-control project-form-control"
                  id="endDate"
                  type="date"
                  value={editableProjectDetails.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
              <div className="col-md-12 mt-3">
                <label className="project-form-label" htmlFor="fullAddress">
                  Address:
                </label>
                <textarea
                  className="project-form-control"
                  id="fullAddress"
                  value={editableProjectDetails.fullAddress || ''}
                  onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                  rows="2"
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="pincode">
                  Pincode:
                </label>
                <input
                  className="form-control project-form-control"
                  id="pincode"
                  type="text"
                  value={editableProjectDetails.pincode || ''}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="city">
                  City:
                </label>
                <input
                  className="form-control project-form-control"
                  id="city"
                  type="text"
                  value={editableProjectDetails.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="assigned">
                  Assigned To:
                </label>
                <select
                  className="project-form-control"
                  id="assigned"
                  value={editableProjectDetails.assigned || ''}
                  onChange={(e) => handleInputChange('assigned', e.target.value)}
                >
                  <option value="">-- Select Manager --</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager.username}>
                      {manager.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="estimatedValue">
                  Estimated Value:
                </label>
                <input
                  className="form-control project-form-control"
                  id="estimatedValue"
                  type="text"
                  value={editableProjectDetails.estimatedValue || ''}
                  onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="clientName">
                  Client Name:
                </label>
                <input
                  className="form-control project-form-control"
                  id="clientName"
                  type="text"
                  value={editableProjectDetails.clientName || ''}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="clientEmail">
                  Client Email:
                </label>
                <input
                  className="form-control project-form-control"
                  id="clientEmail"
                  type="email"
                  value={editableProjectDetails.emailAddress || ''}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="clientPhone">
                  Client Phone:
                </label>
                <input
                  className="form-control project-form-control"
                  id="clientPhone"
                  type="text"
                  value={editableProjectDetails.contactNumber || ''}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="referral">
                  Referred By:
                </label>
                <input
                  className="form-control project-form-control"
                  id="referral"
                  type="text"
                  value={editableProjectDetails.referral || ''}
                  onChange={(e) => handleInputChange('referral', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="architectName">
                  Architect Name:
                </label>
                <input
                  className="form-control project-form-control"
                  id="architectName"
                  type="text"
                  value={editableProjectDetails.architectName || ''}
                  onChange={(e) => handleInputChange('architectName', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="architectCompanyName">
                  Company Name:
                </label>
                <input
                  className="form-control project-form-control"
                  id="architectCompanyName"
                  type="text"
                  value={editableProjectDetails.architectCompanyName || ''}
                  onChange={(e) => handleInputChange('architectCompanyName', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="architectEmail">
                  Architect Email:
                </label>
                <input
                  className="form-control project-form-control"
                  id="architectEmail"
                  type="email"
                  value={editableProjectDetails.architectEmail || ''}
                  onChange={(e) => handleInputChange('architectEmail', e.target.value)}
                />
              </div>
              <div className="col-md-6 mt-3">
                <label className="project-form-label" htmlFor="architectPhone">
                  Architect Phone:
                </label>
                <input
                  className="form-control project-form-control"
                  id="architectPhone"
                  type="text"
                  value={editableProjectDetails.architectPhone || ''}
                  onChange={(e) => handleInputChange('architectPhone', e.target.value)}
                />
              </div>
              <div className="col-md-12 mt-3">
                <label className="project-form-label" htmlFor="aboutProject">
                  About Project:
                </label>
                <textarea
                  className="project-form-control"
                  id="aboutProject"
                  value={editableProjectDetails.aboutProject || ''}
                  onChange={(e) => handleInputChange('aboutProject', e.target.value)}
                  rows="4"
                />
              </div>
              <div className="col-md-12 mt-3">
                <label className="project-form-label" htmlFor="termsAndConditions">
                  Terms and Conditions:
                </label>
                <textarea
                  className="project-form-control"
                  id="termsAndConditions"
                  value={editableProjectDetails.termsAndConditions || ''}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                  rows="4"
                />
              </div>
            </div>

            <button className="gradient-button" onClick={handleSubmit}>
              Update Project
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default EditProject;