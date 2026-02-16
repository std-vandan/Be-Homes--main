import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import ProjectDetails from '../components/ProjectDetails';
import UpwardHead from "../components/UpwardHead";

const Quotation = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [drawings, setDrawings] = useState([]);
  const [finalDrawingId, setFinalDrawingId] = useState(null);
  const [quotedValue, setQuotedValue] = useState('');

  const navigate = useNavigate();

  // New function to only allow numbers (including decimals)
  const handleQuotedValueChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setQuotedValue(value);
    }
  };

  // Fetch the list of projects on component mount
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

  // Fetch project details when a project is selected
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProjectId) return;
      try {
        const response = await axios.get(`http://localhost:5000/project/view/${selectedProjectId}`);
        setProjectDetails(response.data.response);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [selectedProjectId]);

  // Fetch drawings (PDF files) from backend using the new endpoint
  useEffect(() => {
    const fetchDrawings = async () => {
      if (!selectedProjectId) return;
      try {
        // Updated backend endpoint
        const response = await axios.get(`http://localhost:5000/quotation/files/proj/${selectedProjectId}`);
        console.log('Fetched drawings:', response.data.files);
        setDrawings(response.data.files);

        // Set final drawing based on status property
        const finalDrawing = response.data.files.find(file => file.status === "Finalized");
        setFinalDrawingId(finalDrawing ? finalDrawing._id : null);
      } catch (error) {
        console.error('Error fetching drawings:', error);
      }
    };

    fetchDrawings();
  }, [selectedProjectId]);

  // Show modal with a message
  const showAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      showAlert('Error: Only one .pdf file is allowed for upload. Please remove the extra files.');
      return;
    }
    const filteredFiles = acceptedFiles.filter((file) =>
      file.name.toLowerCase().endsWith('.pdf')
    );
    if (filteredFiles.length === 0) {
      showAlert('Error: Only .pdf files are allowed.');
      return;
    }
    setUploadedFiles(filteredFiles);
    console.log('Accepted file:', filteredFiles);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      showAlert('Please select files to upload.');
      return;
    }

    if (!quotedValue.trim()) {
      showAlert('Please enter a quoted value.');
      return;
    }

    console.log('Quoted Value:', quotedValue);
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append('File', file);
    });
    formData.append('quotedValue', quotedValue);

    try {
      const response = await axios.post(
        `http://localhost:5000/quotation/upload/${selectedProjectId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log('Upload response:', response.data);
      showAlert('Files uploaded successfully!');
      
      setDrawings(prevDrawings => [
        ...prevDrawings,
        { 
          _id: response.data.newDrawingId,
          name: uploadedFiles[0].name,
          uploadDate: new Date().toISOString().split('T')[0],
          quotedValue: quotedValue
        }
      ]);
      
      navigate('/quotation');
    } catch (error) {
      console.error('Error uploading files:', error);
      showAlert('Failed to upload files.');
    }
  };

  // Download file function (for PDF download)
  const downloadDwg = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/quotation/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(d => d._id === id);
      link.href = url;
      link.setAttribute('download', drawing ? drawing.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // View file function
  const viewDrawing = (id) => {
    window.open(`http://localhost:5000/quotation/view/${id}`, '_blank');
  };

  // Mark drawing as final
  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5000/quotation/Finalized/${id}`);
      console.log('Mark as final response:', response.data);
      showAlert('Drawing marked as final successfully!');
      setFinalDrawingId(id);
    } catch (error) {
      console.error('Error marking drawing as final:', error);
      showAlert('Failed to mark drawing as final.');
    }
  };

  // Mark drawing as not final
  const markAsNotFinal = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5000/quotation/Not-Finalized/${id}`);
      console.log('Unmark final response:', response.data);
      showAlert('Drawing marked as not final successfully!');
      setFinalDrawingId(null);
    } catch (error) {
      console.error('Error marking drawing as not final:', error);
      showAlert('Failed to mark drawing as not final.');
    }
  };

  // Helper to truncate filename if too long
  const truncateFileName = (name, maxLength = 15) => {
    return name.length <= maxLength ? name : name.substring(0, maxLength) + '...';
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: '.pdf',
    multiple: false,
  });

  return (
    <>
      <div style={{ padding: '20px' }}>
        <UpwardHead pageTitle="Quotation" />

        {/* Dropdown to select project */}
        <div>
          <label htmlFor="projectSelect" className="project-form-label">Select Project: </label>
          <select
            id="projectSelect"
            className="project-form-control"
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

        {/* Display project details */}
        {projectDetails && (
          <ProjectDetails projectDetails={projectDetails} />
        )}

        {/* Dropzone for file upload */}
        {selectedProjectId && (
          <div className="col-md-12 mt-3">
            <div
              {...getRootProps()}
              className="drawing-dropzone"
              style={{
                border: '2px dashed #007bff',
                padding: '20px',
                borderRadius: '5px',
                background: '#f9f9f9',
              }}
            >
              <input {...getInputProps()} />
              <div className="dropzone-header" style={{ marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '5px' }}>Quotation Uploading</h4>
                <p style={{ margin: 0 }}>Upload your quotation file here:</p>
              </div>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="selected-file-info" style={{ marginTop: '10px' }}>
                <p>Selected File: {uploadedFiles[0].name}</p>
              </div>
            )}
            <input
              type="text"
              placeholder="Quoted Value"
              value={quotedValue}
              onChange={handleQuotedValueChange}
              className="mt-3 quoted-value-input form-control"
            />
            <button className="gradient-button" onClick={handleUpload}>
              Submit
            </button>
          </div>
        )}

        {/* Display list of drawings */}
        {drawings.length > 0 ? (
          <div className="drawing-list" style={{ marginTop: '20px' }}>
            <h5>Drawing Details</h5>
            <div className="table-container">
              <table className="">
                <thead>
                  <tr className="td-head">
                    <th>File Name</th>
                    <th>Upload Date</th>
                    <th>Quoted Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drawings.map((drawing) => (
                    <tr key={drawing._id}>
                      <td>{truncateFileName(drawing.name)}</td>
                      <td>{drawing.uploadDate || '-'}</td>
                      <td>{drawing.quotedValue || '-'}</td>
                      <td>
                        <button className="basic-btn" onClick={() => viewDrawing(drawing._id)}>
                          View
                        </button>
                        <button className="basic-btn" onClick={() => downloadDwg(drawing._id)}>
                          Download
                        </button>
                        <button 
                          className="mark-btn"
                          onClick={() =>
                            finalDrawingId === drawing._id
                              ? markAsNotFinal(drawing._id)
                              : markAsFinal(drawing._id)
                          }
                          disabled={finalDrawingId !== null && finalDrawingId !== drawing._id}
                        >
                          {finalDrawingId === drawing._id ? 'Unmark final' : 'Mark as final'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p>No drawings available for this project.</p>
        )}

        {/* Modal for alerts */}
        <Modal className="text-center" show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Notification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalMessage.includes('successfully') ? (
              <DotLottieReact
                src="https://lottie.host/62a299b2-0e9a-4bb9-b824-371659e36229/59MTRGn0fz.lottie"
                loop
                autoplay
              />
            ) : (
              <DotLottieReact
                src="https://lottie.host/b5e65dcb-a9e4-4fbd-ac80-a25aef4623df/EYBj6Kg9Kc.lottie"
                loop
                autoplay
              />
            )}
            {modalMessage}
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Quotation;
