import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import DropZone from '../components/DropZone'; // Import your Dropzone component
import ProjectDetails from '../components/ProjectDetails'; // Import your ProjectDetails component
import UpwardHead from "../components/UpwardHead";

const BasicDrawing = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(''); // Selected project ID
  const [projectDetails, setProjectDetails] = useState(null); // Details of the selected project
  const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files
  const [showModal, setShowModal] = useState(false); // State for modal
  const [modalMessage, setModalMessage] = useState(''); // Modal message
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState([]); // Drawings for the project
  const [finalDrawingId, setFinalDrawingId] = useState(null); // ID of the final drawing

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://behomes-1.onrender.com/project/view');
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
        const response = await axios.get(`https://behomes-1.onrender.com/project/view/${selectedProjectId}`);
        setProjectDetails(response.data.response);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };
    fetchProjectDetails();
  }, [selectedProjectId]);

  // Fetch drawings when a project is selected
  useEffect(() => {
    const fetchDrawings = async () => {
      if (!selectedProjectId) return;
      try {
        const response = await axios.get(`https://behomes-1.onrender.com/basicDrawing/files/proj/${selectedProjectId}`);
        console.log('Fetched drawings:', response.data.files);
        setDrawings(response.data.files);
        const finalDrawing = response.data.files.find(drawing => drawing.status === "Finalized");
        if (finalDrawing) {
          setFinalDrawingId(finalDrawing._id);
        } else {
          setFinalDrawingId(null);
        }
      } catch (error) {
        console.error('Error fetching drawings:', error);
      }
    };
    fetchDrawings();
  }, [selectedProjectId]);

  // Show modal alert
  const showAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Handle file drop
  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      showAlert('Error: Only one file is allowed for upload. Please remove the extra files.');
      return;
    }
  
    const filteredFiles = acceptedFiles.filter((file) =>
      ['.dwg', '.dxf', '.prt', '.pdf'].some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  
    if (filteredFiles.length === 0) {
      showAlert('Only .dwg, .dxf, .prt and .pdf files are allowed.');
      return;
    }
  
    // Allow one file only
    setUploadedFiles([filteredFiles[0]]);
    console.log('Accepted file:', filteredFiles[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      showAlert('Please select a file to upload.');
      return;
    }
  
    const formData = new FormData();
    formData.append('File', uploadedFiles[0]);
  
    try {
      const response = await axios.post(
        `https://behomes-1.onrender.com/basicDrawing/upload/${selectedProjectId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log('Upload response:', response.data);
      showAlert('File uploaded successfully!');
  
      // Update drawings with the new drawing. Note: using "name" field as per backend schema.
      setDrawings(prevDrawings => [
        ...prevDrawings,
        { 
          _id: response.data.newDrawingId,
          name: uploadedFiles[0].name, // Use the file name from the uploaded file
          createdDate: new Date().toISOString().split('T')[0],
          status: "Not-Finalized"
        }
      ]);
  
      // Reset file state
      setUploadedFiles([]);
      navigate('/basic-drawing');
    } catch (error) {
      console.error('Error uploading file:', error);
      showAlert('Failed to upload file.');
    }
  };

  // Download drawing
  const downloadDwg = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/basicDrawing/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Use drawing.name for download filename
      const drawing = drawings.find((d) => d._id === id);
      const fileName = drawing?.name || 'download';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // View drawing
  const viewDrawing = (id) => {
    window.open(`https://behomes-1.onrender.com/basicDrawing/view/${id}`, '_blank');
  };

  // Mark drawing as final
  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/basicDrawing/Finalized/${id}`);
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
      const response = await axios.post(`https://behomes-1.onrender.com/basicDrawing/Not-Finalized/${id}`);
      console.log('Unmark final response:', response.data);
      showAlert('Drawing marked as not final successfully!');
      setFinalDrawingId(null);
    } catch (error) {
      console.error('Error marking drawing as not final:', error);
      showAlert('Failed to mark drawing as not final.');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: '.dwg,.dxf,.prt,.pdf',
    multiple: false,
  });

  return (
    <>
      <div style={{ padding: '20px' }}>
        <UpwardHead pageTitle="Basic Drawing" />
  
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
          <div style={{ marginTop: '20px' }}>
            <ProjectDetails projectDetails={projectDetails} />
  
            {/* Conditionally render DropZone only when a project is selected */}
            {selectedProjectId && (
              <div className="col-md-12 mt-3">
                <DropZone
                  title="Drawing Uploading"
                  filetype=" .dwg, .dxf, .prt and .pdf  "
                  uploadText=" Upload your basic drawing file here:"
                  getRootProps={getRootProps}
                  getInputProps={getInputProps}
                  uploadedFiles={uploadedFiles}
                  handleUpload={handleUpload}
                  showAlert={showAlert}
                />
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
                        <th>Drawing File</th>
                        <th>Drawing Upload Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drawings.map((drawing) => (
                        <tr key={drawing._id}>
                          <td>
                            {drawing.name}
                          </td>
                          <td>{drawing.createdDate}</td>
                          <td>
                            <button className="basic-btn" onClick={() => viewDrawing(drawing._id)}>View</button>
                            <button className="basic-btn" onClick={() => downloadDwg(drawing._id)}>Download</button>
                            <button 
                              className="basic-btn"
                              onClick={() => finalDrawingId === drawing._id ? markAsNotFinal(drawing._id) : markAsFinal(drawing._id)}
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
          </div>
        )}
  
        {/* Bootstrap Modal for alerts */}
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
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default BasicDrawing;
