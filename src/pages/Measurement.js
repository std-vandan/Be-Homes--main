import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import ProjectDetails from '../components/ProjectDetails';
import UpwardHead from "../components/UpwardHead";

const Measurement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState([]);
  const [finalDrawingId, setFinalDrawingId] = useState(null);

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

  useEffect(() => {
    const fetchDrawings = async () => {
      if (!selectedProjectId) return;
  
      try {
        const response = await axios.get(`http://localhost:5000/measurement/files/proj/${selectedProjectId}`);
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
  
  const showAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleDrop = (acceptedFiles, type) => {
    if (acceptedFiles.length === 0) {
      showAlert('Error: No files were uploaded.');
      return;
    }
    
    // For non-pdf uploads, ensure a main file (.pdf or .dwg) exists
    if (type !== 'pdf' && !uploadedFiles.some(file =>
      file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.dwg')
    )) {
      showAlert('Please upload a main file (.pdf or .dwg) before uploading site images or videos.');
      return;
    }
    
    const filteredFiles = acceptedFiles.filter((file) => {
      if (type === 'pdf') {
        return file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.dwg');
      }
      if (type === 'image') {
        // Accept .jpg, .jpeg, and .png files
        return ['.jpg', '.jpeg', '.png'].some(ext => file.name.toLowerCase().endsWith(ext));
      }
      if (type === 'video') {
        return file.name.toLowerCase().endsWith('.mp4');
      }
      return false;
    });
    
    if (filteredFiles.length === 0) {
      showAlert(`Error: Only ${
        type === 'pdf' ? '.pdf and .dwg' : type === 'image' ? '.jpg, .jpeg and .png' : '.mp4'
      } files are allowed.`);
      return;
    }
    
    setUploadedFiles(prevFiles => [...prevFiles, ...filteredFiles]);
    console.log('Accepted files:', filteredFiles);
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      showAlert('Please select files to upload.');
      return;
    }
  
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.dwg')) {
        formData.append('Main_Upload', file);
      } else if (['.jpg', '.jpeg', '.png'].some(ext => file.name.toLowerCase().endsWith(ext))) {
        formData.append('Site_Pic', file);
      } else if (file.name.toLowerCase().endsWith('.mp4')) {
        formData.append('Site_Vid', file);
      }
    });
  
    try {
      const response = await axios.post(`http://localhost:5000/measurement/upload/${selectedProjectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      showAlert('Files uploaded successfully!');
  
      // Fetch the updated list of drawings
      const drawingsResponse = await axios.get(`http://localhost:5000/measurement/files/proj/${selectedProjectId}`);
      setDrawings(drawingsResponse.data.files);
  
      // Reset uploaded files
      setUploadedFiles([]);
  
      navigate('/measurement');
    } catch (error) {
      console.error('Error uploading files:', error);
      showAlert('Failed to upload files.');
    }
  };
  const downloadMainUpload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/measurement/download/MainUp/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.Main_Upload ? drawing.Main_Upload.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading main upload:', error);
    }
  };

  const downloadSitePic = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/measurement/download/SitePic/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.Site_Pic ? drawing.Site_Pic.name : 'download.jpg');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading site pic:', error);
    }
  };

  const downloadSiteVid = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/measurement/download/SiteVid/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.Site_Vid ? drawing.Site_Vid.name : 'download.mp4');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading site video:', error);
    }
  };

  const viewMainUpload = (id) => {
    window.open(`http://localhost:5000/measurement/view/MainUp/${id}`, '_blank');
  };
  
  const   viewSitePic = (id) => {
    window.open(`http://localhost:5000/measurement/view/SitePic/${id}`, '_blank');
  };
  
  const viewSiteVid = (id) => {
    window.open(`http://localhost:5000/measurement/view/SiteVid/${id}`, '_blank');
  };

  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5000/measurement/Finalized/${id}`);
      console.log('Mark as final response:', response.data);
      showAlert('Drawing marked as final successfully!');
      setFinalDrawingId(id);
    } catch (error) {
      console.error('Error marking drawing as final:', error);
      showAlert('Failed to mark drawing as final.');
    }
  };

  const markAsNotFinal = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5000/measurement/Finalized/${id}`);
      console.log('Unmark final response:', response.data);
      showAlert('Drawing marked as not final successfully!');
      setFinalDrawingId(null);
    } catch (error) {
      console.error('Error marking drawing as not final:', error);
      showAlert('Failed to mark drawing as not final.');
    }
  };

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'pdf'),
    accept: '.pdf, .dwg',
    multiple: true,
  });

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'image'),
    accept: '.jpg, .jpeg, .png',
    multiple: true,
  });

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'video'),
    accept: '.mp4',
    multiple: true,
  });

  const truncateFileName = (fileName) => {
    const words = fileName.split(' ');
    if (words.length > 2) {
      return `${words.slice(0, 2).join(' ')}...`;
    }
    return fileName;
  };

  return (
    <>
      <div style={{ padding: '20px' }}>
        <UpwardHead pageTitle="Measurement" />

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

        {projectDetails && (
          <ProjectDetails projectDetails={projectDetails} />
        )}

        {selectedProjectId && (
          <div className="mt-3 p-3 accordion-item">
            <label className="measurement-text" type="button" aria-expanded="true">Measurement Uploading</label>
            <div className="row">
              <div className="col-md-4">
                <p className="mt-3">Upload .pdf or .dwg file here:</p>
                <div className="drawing-dropzone" {...getPdfRootProps()}>
                  <input {...getPdfInputProps()} />
                  <p>Drag and drop .pdf or .dwg files here, or click to select files.</p>
                  <button className="gradient-button">Upload PDF/DWG files</button>
                </div>
                {uploadedFiles.filter(file => file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.dwg')).map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-4">
                <p className="mt-3">Upload site images here:</p>
                <div className="drawing-dropzone" {...getImageRootProps()}>
                  <input {...getImageInputProps()} />
                  <p>Drag and drop .jpg or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload Images</button>
                </div>
                {uploadedFiles.filter(file => ['.jpg', '.png'].some(ext => file.name.toLowerCase().endsWith(ext))).map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-4">
                <p className="mt-3">Upload video file here:</p>
                <div className="drawing-dropzone" {...getVideoRootProps()}>
                  <input {...getVideoInputProps()} />
                  <p>Drag and drop .mp4 files here, or click to select files.</p>
                  <button className="gradient-button">Upload Video</button>
                </div>
                {uploadedFiles.filter(file => file.name.toLowerCase().endsWith('.mp4')).map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
            </div>
            <button className="gradient-button" onClick={handleUpload}>Submit All Files</button>
          </div>
        )}

        {drawings.length > 0 ? (
          <div className="drawing-list" style={{ marginTop: '20px' }}>
            <h5>Drawing Details</h5>
            <div className="table-container">
              <table className="">
                <thead>
                  <tr className="td-head">
                    <th>Main Upload</th>
                    <th>Site Images</th>
                    <th>Site Videos</th>
                    <th>Upload Date</th>  {/* New column for upload date */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drawings.map((drawing) => {
                    if (!drawing) {
                      return null;
                    }
                    return (
                      <tr key={drawing._id}>
                        <td>
                          <div className="">
                            {drawing.Main_Upload && (
                              <div className="text-start">
                                <span>{truncateFileName(drawing.Main_Upload.name)}</span> <br/>
                                <button className="measure-btn" onClick={() => viewMainUpload(drawing._id)}>View</button>
                                <button className="measure-btn" onClick={() => downloadMainUpload(drawing._id)}>Download</button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {drawing.Site_Pic && (
                            <div className="text-start">
                              <span>{truncateFileName(drawing.Site_Pic.name)}</span> <br/>
                              <button className="measure-btn" onClick={() => viewSitePic(drawing._id)}>View</button>
                              <button className="measure-btn" onClick={() => downloadSitePic(drawing._id)}>Download</button>
                            </div>
                          )}
                        </td>
                        <td>
                          {drawing.Site_Vid && (
                            <div className="text-start" >
                              <span>{truncateFileName(drawing.Site_Vid.name)}</span> <br/>
                              <button className="measure-btn" onClick={() => viewSiteVid(drawing._id)}>View</button>
                              <button className="measure-btn" onClick={() => downloadSiteVid(drawing._id)}>Download</button>
                            </div>
                          )}
                        </td>
                        <td>
                          {drawing.uploadDate || '-'}
                        </td>
                        <td>
                          <button 
                            className="mark-btn"
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
        ) : (
          <p>No drawings available for this project.</p>
        )}

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

export default Measurement;