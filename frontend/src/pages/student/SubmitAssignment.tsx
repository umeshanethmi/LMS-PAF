import { useParams } from 'react-router-dom';
import FileUpload from '../../components/common/FileUpload';

function SubmitAssignment() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  // In a real app, studentId would come from auth context
  const studentId = "101"; 

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Submit Assignment {assignmentId}</h1>
      {assignmentId && <FileUpload assignmentId={assignmentId} studentId={studentId} />}
    </div>
  );
}

export default SubmitAssignment;
