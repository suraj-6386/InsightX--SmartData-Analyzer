import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFileUpload }) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    onFileUpload(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5>Upload Dataset</h5>
      </div>
      <div className="card-body">
        <div
          {...getRootProps()}
          className={`border border-dashed p-4 text-center ${isDragActive ? 'bg-light' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <p>Drag & drop a CSV or Excel file here, or click to browse</p>
          )}
        </div>
        {uploadedFile && (
          <div className="mt-3 alert alert-success">
            File uploaded: {uploadedFile.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;