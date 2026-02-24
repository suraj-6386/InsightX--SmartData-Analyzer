
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
        <h5>📁 Upload Dataset</h5>
      </div>
      <div className="card-body">
        <div
          {...getRootProps()}
          className={`border-dashed p-5 text-center transition-all ${
            isDragActive ? 'bg-light border border-primary' : 'border border-secondary-subtle'
          }`}
          style={{ 
            cursor: 'pointer',
            borderRadius: '12px',
            background: isDragActive ? 'rgba(102, 126, 234, 0.1)' : 'rgba(0,0,0,0.02)',
            borderWidth: '2px',
            transition: 'all 0.3s ease'
          }}
        >
          <input {...getInputProps()} />
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
            {isDragActive ? '📥' : '📤'}
          </div>
          {isDragActive ? (
            <>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#667eea', margin: 0 }}>
                Drop the file here
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '8px' }}>
                Release to upload
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#202124', margin: 0 }}>
                Drag & drop a CSV or Excel file here
              </p>
              <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '8px' }}>
                or click to browse your computer
              </p>
              <small style={{ color: '#999' }}>Supported formats: .csv, .xlsx</small>
            </>
          )}
        </div>
        {uploadedFile && (
          <div className="mt-4 alert alert-success border-0" style={{ borderRadius: '10px', animation: 'slideIn 0.3s ease' }}>
            <strong>✅ File Uploaded Successfully!</strong>
            <p className="mb-0 mt-2">
              <span style={{ fontWeight: '600' }}>{uploadedFile.name}</span>
              <br />
              <small style={{ color: '#666' }}>
                File size: {(uploadedFile.size / 1024).toFixed(2)} KB
              </small>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;