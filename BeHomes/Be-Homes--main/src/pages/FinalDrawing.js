import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import ProjectDetails from '../components/ProjectDetails';
import UpwardHead from "../components/UpwardHead";

const FinalDrawing = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);
  const [mainFiles, setMainFiles] = useState([]);
  const [elevationFiles, setElevationFiles] = useState([]);
  const [sectionFiles, setSectionFiles] = useState([]);
  const [isoFiles, setIsoFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const [drawings, setDrawings] = useState([]);
  const [finalDrawingId, setFinalDrawingId] = useState(null);
   const [uploadedFiles, setUploadedFiles] = useState([]);

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
        const response = await axios.get(`https://behomes-1.onrender.com/finalDrawing/files/proj/${selectedProjectId}`);
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

  // Helper function to truncate file names longer than 20 characters
  const truncateFileName = (name) => {
    const maxLength = 20;
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + '...';
    }
    return name;
  };


  // New view functions using the updated endpoints
  const viewMainFile = (id) => {
    window.open(`https://behomes-1.onrender.com/finalDrawing/view/mainFile/${id}`, '_blank');
  };

  const viewElevationFile = (id) => {
    window.open(`https://behomes-1.onrender.com/finalDrawing/view/elevationFile/${id}`, '_blank');
  };

  const viewSectionFile = (id) => {
    window.open(`https://behomes-1.onrender.com/finalDrawing/view/sectionFile/${id}`, '_blank');
  };

  const viewIsoFile = (id) => {
    window.open(`https://behomes-1.onrender.com/finalDrawing/view/isoFile/${id}`, '_blank');
  };

  const handleDrop = (acceptedFiles, type) => {
    if (acceptedFiles.length === 0) {
      showAlert('Error: No files were uploaded.');
      return;
    }
  
    // For non-main files, ensure that a main file already exists
    if (type !== 'main' && mainFiles.length === 0) {
      showAlert('Error: Please upload a main file first.');
      return;
    }
  
    const allowedExtensions = 
      type === 'main'
        ? ['.pdf', '.dwg', '.jpg', '.jpeg', '.png']
        : ['.pdf', '.jpg', '.jpeg', '.png'];
  
    const filteredFiles = acceptedFiles.filter((file) =>
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  
    if (filteredFiles.length === 0) {
      showAlert(
        `Error: Only ${
          type === 'main'
            ? '.pdf, .dwg, .jpg, .jpeg, and .png'
            : '.pdf, .jpg, .jpeg, and .png'
        } files are allowed.`
      );
      return;
    }
  
    switch (type) {
      case 'main':
        setMainFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
        break;
      case 'elevation':
        setElevationFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
        break;
      case 'section':
        setSectionFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
        break;
      case 'iso':
        setIsoFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
        break;
      default:
        break;
    }
  
    console.log(`Accepted ${type} files:`, filteredFiles);
  };

  const handleUpload = async () => {
    // Calculate total files using the individual dropzone arrays
    const totalFiles = mainFiles.length + elevationFiles.length + sectionFiles.length + isoFiles.length;
    if (totalFiles === 0) {
      showAlert('Please select files to upload.');
      return;
    }
  
    const formData = new FormData();
    // Append files with keys matching your file schema
    mainFiles.forEach(file => {
      formData.append('mainFile', file);
    });
    elevationFiles.forEach(file => {
      formData.append('elevationFile', file);
    });
    sectionFiles.forEach(file => {
      formData.append('sectionFile', file);
    });
    isoFiles.forEach(file => {
      formData.append('isoFile', file);
    });
  
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/finalDrawing/upload/${selectedProjectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      showAlert('Files uploaded successfully!');
  
      // Fetch the updated list of drawings
      const drawingsResponse = await axios.get(`https://behomes-1.onrender.com/finalDrawing/files/proj/${selectedProjectId}`);
      setDrawings(drawingsResponse.data.files);
  
      // Reset dropzone file arrays
      setMainFiles([]);
      setElevationFiles([]);
      setSectionFiles([]);
      setIsoFiles([]);
  
      navigate('/final-drawing');
    } catch (error) {
      console.error('Error uploading files:', error);
      showAlert('Failed to upload files.');
    }
  };
  

  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/finalDrawing/Finalized/${id}`);
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
      const response = await axios.post(`https://behomes-1.onrender.com/finalDrawing/Not-Finalized/${id}`);
      console.log('Unmark final response:', response.data);
      showAlert('Drawing marked as not final successfully!');
      setFinalDrawingId(null);
    } catch (error) {
      console.error('Error marking drawing as not final:', error);
      showAlert('Failed to mark drawing as not final.');
    }
  };

  // Download functions with new endpoints
  const downloadMainUpload = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/finalDrawing/download/mainFile/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(d => d._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.mainFile ? drawing.mainFile.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading main file:', error);
    }
  };

  const downloadElevationFile = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/finalDrawing/download/elevationFile/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(d => d._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.elevationFile ? drawing.elevationFile.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading elevation file:', error);
    }
  };

  const downloadSectionFile = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/finalDrawing/download/sectionFile/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(d => d._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.sectionFile ? drawing.sectionFile.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading section file:', error);
    }
  };

  const downloadIsoFile = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/finalDrawing/download/isoFile/${id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const drawing = drawings.find(d => d._id === id);
      link.href = url;
      link.setAttribute('download', drawing && drawing.isoFile ? drawing.isoFile.name : 'download.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading iso file:', error);
    }
  };

  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'main'),
    accept: '.pdf, .dwg',
    multiple: true,
  });

  const { getRootProps: getElevationRootProps, getInputProps: getElevationInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'elevation'),
    accept: '.pdf, .jpg, .jpeg, .png',
    multiple: true,
  });

  const { getRootProps: getSectionRootProps, getInputProps: getSectionInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'section'),
    accept: '.pdf, .jpg, .jpeg, .png',
    multiple: true,
  });

  const { getRootProps: getISORootProps, getInputProps: getISOInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'iso'),
    accept: '.pdf, .jpg, .jpeg, .png',
    multiple: true,
  });

  return (
    <>
      <div style={{ padding: '20px' }}>
        <UpwardHead pageTitle="Production Drawing" />

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

        {projectDetails && (
          <ProjectDetails projectDetails={projectDetails} />
        )}

        {selectedProjectId ? (
          <div className="mt-3 p-3 accordion-item">
            <label className="measurement-text" type="button" aria-expanded="true">
              Production Drawing Uploading
            </label>
            <div className="row">
              <div className="col-md-3">
                <p className="mt-3">Main Upload (.pdf, .dwg):</p>
                <div className="drawing-dropzone" {...getMainRootProps()}>
                  <input {...getMainInputProps()} />
                  <p>Drag and drop .pdf , .png , .jpg or .dwg files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {mainFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-3">
                <p className="mt-3">Elevation (.pdf, .jpg, .png):</p>
                <div className="drawing-dropzone" {...getElevationRootProps()}>
                  <input {...getElevationInputProps()} />
                  <p>Drag and drop .pdf, .jpg, or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {elevationFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-3">
                <p className="mt-3">Section (.pdf, .jpg, .png):</p>
                <div className="drawing-dropzone" {...getSectionRootProps()}>
                  <input {...getSectionInputProps()} />
                  <p>Drag and drop .pdf, .jpg, or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {sectionFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-3">
                <p className="mt-3">ISO (.pdf, .jpg, .png):</p>
                <div className="drawing-dropzone" {...getISORootProps()}>
                  <input {...getISOInputProps()} />
                  <p>Drag and drop .pdf, .jpg, or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload </button>
                </div>
                {isoFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
            </div>
            <button className="gradient-button" onClick={handleUpload}>
              Submit All Files
            </button>
          </div>
        ) : (
          <p>Please select a project to upload files.</p>
        )}

        {drawings.length > 0 ? (
          <div className="drawing-list" style={{ marginTop: '20px' }}>
            <h5>Drawing Details</h5>
            <div className="table-container">
              <table className="">
                <thead>
                  <tr className="td-head">
                    <th>Main Upload</th>
                    <th>Elevation File</th>
                    <th>Section File</th>
                    <th>ISO File</th>
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
              <span>{truncateFileName(drawing.mainFile.name)}</span> <br/>
              <button className="measure-btn" onClick={() => viewMainFile(drawing._id)}>View</button>
              <button className="measure-btn" onClick={() => downloadMainUpload(drawing._id)}>Download</button>
            </div>
          )}
        </td>
        <td>
          {drawing.elevationFile && (
            <div className="text-start">
              <span>{truncateFileName(drawing.elevationFile.name)}</span> <br/>
              <button className="measure-btn" onClick={() => viewElevationFile(drawing._id)}>View</button>
              <button className="measure-btn" onClick={() => downloadElevationFile(drawing._id)}>Download</button>
            </div>
          )}
        </td>
        <td>
          {drawing.sectionFile && (
            <div className="text-start">
              <span>{truncateFileName(drawing.sectionFile.name)}</span> <br/>
              <button className="measure-btn" onClick={() => viewSectionFile(drawing._id)}>View</button>
              <button className="measure-btn" onClick={() => downloadSectionFile(drawing._id)}>Download</button>
            </div>
          )}
        </td>
        <td>
          {drawing.isoFile && (
            <div className="text-start">
              <span>{truncateFileName(drawing.isoFile.name)}</span> <br/>
              <button className="measure-btn" onClick={() => viewIsoFile(drawing._id)}>View</button>
              <button className="measure-btn" onClick={() => downloadIsoFile(drawing._id)}>Download</button>
            </div>
          )}
        </td>
        <td>
          <button 
            className="mark-btn"
            onClick={() => finalDrawingId === drawing._id ? markAsNotFinal(drawing._id) : markAsFinal(drawing._id)}
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

export default FinalDrawing;