import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';
import ProjectDetails from '../components/ProjectDetails';
import UpwardHead from "../components/UpwardHead";

const WorkingDrawing = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectDetails, setProjectDetails] = useState(null);
  const [mainFiles, setMainFiles] = useState([]);
  const [elecFiles, setElecFiles] = useState([]);
  const [plumbFiles, setPlumbFiles] = useState([]);
  const [civFiles, setCivFiles] = useState([]);
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
        const response = await axios.get(`https://behomes-1.onrender.com/workingDrawing/files/proj/${selectedProjectId}`);
        console.log('Fetched drawings:', response.data.files);
        setDrawings(response.data.files);
        const finalDrawing = response.data.files.find(drawing => drawing.status === "Finalized");
        setFinalDrawingId(finalDrawing ? finalDrawing._id : null);
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

  // Handle drop with file type validation
  const handleDrop = (acceptedFiles, type) => {
    if (acceptedFiles.length === 0) {
      showAlert('Error: No files were uploaded.');
      return;
    }
    
    // Validate that for file types other than main, a main file must be present.
    if (type !== 'main' && mainFiles.length === 0) {
      showAlert('Please upload a main file before uploading additional files.');
      return;
    }
    
    let allowedExtensions = [];
    switch (type) {
      case 'main':
        allowedExtensions = ['.pdf', '.dwg'];
        break;
      case 'elec':
      case 'plumb':
      case 'civ':
        // Include .jpeg with .jpg and .png
        allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        break;
      default:
        break;
    }
    
    const filteredFiles = acceptedFiles.filter((file) =>
      allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
    
    if (filteredFiles.length === 0) {
      showAlert(`Error: Only ${allowedExtensions.join(', ')} files are allowed for ${type}.`);
      return;
    }
    
    // Since backend expects one file per field, update state with first valid file only
    switch (type) {
      case 'main':
        setMainFiles([filteredFiles[0]]);
        break;
      case 'elec':
        setElecFiles([filteredFiles[0]]);
        break;
      case 'plumb':
        setPlumbFiles([filteredFiles[0]]);
        break;
      case 'civ':
        setCivFiles([filteredFiles[0]]);
        break;
      default:
        break;
    }
    console.log(`Accepted ${type} file:`, filteredFiles[0]);
  };

  const handleUpload = async () => {
    if (!mainFiles.length && !elecFiles.length && !plumbFiles.length && !civFiles.length) {
      showAlert('Please select files to upload.');
      return;
    }
    const formData = new FormData();
    if (mainFiles.length) formData.append('mainFile', mainFiles[0]);
    if (elecFiles.length) formData.append('elec', elecFiles[0]);
    if (plumbFiles.length) formData.append('plumb', plumbFiles[0]);
    if (civFiles.length) formData.append('civ', civFiles[0]);

    try {
      const response = await axios.post(
        `https://behomes-1.onrender.com/workingDrawing/upload/${selectedProjectId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Upload response:', response.data);
      showAlert('Files uploaded successfully!');
      // Append a new drawing using the schema fields
      setDrawings(prev => [
        ...prev,
        {
          _id: response.data.newDrawingId,
          mainFile: { name: mainFiles[0].name },
          uploadDate: new Date().toISOString(),
          status: "Not-Finalized"
        }
      ]);
      navigate('/working-drawing');
    } catch (error) {
      console.error('Error uploading files:', error);
      showAlert('Failed to upload files.');
    }
  };

  // Dropzone hooks
  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'main'),
    accept: '.pdf, .dwg',
    multiple: false,
  });

  const { getRootProps: getElecRootProps, getInputProps: getElecInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'elec'),
    accept: '.pdf, .jpg, .jpeg, .png', // Include .jpeg here
    multiple: false,
  });

  const { getRootProps: getPlumbRootProps, getInputProps: getPlumbInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'plumb'),
    accept: '.pdf, .jpg, .jpeg, .png', // Include .jpeg here
    multiple: false,
  });

  const { getRootProps: getCivRootProps, getInputProps: getCivInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'civ'),
    accept: '.pdf, .jpg, .jpeg, .png', // Include .jpeg here
    multiple: false,
  });

  // New view functions using proper endpoints
  const viewMainFile = (id) => {
    window.open(`https://behomes-1.onrender.com/workingDrawing/view/mainFile/${id}`, '_blank');
  };
  const viewElec = (id) => {
    window.open(`https://behomes-1.onrender.com/workingDrawing/view/elec/${id}`, '_blank');
  };
  const viewPlumb = (id) => {
    window.open(`https://behomes-1.onrender.com/workingDrawing/view/plumb/${id}`, '_blank');
  };
  const viewCiv = (id) => {
    window.open(`https://behomes-1.onrender.com/workingDrawing/view/civ/${id}`, '_blank');
  };

  // New download functions using proper endpoints
  const downloadMainFile = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/workingDrawing/download/mainFile/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', mainFiles[0] ? mainFiles[0].name : 'mainFile');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading main file:', error);
    }
  };
  const downloadElec = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/workingDrawing/download/elec/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', elecFiles[0] ? elecFiles[0].name : 'elec');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading elec file:', error);
    }
  };
  const downloadPlumb = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/workingDrawing/download/plumb/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', plumbFiles[0] ? plumbFiles[0].name : 'plumb');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading plumb file:', error);
    }
  };
  const downloadCiv = async (id) => {
    try {
      const response = await axios.get(`https://behomes-1.onrender.com/workingDrawing/download/civ/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', civFiles[0] ? civFiles[0].name : 'civ');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading civ file:', error);
    }
  };

  const markAsFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/workingDrawing/finalize/${id}`);
      showAlert('Drawing marked as final successfully!');
      setFinalDrawingId(id);
      // Optionally, refresh the drawings list here if needed
    } catch (error) {
      console.error('Error marking drawing as final:', error);
      showAlert('Failed to mark drawing as final.');
    }
  };

  const markAsNotFinal = async (id) => {
    try {
      const response = await axios.post(`https://behomes-1.onrender.com/workingDrawing/unfinalize/${id}`);
      showAlert('Drawing unmarked as final successfully!');
      setFinalDrawingId(null);
      // Optionally, refresh the drawings list here if needed
    } catch (error) {
      console.error('Error unmarking drawing as final:', error);
      showAlert('Failed to unmark drawing as final.');
    }
  };

  const truncateFileName = (fileName) => {
    const words = fileName.split(' ');
    return words.length > 2 ? `${words.slice(0, 2).join(' ')}...` : fileName;
  };

  return (
    <>
      <div style={{ padding: '20px' }}>
        <UpwardHead pageTitle="Working Drawing" />
        <div>
          <label htmlFor="projectSelect" className="project-form-label">Select Project: </label>
          <select
            id="projectSelect"
            className="project-form-control"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">-- Select a Project --</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>

        {projectDetails && <ProjectDetails projectDetails={projectDetails} />}

        {selectedProjectId && (
          <div className="mt-3 p-3 accordion-item">
            <label className="measurement-text" type="button" aria-expanded="true">
              Working Drawing Uploading
            </label>
            <div className="row">
              <div className="col-md-3">
                <p className="mt-3">Main Upload (.pdf, .dwg):</p>
                <div className="drawing-dropzone" {...getMainRootProps()}>
                  <input {...getMainInputProps()} />
                  <p>Drag and drop .pdf or .dwg files here, or click to select files.</p>
                  <button className="gradient-button">Upload</button>
                </div>
                {mainFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-3">
                <p className="mt-3">Electric (.pdf, .jpg, .png):</p>
                <div className="drawing-dropzone" {...getElecRootProps()}>
                  <input {...getElecInputProps()} />
                  <p>Drag and drop .pdf, .jpg, or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload</button>
                </div>
                {elecFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-3">
                <p className="mt-3">Plumbing (.pdf, .jpg, .png):</p>
                <div className="drawing-dropzone" {...getPlumbRootProps()}>
                  <input {...getPlumbInputProps()} />
                  <p>Drag and drop .pdf, .jpg, or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload</button>
                </div>
                {plumbFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>

              <div className="col-md-3">
                <p className="mt-3">Civil (.pdf, .jpg, .png):</p>
                <div className="drawing-dropzone" {...getCivRootProps()}>
                  <input {...getCivInputProps()} />
                  <p>Drag and drop .pdf, .jpg, or .png files here, or click to select files.</p>
                  <button className="gradient-button">Upload</button>
                </div>
                {civFiles.map(file => (
                  <p key={file.name}>{file.name}</p>
                ))}
              </div>
            </div>
            <button className="gradient-button" onClick={handleUpload}>Submit All Files</button>
          </div>
        )}

        {drawings.length > 0 ? (
          <div className="drawing-list" style={{ marginTop: '20px' }}>
            <h5>Working Drawing Details</h5>
            <div className="table-container">
              <table className="">
                <thead>
                  <tr className="td-head">
                    <th>Main File</th>
                    <th>Electric</th>
                    <th>Plumbing</th>
                    <th>Civil</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drawings.map(drawing => (
                    <tr key={drawing._id}>
                      <td>
                        <div>
                          {drawing.mainFile ? drawing.mainFile.name : '-'} <br />
                          <button className="measure-btn" onClick={() => viewMainFile(drawing._id)}>View</button>
                          <button className="measure-btn" onClick={() => downloadMainFile(drawing._id)}>Download</button>
                        </div>
                      </td>
                      <td>
                        {drawing.elec ? drawing.elec.name : '-'} <br />
                        <button className="measure-btn" onClick={() => viewElec(drawing._id)}>View</button>
                        <button className="measure-btn" onClick={() => downloadElec(drawing._id)}>Download</button>
                      </td>
                      <td>
                        {drawing.plumb ? drawing.plumb.name : '-'} <br />
                        <button className="measure-btn" onClick={() => viewPlumb(drawing._id)}>View</button>
                        <button className="measure-btn" onClick={() => downloadPlumb(drawing._id)}>Download</button>
                      </td>
                      <td>
                        {drawing.civ ? drawing.civ.name : '-'} <br />
                        <button className="measure-btn" onClick={() => viewCiv(drawing._id)}>View</button>
                        <button className="measure-btn" onClick={() => downloadCiv(drawing._id)}>Download</button>
                      </td>
                      <td>
                        {drawing.uploadDate ? new Date(drawing.uploadDate).toLocaleString() : '-'}
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
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default WorkingDrawing;