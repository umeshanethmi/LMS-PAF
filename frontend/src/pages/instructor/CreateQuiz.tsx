import { useForm, useFieldArray } from 'react-hook-form';
import apiClient from '../../services/apiClient';

interface CreateQuizRequest {
  courseId: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: {
    questionText: string;
    options: string[];
    correctOption: number;
  }[];
}

function CreateQuiz() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<CreateQuizRequest>({
    defaultValues: {
      questions: [{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  const onSubmit = async (data: CreateQuizRequest) => {
    try {
      await apiClient.post('/instructor/quizzes', data);
      alert('Quiz created successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to create quiz.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Quiz</h1>
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
          <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
          <input
            id="timeLimit"
            type="number"
            {...register('timeLimit', { required: 'Time limit is required', valueAsNumber: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.timeLimit && <p className="text-red-500 text-xs mt-1">{errors.timeLimit.message}</p>}
        </div>

        <hr />

        <h2 className="text-xl font-bold">Questions</h2>
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-2 p-4 border border-gray-200 rounded-md">
            <label className="block text-sm font-medium text-gray-700">Question {index + 1}</label>
            <input
              {...register(`questions.${index}.questionText`, { required: 'Question text is required' })}
              placeholder="Question Text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.questions?.[index]?.questionText && <p className="text-red-500 text-xs mt-1">{errors.questions[index].questionText.message}</p>}

            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, optionIndex) => (
                <div key={optionIndex}>
                  <input
                    {...register(`questions.${index}.options.${optionIndex}`, { required: 'Option is required' })}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Correct Option</label>
              <select
                {...register(`questions.${index}.correctOption`, { valueAsNumber: true })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>
            </div>

            <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
              Remove Question
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ questionText: '', options: ['', '', '', ''], correctOption: 0 })}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Add Question
        </button>

        <hr />

        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Create Quiz
        </button>
      </form>
    </div>
  );
}

export default CreateQuiz;
