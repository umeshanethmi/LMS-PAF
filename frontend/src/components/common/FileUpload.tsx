import { useState, useCallback } from 'react';
import type { Accept } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import apiClient from '../../services/apiClient';

interface FileUploadProps {
  assignmentId?: string;
  studentId?: string;
  maxFiles?: number;
  accept?: Accept;
  onFilesSelected?: (files: File[]) => void;
}

function FileUpload({
  assignmentId,
  studentId,
  maxFiles = 1,
  accept,
  onFilesSelected,
}: FileUploadProps) {
  const isAssignmentSubmission = Boolean(assignmentId && studentId && !onFilesSelected);
  const [file, setFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const limitedFiles = acceptedFiles.slice(0, maxFiles);

    if (isAssignmentSubmission) {
      setFile(limitedFiles[0] ?? null);
      return;
    }

    setSelectedFiles(limitedFiles);
    onFilesSelected?.(limitedFiles);
  }, [isAssignmentSubmission, maxFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: maxFiles !== 1,
    maxFiles,
  });

  const handleSubmit = async () => {
    if (!isAssignmentSubmission || !assignmentId || !studentId) {
      return;
    }

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
        {isAssignmentSubmission ? (
          file ? (
            <p>{file.name}</p>
          ) : (
            <p>Drag 'n' drop a file here, or click to select a file</p>
          )
        ) : (
          <div>
            {selectedFiles.length > 0 ? (
              <div className="space-y-1">
                {selectedFiles.map((selectedFile) => (
                  <p key={selectedFile.name}>{selectedFile.name}</p>
                ))}
              </div>
            ) : (
              <p>Drag 'n' drop images here, or click to select up to {maxFiles} files</p>
            )}
          </div>
        )}
      </div>
      {isAssignmentSubmission && (
        <button
          onClick={handleSubmit}
          className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Assignment
        </button>
      )}
    </div>
  );
}

export default FileUpload;
