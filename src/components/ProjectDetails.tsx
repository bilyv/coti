import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProgressCircle } from "./ProgressCircle";
import { CreateStepForm } from "./CreateStepForm";
import { StepList } from "./StepList";
import { Id } from "../../convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  color: string;
  totalSteps: number;
  completedSteps: number;
  progress: number;
}

const PROJECT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#84cc16", // lime
];

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showCreateStep, setShowCreateStep] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  
  const project = useQuery(api.projects.get, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const steps = useQuery(api.steps.listByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const updateProject = useMutation(api.projects.update);
  const removeProject = useMutation(api.projects.remove);

  // If projectId is invalid or project doesn't exist, redirect to home
  useEffect(() => {
    if (projectId && project === null) {
      navigate("/");
    }
    if (project) {
      setDescription(project.description || "");
    }
  }, [project, projectId, navigate]);

  if (!projectId) {
    navigate("/");
    return null;
  }

  if (project === undefined || steps === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Project not found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">The project you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDescriptionSave = async () => {
    if (projectId) {
      await updateProject({
        projectId: projectId as Id<"projects">,
        description: description || undefined
      });
      setIsEditingDescription(false);
    }
  };

  // Truncate description for preview
  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderDescription = () => {
    if (!project.description) {
      return (
        <div className="flex items-start gap-3">
          <div className="mt-1 text-slate-400 dark:text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 italic">No description added yet</p>
          </div>
        </div>
      );
    }

    const isLongDescription = project.description.length > 200;
    const shouldTruncate = isLongDescription && !showFullDescription;

    return (
      <div className="mt-2">
        {shouldTruncate ? (
          <div 
            className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: truncateDescription(project.description) }}
          />
        ) : (
          <div 
            className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}
        {isLongDescription && (
          <button
            onClick={() => setShowDescriptionModal(true)}
            className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {showFullDescription ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    );
  };

  const handleProjectUpdate = async (e: React.FormEvent, updatedProject: any) => {
    e.preventDefault();
    if (projectId) {
      await updateProject({
        projectId: projectId as Id<"projects">,
        name: updatedProject.name,
        description: updatedProject.description || undefined,
        color: updatedProject.color,
      });
      setIsEditingProject(false);
    }
  };

  const handleProjectDelete = async () => {
    if (projectId) {
      await removeProject({ projectId: projectId as Id<"projects"> });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Projects</span>
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{project.name}</h1>
              {renderDescription()}
            </div>
            {/* Edit pencil button for entire project */}
            <button
              onClick={() => setIsEditingProject(true)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors dark:hover:bg-dark-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <ProgressCircle 
                progress={project.progress} 
                size={80}
                color={project.color}
              />
              <div>
                <div className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {project.completedSteps} of {project.totalSteps} steps completed
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {project.progress}% progress
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Steps</h2>
          
          {showCreateStep ? (
            <CreateStepForm
              projectId={project._id}
              onCancel={() => setShowCreateStep(false)}
              onSuccess={() => setShowCreateStep(false)}
            />
          ) : steps && steps.length > 0 ? (
            <StepList steps={steps} projectColor={project.color} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-dark-700">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2 dark:text-slate-200">No steps yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Add your first step to get started</p>
              <button
                onClick={() => setShowCreateStep(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Add First Step
              </button>
            </div>
          )}
          

        </div>
      </div>

      {/* Project Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col dark:bg-dark-800">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center dark:border-dark-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Project Description</h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
              >
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content with Scroll */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="prose max-w-none dark:prose-invert">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{project.name}</h2>
                <div 
                  className="text-slate-600 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description || '' }}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end dark:border-dark-700">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
          <div className="bg-white rounded-2xl max-w-md w-full dark:bg-dark-800 shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Project</h2>
                <button
                  onClick={() => setIsEditingProject(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
                >
                  <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleProjectUpdate(e, {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  color: formData.get('color') as string,
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={project.name}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={project.description || ''}
                    placeholder="Add project description..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={(e) => {
                          const form = e.currentTarget.closest('form');
                          if (form) {
                            const colorInput = form.querySelector('input[name="color"]') as HTMLInputElement;
                            if (colorInput) {
                              colorInput.value = color;
                            }
                          }
                        }}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          project.color === color
                            ? "ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                    <input type="hidden" name="color" value={project.color} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors dark:border-dark-700 dark:text-slate-300 dark:hover:bg-dark-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              <div className="border-t border-slate-200 dark:border-dark-700 mt-6 pt-6">
                <button
                  onClick={handleProjectDelete}
                  className="w-full py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}