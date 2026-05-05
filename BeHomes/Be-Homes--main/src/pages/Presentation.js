import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import DropZone from '../components/DropZone'; // Import the DropZone component
import PdfList from '../components/PdfList'; // Import the PdfList component
import ProjectDetails from '../components/ProjectDetails'; // Import the ProjectDetails component
import UpwardHead from "../components/UpwardHead";

const Presentation = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(false);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState([]);
  const [finalDrawingId, setFinalDrawingId] = useState(null);

  // Fetch projects on component mount
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

  // Fetch project details when selectedProjectId changes
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

  // Fetch presentations (files) for the selected project
  useEffect(() => {
    const fetchDrawings = async () => {
      if (!selectedProjectId) return;
      try {
        const response = await axios.get(`https://behomes-1.onrender.com/presentation/files/proj/${selectedProjectId}`);
        console.log('Fetched files:', response.data.files);
        setDrawings(response.data.files);
        const finalFile = response.data.files.find(file => file.status === "Finalized");
        setFinalDrawingId(finalFile ? finalFile._id : null);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    fetchDrawings();
  }, [selectedProjectId]);

  // Show modal for alerts/debug messages
  const showAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Handle file drop – accepting .pdf, .png, .jpg, .jpeg
  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      showAlert('Error: Only one file is allowed for upload. Please remove extra files.');
      return;
    }

    const filteredFiles = acceptedFiles.filter((file) =>
      ['.pdf', '.png', '.jpg', '.jpeg'].some((ext) => file.name.toLowerCase().endsWith(ext))
    );

    if (filteredFiles.length === 0) {
      showAlert('Error: Only .pdf, .png, .jpg and .jpeg files are allowed.');
      return;
    }

    console.log('Accepted file(s):', filteredFiles);
    setUploadedFiles(filteredFiles);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedProjectId) {
      showAlert('Please select a project before uploading.');
      return;
    }

    if (uploadedFiles.length === 0) {
      showAlert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    // Append the file with key "File" matching the backend expectation
    uploadedFiles.forEach((file) => {
      formData.append('File', file);
    });

    console.log('Uploading file for project:', selectedProjectId);
    try {
      const response = await axios.post(
        `https://behomes-1.onrender.com/presentation/upload/${selectedProjectId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      console.log('Upload response:', response.data);
      showAlert('File uploaded successfully!');
      
      // Re-fetch the drawings to update the list of uploaded files
      const fetchDrawings = async () => {
        try {
          const res = await axios.get(`https://behomes-1.onrender.com/presentation/files/proj/${selectedProjectId}`);
          console.log('Fetched files after upload:', res.data.files);
          setDrawings(res.data.files);
          const finalFile = res.data.files.find(file => file.status === "Finalized");
          setFinalDrawingId(finalFile ? finalFile._id : null);
        } catch (error) {
          console.error('Error fetching files after upload:', error);
        }
      };
      await fetchDrawings();
      
      setUploadedFiles([]);
      // Optionally navigate or perform further actions
      navigate('/presentation');
    } catch (error) {
      console.error('Error uploading file:', error);
      showAlert('Failed to upload file.');
    }
  };

  // Download file function
  const downloadDwg = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/presentation/download/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const file = drawings.find(item => item._id === id);
      const fileName = file ? file.name : 'download';
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // View file function
  const viewDrawing = (id) => {
    window.open(`https://behomes-1.onrender.com/presentation/view/${id}`, '_blank');
  };

  // Mark file as final
  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/presentation/Finalized/${id}`);
      console.log('Mark as final response:', response.data);
      showAlert('File marked as final successfully!');
      setFinalDrawingId(id);
    } catch (error) {
      console.error('Error marking file as final:', error);
      showAlert('Failed to mark file as final.');
    }
  };

  // Mark file as not final
  const markAsNotFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/presentation/Not-Finalized/${id}`);
      console.log('Unmark final response:', response.data);
      showAlert('File marked as not final successfully!');
      setFinalDrawingId(null);
    } catch (error) {
      console.error('Error marking file as not final:', error);
      showAlert('Failed to mark file as not final.');
    }
  };

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: false,
  });

  return (
    <>
      <div style={{ padding: '20px' }}>
        <UpwardHead pageTitle="Presentation" />

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
        {projectDetails && <ProjectDetails projectDetails={projectDetails} />}

        {/* Render DropZone only when a project is selected */}
        {selectedProjectId && (
          <div className="col-md-12 mt-3">
            <DropZone 
              title="Presentation Uploading"
              filetype=" .pdf, .png, .jpg, .jpeg" 
              uploadText=" Upload your presentation file here:"
              getRootProps={getRootProps} 
              getInputProps={getInputProps} 
              uploadedFiles={uploadedFiles} 
              handleUpload={handleUpload} 
              showAlert={showAlert} 
            />
          </div>
        )}

        {/* Display list of uploaded files */}
        {drawings.length > 0 ? (
          <PdfList 
            drawings={drawings} 
            viewDrawing={viewDrawing} 
            downloadDwg={downloadDwg} 
            markAsFinal={markAsFinal} 
            markAsNotFinal={markAsNotFinal} 
            finalDrawingId={finalDrawingId} 
          />
        ) : (
          <p>No files available for this project.</p>
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
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Presentation;
