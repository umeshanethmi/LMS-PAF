import { useForm } from 'react-hook-form';
import apiClient from '../../services/apiClient';

interface CreateAssignmentRequest {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
}

function CreateAssignment() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAssignmentRequest>();

  const onSubmit = async (data: CreateAssignmentRequest) => {
    try {
      await apiClient.post('/instructor/assignments', data);
      alert('Assignment created successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to create assignment.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Assignment</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course ID</label>
          <input
            id="courseId"
            type="text"
            {...register('courseId', { required: 'Course ID is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            {...register('description')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            id="dueDate"
            type="datetime-local"
            {...register('dueDate', { required: 'Due date is required' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
        </div>

        <div>
          <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700">Max Score</label>
          <input
            id="maxScore"
            type="number"
            {...register('maxScore', { required: 'Max score is required', valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.maxScore && <p className="text-red-500 text-xs mt-1">{errors.maxScore.message}</p>}
        </div>

        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Create Assignment
        </button>
      </form>
    </div>
  );
}

export default CreateAssignment;
