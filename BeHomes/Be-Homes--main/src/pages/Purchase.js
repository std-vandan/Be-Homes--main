import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import ProjectDetails from '../components/ProjectDetails';
import UpwardHead from "../components/UpwardHead";

const Purchase = () => {
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
        const response = await axios.get('https://behomes-1.onrender.com/project/view');
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
        const response = await axios.get(`https://behomes-1.onrender.com/project/view/${selectedProjectId}`);
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
        const response = await axios.get(`https://behomes-1.onrender.com/purchase/files/proj/${selectedProjectId}`);
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
  
    let allowedFiles = [];
    // For mainFile and hw, explicitly allow .pdf, .jpg, .jpeg, and .png files
    if (type === 'mainFile' || type === 'hw') {
      allowedFiles = acceptedFiles.filter(file =>
        file.name.toLowerCase().endsWith('.pdf') ||
        file.name.toLowerCase().endsWith('.jpg') ||
        file.name.toLowerCase().endsWith('.jpeg') ||
        file.name.toLowerCase().endsWith('.png')
      );
    } else if (['wooden', 'lights', 'accessories', 'challan', 'invoice', 'elevation', 'section', 'iso'].includes(type)) {
      // For image-related fields, allow files whose type starts with 'image/' or pdfs
      allowedFiles = acceptedFiles.filter(file =>
        file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.pdf')
      );
    } else if (type === 'main') {
      // Fallback for "main" (if used) to allow pdf, dwg and image files
      allowedFiles = acceptedFiles.filter(file =>
        file.name.toLowerCase().endsWith('.pdf') ||
        file.name.toLowerCase().endsWith('.dwg') ||
        file.type.startsWith('image/')
      );
    }
  
    if (allowedFiles.length === 0) {
      showAlert(`Error: Only allowed files were uploaded for ${type}.`);
      return;
    }
    
    allowedFiles.forEach(file => file.uploadType = type);
    setUploadedFiles(prev => [...prev, ...allowedFiles]);
    console.log(`Accepted ${type} files:`, allowedFiles);
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      showAlert('Please select files to upload.');
      return;
    }
  
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      if (file.uploadType === 'mainFile' &&
          (file.name.toLowerCase().endsWith('.pdf') || 
           file.name.toLowerCase().endsWith('.png') || 
           file.name.toLowerCase().endsWith('.jpg') ||
           file.name.toLowerCase().endsWith('.jpeg'))) {
        formData.append('mainFile', file);
      } else if (file.uploadType === 'hw' &&
                 (file.name.toLowerCase().endsWith('.jpg') ||
                  file.name.toLowerCase().endsWith('.jpeg') ||
                  file.name.toLowerCase().endsWith('.png') ||
                  file.name.toLowerCase().endsWith('.pdf'))) {
        formData.append('hw', file);
      } else if (file.uploadType === 'wooden' &&
                 (file.name.toLowerCase().endsWith('.jpg') ||
                  file.name.toLowerCase().endsWith('.jpeg') ||
                  file.name.toLowerCase().endsWith('.png') ||
                  file.name.toLowerCase().endsWith('.pdf'))) {
        formData.append('wooden', file);
      } else if (file.uploadType === 'lights' &&
                 (file.name.toLowerCase().endsWith('.jpg') ||
                  file.name.toLowerCase().endsWith('.jpeg') ||
                  file.name.toLowerCase().endsWith('.png') ||
                  file.name.toLowerCase().endsWith('.pdf'))) {
        formData.append('lights', file);
      } else if (file.uploadType === 'accessories' &&
                 (file.name.toLowerCase().endsWith('.jpg') ||
                  file.name.toLowerCase().endsWith('.jpeg') ||
                  file.name.toLowerCase().endsWith('.png') ||
                  file.name.toLowerCase().endsWith('.pdf'))) {
        formData.append('accessories', file);
      }
    });
  
    try {
      const response = await axios.post(
        `https://behomes-1.onrender.com/purchase/upload/${selectedProjectId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Upload response:', response.data);
      showAlert('Files uploaded successfully!');
  
      // Fetch the updated list of drawings
      const drawingsResponse = await axios.get(
        `https://behomes-1.onrender.com/purchase/files/proj/${selectedProjectId}`
      );
      setDrawings(drawingsResponse.data.files);
  
      // Reset uploaded files
      setUploadedFiles([]);
  
      navigate('/purchase');
    } catch (error) {
      console.error('Error uploading files:', error);
      showAlert('Failed to upload files.');
    }
  };




  const downloadWooden = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/purchase/download/wooden/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.wooden ? drawing.wooden.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading wooden file:', error);
    }
  };

  const downloadMainFile = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/purchase/download/mainFile/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.mainFile ? drawing.mainFile.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading main file:', error);
    }
  };

  const downloadHw = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/purchase/download/hw/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.hw ? drawing.hw.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading hardware file:', error);
    }
  };

  const downloadLights = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/purchase/download/lights/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.lights ? drawing.lights.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading lights file:', error);
    }
  };

  const downloadAccessories = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/purchase/download/accessories/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.accessories ? drawing.accessories.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading accessories file:', error);
    }
  };

  // const viewMainUpload = (id) => {
  //   // window.open(`https://behomes-1.onrender.com/purchase/view/MainUp/${id}`, '_blank');
  // };
  
  // const viewSitePic = (id) => {
  //   window.open(`https://behomes-1.onrender.com/purchase/view/SitePic/${id}`, '_blank');
  // };
  
  const viewWooden = (id) => {
    window.open(`https://behomes-1.onrender.com/purchase/view/Wooden/${id}`, '_blank');
  };

  const viewMainFile = (id) => {
    window.open(`https://behomes-1.onrender.com/purchase/view/mainFile/${id}`, '_blank');
  };
  
  const viewHw = (id) => {
    window.open(`https://behomes-1.onrender.com/purchase/view/hw/${id}`, '_blank');
  };
  
  const viewLights = (id) => {
    window.open(`https://behomes-1.onrender.com/purchase/view/lights/${id}`, '_blank');
  };
  
  const viewAccessories = (id) => {
    window.open(`https://behomes-1.onrender.com/purchase/view/accessories/${id}`, '_blank');
  };

  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/purchase/Finalized/${id}`);
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
      const response = await axios.post(`https://behomes-1.onrender.com/purchase/Finalized/${id}`);
      console.log('Unmark final response:', response.data);
      showAlert('Drawing marked as not final successfully!');
      setFinalDrawingId(null);
    } catch (error) {
      console.error('Error marking drawing as not final:', error);
      showAlert('Failed to mark drawing as not final.');
    }
  };

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'mainFile'),
    accept: '.pdf, .jpg, .jpeg, .png',
    multiple: true,
  });

  const { getRootProps: getHardwareRootProps, getInputProps: getHardwareInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'hw'),
    accept: '.jpg, .jpeg, .png, .pdf',
    multiple: true,
  });

  const { getRootProps: getWoodenRootProps, getInputProps: getWoodenInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'wooden'),
    accept: '.jpg, .jpeg, .png, .pdf', // now accepts all images plus pdf
    multiple: true,
  });

  const { getRootProps: getLightsRootProps, getInputProps: getLightsInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'lights'),
    accept: '.jpg, .jpeg, .png, .pdf',
    multiple: true,
  });
  
  const { getRootProps: getAccessoriesRootProps, getInputProps: getAccessoriesInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'accessories'),
    accept: '.jpg, .jpeg, .png, .pdf',
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
        <UpwardHead pageTitle="Purchase " />

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
            <label className="measurement-text" type="button" aria-expanded="true">Purchase Uploading</label>
            <div className="row">
              <div className="col-md-3">
                <p className="mt-3">Upload .pdf or image file (Main Upload):</p>
                <div className="drawing-dropzone" {...getPdfRootProps()}>
                  <input {...getPdfInputProps()} />
                  <p>Drag and drop .pdf or .dwg files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'mainFile').map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
  
              <div className="col-md-3">
                <p className="mt-3">Upload hardware images here:</p>
                <div className="drawing-dropzone" {...getHardwareRootProps()}>
                  <input {...getHardwareInputProps()} />
                  <p>Drag and drop .jpg, .png or .pdf files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'hw').map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
  
              <div className="col-md-3">
                <p className="mt-3">Upload wooden here:</p>
                <div className="drawing-dropzone" {...getWoodenRootProps()}>
                  <input {...getWoodenInputProps()} />
                  <p>Drag and drop .jpg, .png or .pdf files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'wooden').map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
  
              <div className="col-md-3">
                <p className="mt-3">Upload lights here:</p>
                <div className="drawing-dropzone" {...getLightsRootProps()}>
                  <input {...getLightsInputProps()} />
                  <p>Drag and drop .jpg, .png or .pdf files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'lights').map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
  
              <div className="col-md-3">
                <p className="mt-3">Upload accessories here:</p>
                <div className="drawing-dropzone" {...getAccessoriesRootProps()}>
                  <input {...getAccessoriesInputProps()} />
                  <p>Drag and drop .jpg, .png or .pdf files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'accessories').map(file => (
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
                    <th>Hardware</th>
                    <th>Wooden</th>
                    <th>Lights</th>
                    <th>Accessories</th>
                    <th>Upload Date</th>  {/* New header */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drawings.map(drawing => (
                    <tr key={drawing._id}>
                      <td>
                        {drawing.mainFile ? (
                          <div>
                            <span>{truncateFileName(drawing.mainFile.name)}</span><br/>
                            <button className="measure-btn" onClick={() => viewMainFile(drawing._id)}>View</button>
                            <button className="measure-btn" onClick={() => downloadMainFile(drawing._id)}>Download</button>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {drawing.hw ? (
                          <div>
                            <span>{truncateFileName(drawing.hw.name)}</span><br/>
                            <button className="measure-btn" onClick={() => viewHw(drawing._id)}>View</button>
                            <button className="measure-btn" onClick={() => downloadHw(drawing._id)}>Download</button>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {drawing.wooden ? (
                          <div>
                            <span>{truncateFileName(drawing.wooden.name)}</span><br/>
                            <button className="measure-btn" onClick={() => viewWooden(drawing._id)}>View</button>
                            <button className="measure-btn" onClick={() => downloadWooden(drawing._id)}>Download</button>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {drawing.lights ? (
                          <div>
                            <span>{truncateFileName(drawing.lights.name)}</span><br/>
                            <button className="measure-btn" onClick={() => viewLights(drawing._id)}>View</button>
                            <button className="measure-btn" onClick={() => downloadLights(drawing._id)}>Download</button>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {drawing.accessories ? (
                          <div>
                            <span>{truncateFileName(drawing.accessories.name)}</span><br/>
                            <button className="measure-btn" onClick={() => viewAccessories(drawing._id)}>View</button>
                            <button className="measure-btn" onClick={() => downloadAccessories(drawing._id)}>Download</button>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {drawing.uploadDate ? new Date(drawing.uploadDate).toLocaleString() : '-'}
                      </td>
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

export default Purchase;