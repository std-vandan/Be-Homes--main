import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import DropZone from '../components/DropZone'; // Import the new Dropzone component
import ProjectDetails from '../components/ProjectDetails'; // Import the new ProjectDetails component
import UpwardHead from "../components/UpwardHead";

const Installation = () => {
  const [projects, setProjects] = useState([]); // List of projects
  const [selectedProjectId, setSelectedProjectId] = useState(''); // Selected project ID
  const [projectDetails, setProjectDetails] = useState(null); // Details of the selected project
  const [openAccordion, setOpenAccordion] = useState(false); // State to manage accordion open/close
  const [fileInputRef, setFileInputRef] = useState(null); // Ref for the file input
  const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [modalMessage, setModalMessage] = useState(''); // State to hold modal message
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const [drawings, setDrawings] = useState([]); // State to hold drawings for the selected project
  const [finalDrawingId, setFinalDrawingId] = useState(null); // State to track the currently marked final drawing

  // Fetch the list of projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://behomes-1.onrender.com/project/view'); // Update with your backend endpoint
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
        const response = await axios.get(`https://behomes-1.onrender.com/project/view/${selectedProjectId}`); // Update with your backend endpoint
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
        const response = await axios.get(`https://behomes-1.onrender.com/installation/files/proj/${selectedProjectId}`); // Update with your backend endpoint
        console.log('Fetched drawings:', response.data.files); // Log the fetched drawings
        setDrawings(response.data.files); // Assuming the response contains a 'files' array

        // Set the final drawing ID based on the fetched drawings
        const finalDrawing = response.data.files.find(drawing => drawing.status === "Finalized");
        if (finalDrawing) {
          setFinalDrawingId(finalDrawing._id); // Set the ID of the drawing that is marked as final
        } else {
          setFinalDrawingId(null); // No drawing is marked as final
        }
      } catch (error) {
        console.error('Error fetching drawings:', error);
      }
    };

    fetchDrawings();
  }, [selectedProjectId]);

  // Function to show modal with a message
  const showAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleDrop = (acceptedFiles) => {
    // Allow only one file
    if (acceptedFiles.length > 1) {
      showAlert('Error: Only one file is allowed for upload. Please remove the extra files.');
      return;
    }

    // Filter files to allow only .pdf, .jpg, .jpeg, and .png files
    const filteredFiles = acceptedFiles.filter((file) =>
      ['.pdf', '.jpg', '.jpeg', '.png'].some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      )
    );

    if (filteredFiles.length === 0) {
      showAlert('Error: Only .pdf, .jpg, .jpeg, and .png files are allowed.');
      return;
    }

    // Clear previous files and add the new one
    setUploadedFiles(filteredFiles);
    console.log('Accepted file:', filteredFiles);
};

  // Function to handle file upload
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      showAlert('Please select files to upload.');
      return;
    }

    const formData = new FormData();
    // Append the file with key "mainFile" matching the backend configuration
    uploadedFiles.forEach((file) => {
      formData.append('mainFile', file);
    });

    try {
      const response = await axios.post(`https://behomes-1.onrender.com/installation/upload/${selectedProjectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      showAlert('Files uploaded successfully!');
      // Optionally update drawings state
      setDrawings(prevDrawings => [
        ...prevDrawings,
        { 
          _id: response.data.newDrawingId, // Assuming backend returns new drawing ID
          name: uploadedFiles[0].name, 
          uploadDate: new Date().toISOString().split('T')[0], 
          status: "Not Finalized"
        }
      ]);
      navigate('/installation'); // Change route if necessary
    } catch (error) {
      console.error('Error uploading files:', error);
      showAlert('Failed to upload files.');
    }
  };

  // Function to download DWG file
  const downloadDwg = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/installation/download/${id}`, {
        responseType: 'blob', // Important for file download
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id); // Find the drawing by ID
      link.href = url;
      link.setAttribute('download', drawing ? drawing.name : 'download.pdf'); // Use the drawing name or fallback
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Function to view drawing
  const viewDrawing = (id) => {
    window.open(`https://behomes-1.onrender.com/installation/view/${id}`, '_blank'); // Update with your view endpoint
  };

  // Function to mark a drawing as final
  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/installation/Finalized/${id}`); // Update with your backend endpoint
      console.log('Mark as final response:', response.data);
      showAlert('Drawing marked as final successfully!');
      setFinalDrawingId(id); // Set the marked drawing ID as final
    } catch (error) {
      console.error('Error marking drawing as final:', error);
      showAlert('Failed to mark drawing as final.');
    }
  };

  // Function to mark a drawing as not final
  const markAsNotFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/installation/Not-Finalized/${id}`); // Update with your backend endpoint
      console.log('Unmark final response:', response.data);
      showAlert('Drawing marked as not final successfully!');
      setFinalDrawingId(null); // Reset the final drawing ID
    } catch (error) {
      console.error('Error marking drawing as not final:', error);
      showAlert('Failed to mark drawing as not final.');
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: '.pdf, .jpg, .jpeg, .png',
    multiple: false,
});

  return (
    <>
      <div style={{ padding: '20px' }}>
        <UpwardHead pageTitle="Installation" />

        {/* Dropdown to select project */}
        <div>
          <label htmlFor="projectSelect" className="project-form-label">Select Project: </label>
          <select
            id="projectSelect" className="project-form-control"
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

        {/* Conditionally render DropZone only when a project is selected */}
        {selectedProjectId && (
          <div className="col-md-12 mt-3">
            <DropZone title="Installation Uploading"
            filetype=" .pdf"
               uploadText=" Upload your installation file here:"
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
                    <th>Main Upload</th>
                    <th>Upload Date</th>
                    {/* <th>Status</th> */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drawings.map((drawing) => (
                    <tr key={drawing._id}>
                      <td>
                        {drawing.mainFile ? (
                          <div className="text-start">
                            <span>{drawing.mainFile.name}</span>
                            <br />
                            <button className="measure-btn" onClick={() => viewDrawing(drawing._id)}>
                              View
                            </button>
                            <button className="measure-btn" onClick={() => downloadDwg(drawing._id)}>
                              Download
                            </button>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {drawing.uploadDate ? new Date(drawing.uploadDate).toLocaleString() : '-'}
                      </td>
                      {/* <td>{drawing.status}</td> */}
                      <td>
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

        {/* Bootstrap Modal for alerts */}
        <Modal className="text-center" show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Notification</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Add Lottie animation based on the modal message */}
            {modalMessage.includes('successfully') ? ( // Check for success message
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

export default Installation;
