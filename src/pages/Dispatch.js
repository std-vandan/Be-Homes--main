import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import ProjectDetails from '../components/ProjectDetails';
import UpwardHead from "../components/UpwardHead";

const Dispatch = () => {
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
  const [freightCharges, setFreightCharges] = useState('');

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
        const response = await axios.get(`http://localhost:5000/dispatch/files/proj/${selectedProjectId}`);
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
    
    // Attach a custom type property to each file
    acceptedFiles.forEach(file => file.uploadType = type);
    
    // Ensure a main upload exists for additional file types ("challan" and "invoice")
    if (['challan', 'invoice'].includes(type) &&
        !uploadedFiles.some(file => file.name.toLowerCase().endsWith('.pdf') ||
                                     file.name.toLowerCase().endsWith('.jpg') ||
                                     file.name.toLowerCase().endsWith('.jpeg') ||
                                     file.name.toLowerCase().endsWith('.png'))) {
      showAlert('Please upload a main file (.pdf, .jpg, .jpeg or .png) before uploading additional files.');
      return;
    }
    
    const filteredFiles = acceptedFiles.filter((file) => {
      if (type === 'pdf') {
        return file.name.toLowerCase().endsWith('.pdf') ||
               file.name.toLowerCase().endsWith('.jpg') ||
               file.name.toLowerCase().endsWith('.jpeg') ||
               file.name.toLowerCase().endsWith('.png');
      }
      if (type === 'challan') {
        return file.name.toLowerCase().endsWith('.jpg') ||
               file.name.toLowerCase().endsWith('.jpeg') ||
               file.name.toLowerCase().endsWith('.png') ||
               file.name.toLowerCase().endsWith('.pdf');
      }
      if (type === 'invoice') {
        return file.name.toLowerCase().endsWith('.jpg') ||
               file.name.toLowerCase().endsWith('.jpeg') ||
               file.name.toLowerCase().endsWith('.png') ||
               file.name.toLowerCase().endsWith('.pdf');
      }
      return false;
    });
    
    if (filteredFiles.length === 0) {
      const allowed = type === 'pdf'
        ? '.pdf, .jpg, .jpeg, and .png'
        : type === 'challan'
          ? '.jpeg, .jpg, .png, and .pdf'
          : '.jpeg, .jpg, .png, and .pdf';
      showAlert(`Error: Only ${allowed} files are allowed.`);
      return;
    }
    
    setUploadedFiles(prevFiles => [...prevFiles, ...filteredFiles]);
    console.log(`Accepted ${type} files:`, filteredFiles);
  };

// Updated handleUpload function (FormData keys updated)
const handleUpload = async () => {
  if (!freightCharges) {
    showAlert('Please enter freight charges before uploading.');
    return;
  }

  if (uploadedFiles.length === 0) {
    showAlert('Please select files to upload.');
    return;
  }

  const formData = new FormData();

  // Append files based on their upload type
  uploadedFiles.forEach((file) => {
    if (file.uploadType === 'pdf') {
      formData.append('mainFile', file);
    } else if (file.uploadType === 'challan') {
      formData.append('challan', file);
    } else if (file.uploadType === 'invoice') {
      formData.append('invoice', file);
    }
  });

  // Append freightCharges field
  formData.append('freightCharges', freightCharges);

  try {
    const response = await axios.post(
      `http://localhost:5000/dispatch/upload/${selectedProjectId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    console.log('Upload response:', response.data);
    showAlert('Files uploaded successfully!');

    // Fetch updated drawings list
    const drawingsResponse = await axios.get(
      `http://localhost:5000/dispatch/files/proj/${selectedProjectId}`
    );
    setDrawings(drawingsResponse.data.files);

    // Reset files and freight charges input
    setUploadedFiles([]);
    setFreightCharges('');
    navigate('/dispatch');
  } catch (error) {
    console.error('Error uploading files:', error);
    showAlert('Failed to upload files.');
  }
};

  const downloadMainUpload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/dispatch/download/MainUp/${id}`, {
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
      const response = await axios.get(`http://localhost:5000/dispatch/download/SitePic/${id}`, {
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

  const downloadWooden = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/dispatch/download/Wooden/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(drawing => drawing._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.Wooden ? drawing.Wooden.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading wooden file:', error);
    }
  };

  const viewMainUpload = (id) => {
    window.open(`http://localhost:5000/dispatch/view/MainUp/${id}`, '_blank');
  };
  
  const viewSitePic = (id) => {
    window.open(`http://localhost:5000/dispatch/view/SitePic/${id}`, '_blank');
  };
  
  const viewWooden = (id) => {
    window.open(`http://localhost:5000/dispatch/view/Wooden/${id}`, '_blank');
  };

  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`http://localhost:5000/dispatch/Finalized/${id}`);
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
      const response = await axios.post(`http://localhost:5000/dispatch/Finalized/${id}`);
      console.log('Unmark final response:', response.data);
      showAlert('Drawing marked as not final successfully!');
      setFinalDrawingId(null);
    } catch (error) {
      console.error('Error marking drawing as not final:', error);
      showAlert('Failed to mark drawing as not final.');
    }
  };

  // Updated dropzone: Change "hardware" dropzone to "challan"
  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'pdf'),
    accept: '.pdf, .jpg, .jpeg, .png',
    multiple: true,
  });

  const { getRootProps: getChallanRootProps, getInputProps: getChallanInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'challan'),
    accept: '.jpg, .jpeg, .png, .pdf',
    multiple: true,
  });

  const { getRootProps: getInvoiceRootProps, getInputProps: getInvoiceInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'invoice'),
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
        <UpwardHead pageTitle="Dispatch" />

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

        {projectDetails && <ProjectDetails projectDetails={projectDetails} />}

        {selectedProjectId && (
          <div className="mt-3 p-3 accordion-item">
            <label className="measurement-text" type="button" aria-expanded="true">Dispatch Uploading</label>
            <div className="row">
              <div className="col-md-4">
                <p className="mt-3">Upload .pdf or images file here:</p>
                <div className="drawing-dropzone" {...getPdfRootProps()}>
                  <input {...getPdfInputProps()} />
                  <p>Drag and drop .pdf or .jpg or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload</button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'pdf').map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
  
              <div className="col-md-4">
                <p className="mt-3">Upload challan here:</p>
                <div className="drawing-dropzone" {...getChallanRootProps()}>
                  <input {...getChallanInputProps()} />
                  <p>Drag and drop .jpg, .png or .pdf files here, or click to select files.</p>
                  <button className="gradient-button">Upload</button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'challan').map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
  
              <div className="col-md-4">
                <p className="mt-3">Upload invoice here:</p>
                <div className="drawing-dropzone" {...getInvoiceRootProps()}>
                  <input {...getInvoiceInputProps()} />
                  <p>Drag and drop .jpg, .png or .pdf files here, or click to select files.</p>
                  <button className="gradient-button">Upload</button>
                </div>
                {uploadedFiles.filter(file => file.uploadType === 'invoice').map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
            </div>
            {/* New input field for Freight Charges */}
            <div className="mt-3">
              <label htmlFor="freightCharges" className="project-form-label">Freight Charges: </label>
              <input
                type="number"
                id="freightCharges"
                className="project-form-control"
                value={freightCharges}
                onChange={(e) => setFreightCharges(e.target.value)}
                placeholder="Enter freight charges"
              />
            </div>
            <button className="gradient-button mt-3" onClick={handleUpload}>Submit All Files</button>
          </div>
        )}

        {/* Drawing List Table - Updated according to schema */}
        {drawings.length > 0 ? (
          <div className="drawing-list" style={{ marginTop: '20px' }}>
            <h5>Drawing Details</h5>
            <div className="table-container">
              <table className="">
                <thead>
                  <tr className="td-head">
                    <th>Main Upload</th>
                    <th>Challan</th>
                    <th>Invoice</th>
                    <th>Freight Charges</th>
                    <th>Upload Date</th>  {/* New header */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drawings.map((drawing) => {
                    if (!drawing) return null;
                    return (
                      <tr key={drawing._id}>
                        <td>
                          {drawing.mainFile && (
                            <div className="text-start">
                              <span>{truncateFileName(drawing.mainFile.name)}</span>
                              <br />
                              <button
                                className="measure-btn"
                                onClick={() =>
                                  window.open(`http://localhost:5000/dispatch/view/mainFile/${drawing._id}`, '_blank')
                                }
                              >
                                View
                              </button>
                            
                              {/* <a
                                href={`http://localhost:5000/dispatch/view/mainFile/${drawing._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {`.../view/mainFile/${drawing._id}`}
                              </a> */}
                            
                              <button
                                className="measure-btn"
                                onClick={() => {
                                  // Download mainFile
                                  axios
                                    .get(`http://localhost:5000/dispatch/download/mainFile/${drawing._id}`, {
                                      responseType: 'blob',
                                    })
                                    .then((response) => {
                                      const url = window.URL.createObjectURL(new Blob([response.data]));
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.setAttribute(
                                        'download',
                                        drawing.mainFile ? drawing.mainFile.name : 'download.pdf'
                                      );
                                      document.body.appendChild(link);
                                      link.click();
                                    })
                                    .catch((error) => {
                                      console.error('Error downloading main file:', error);
                                    });
                                }}
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </td>
  
                        <td>
                          {drawing.challan && (
                            <div className="text-start">
                              <span>{truncateFileName(drawing.challan.name)}</span>
                              <br />
                              <button
                                className="measure-btn"
                                onClick={() =>
                                  window.open(`http://localhost:5000/dispatch/view/challan/${drawing._id}`, '_blank')
                                }
                              >
                                View
                              </button>
                           
                              {/* <a
                                href={`http://localhost:5000/dispatch/view/challan/${drawing._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {`.../view/challan/${drawing._id}`}
                              </a> */}
                              
                              <button
                                className="measure-btn"
                                onClick={() => {
                                  // Download challan
                                  axios
                                    .get(`http://localhost:5000/dispatch/download/challan/${drawing._id}`, {
                                      responseType: 'blob',
                                    })
                                    .then((response) => {
                                      const url = window.URL.createObjectURL(new Blob([response.data]));
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.setAttribute(
                                        'download',
                                        drawing.challan ? drawing.challan.name : 'download.pdf'
                                      );
                                      document.body.appendChild(link);
                                      link.click();
                                    })
                                    .catch((error) => {
                                      console.error('Error downloading challan:', error);
                                    });
                                }}
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </td>
  
                        <td>
                          {drawing.invoice && (
                            <div className="text-start">
                              <span>{truncateFileName(drawing.invoice.name)}</span>
                              <br />
                              <button
                                className="measure-btn"
                                onClick={() =>
                                  window.open(`http://localhost:5000/dispatch/view/invoice/${drawing._id}`, '_blank')
                                }
                              >
                                View
                              </button>
                              
                              {/* <a
                                href={`http://localhost:5000/dispatch/view/invoice/${drawing._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {`.../view/invoice/${drawing._id}`}
                              </a> */}
                              
                              <button
                                className="measure-btn"
                                onClick={() => {
                                  // Download invoice
                                  axios
                                    .get(`http://localhost:5000/dispatch/download/invoice/${drawing._id}`, {
                                      responseType: 'blob',
                                    })
                                    .then((response) => {
                                      const url = window.URL.createObjectURL(new Blob([response.data]));
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.setAttribute(
                                        'download',
                                        drawing.invoice ? drawing.invoice.name : 'download.pdf'
                                      );
                                      document.body.appendChild(link);
                                      link.click();
                                    })
                                    .catch((error) => {
                                      console.error('Error downloading invoice:', error);
                                    });
                                }}
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </td>
  
                        <td>
                          {drawing.freightCharges && drawing.freightCharges.$numberDecimal
                            ? drawing.freightCharges.$numberDecimal
                            : drawing.freightCharges
                              ? drawing.freightCharges.toString()
                              : '0.00'}
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

export default Dispatch;