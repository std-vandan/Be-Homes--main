  import React, { useState } from 'react';

  const Dropzone = ({ getRootProps, getInputProps, uploadedFiles, handleUpload, showAlert, title ,filetype ,uploadText}) => {
    const [openAccordion, setOpenAccordion] = useState(false);

    return (
      <div className="accordion-item">
        <div className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            onClick={() => setOpenAccordion(!openAccordion)}
            aria-expanded={openAccordion}
          >
            {title}
          </button>
        </div>
        <div className={`accordion-collapse collapse ${openAccordion ? 'show' : ''}`}>
          <div className={`accordion-body`}>
            <p className="mt-3">  {uploadText} </p>
            <div className="drawing-dropzone" {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag and drop {filetype} files here, or click to select files.</p>
              <button className="gradient-button">Upload</button>
            </div>
            <ul style={{ marginTop: '10px' }}>
              {uploadedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
            <button className="gradient-button mt-3" onClick={handleUpload}>
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default Dropzone;