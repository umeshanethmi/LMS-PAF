import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import apiClient from '../../services/apiClient';

interface FileUploadProps {
  assignmentId: string;
  studentId: string;
}

function FileUpload({ assignmentId, studentId }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);

    try {
      await apiClient.post(`/student/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Failed to submit assignment', error);
      alert('Failed to submit assignment.');
    }
  };

  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer ${isDragActive ? 'border-blue-500' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Drag 'n' drop a file here, or click to select a file</p>
        )}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit Assignment
      </button>
    </div>
  );
}

export default FileUpload;
