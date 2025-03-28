import React from 'react';
import { useFormContext } from 'react-hook-form';

const ResumePreview = () => {
  const { watch } = useFormContext();
  const formData = watch();

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{formData.fullName}</h1>
        <p className="text-xl text-gray-700 mb-4">{formData.role}</p>
        <div className="flex flex-wrap gap-4 text-gray-600">
          <span>{formData.email}</span>
          <span>{formData.phone}</span>
          <span>{formData.basedIn}</span>
          <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a>
          <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {formData.tags?.map((skill: string, index: number) => (
            <span key={index} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Work Experience Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Work Experience</h2>
        {formData.workExperiences?.map((exp: any, index: number) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold">{exp.companyName}</h3>
            <p className="text-gray-600">{exp.role} • {exp.startYear} - {exp.endYear}</p>
            <p className="mt-2 text-gray-700 whitespace-pre-line">{exp.description}</p>
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Projects</h2>
        {formData.projects?.map((project: any, index: number) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold">{project.projectName}</h3>
            <p className="text-gray-600">{project.role} • {project.startYear} - {project.endYear}</p>
            <p className="mt-2 text-gray-700 whitespace-pre-line">{project.description}</p>
          </div>
        ))}
      </div>

      {/* Education Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">Education</h2>
        {formData.education?.map((edu: any, index: number) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-semibold">{edu.instituteName}</h3>
            <p className="text-gray-600">{edu.degreeType} • {edu.year}</p>
            <p className="text-gray-700">{edu.grade}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumePreview; 