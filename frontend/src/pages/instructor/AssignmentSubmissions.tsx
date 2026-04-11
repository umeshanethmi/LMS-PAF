import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

interface AssignmentSubmission {
  id: string;
  studentId: string;
  submittedAt: string;
  grade: number;
  feedback: string;
  fileUrl: string;
}

function AssignmentSubmissions() {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // This endpoint needs to be implemented in the backend
        const response = await apiClient.get('/instructor/assignments/submissions');
        setSubmissions(response.data);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
        // Mock data for demonstration
        setSubmissions([
          { id: '1', studentId: '101', submittedAt: new Date().toISOString(), grade: 95, feedback: 'Excellent work!', fileUrl: '/path/to/file1.pdf' },
          { id: '2', studentId: '102', submittedAt: new Date().toISOString(), grade: 88, feedback: 'Good effort, but check your calculations.', fileUrl: '/path/to/file2.pdf' },
        ]);
      }
    };

    fetchSubmissions();
  }, []);

  const handleGradeChange = (submissionId: string, grade: number) => {
    // Logic to update grade
    console.log(`Updating grade for ${submissionId} to ${grade}`);
  };

  const handleFeedbackChange = (submissionId: string, feedback: string) => {
    // Logic to update feedback
    console.log(`Updating feedback for ${submissionId} to ${feedback}`);
  };

  const handleDownload = (fileUrl: string) => {
    // In a real app, this would trigger a download.
    // The backend should serve the file with appropriate headers.
    window.open(apiClient.defaults.baseURL + fileUrl, '_blank');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Assignment Submissions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/6 py-3 px-4 uppercase font-semibold text-sm">Submission ID</th>
              <th className="w-1/6 py-3 px-4 uppercase font-semibold text-sm">Student ID</th>
              <th className="w-1/4 py-3 px-4 uppercase font-semibold text-sm">Submitted At</th>
              <th className="w-1/6 py-3 px-4 uppercase font-semibold text-sm">Grade</th>
              <th className="w-1/4 py-3 px-4 uppercase font-semibold text-sm">Feedback</th>
              <th className="py-3 px-4 uppercase font-semibold text-sm">File</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="w-1/6 py-3 px-4">{submission.id}</td>
                <td className="w-1/6 py-3 px-4">{submission.studentId}</td>
                <td className="w-1/4 py-3 px-4">{new Date(submission.submittedAt).toLocaleString()}</td>
                <td className="w-1/6 py-3 px-4">
                  <input
                    type="number"
                    defaultValue={submission.grade}
                    onBlur={(e) => handleGradeChange(submission.id, parseInt(e.target.value))}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="w-1/4 py-3 px-4">
                  <input
                    type="text"
                    defaultValue={submission.feedback}
                    onBlur={(e) => handleFeedbackChange(submission.id, e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleDownload(submission.fileUrl)}
                    className="text-blue-500 hover:underline"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignmentSubmissions;
