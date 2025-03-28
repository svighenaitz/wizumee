"use client"

import Accordion from '@/components/Accordion';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Input from '@/components/Input'
import DocxRenderer from '@/components/MyDoc';
import Section from '@/components/Section';
import DraggableTags from '@/components/DraggableTags';
import { useForm, FormProvider, Controller } from "react-hook-form";
import { StrictMode, useState } from 'react';
import ResumePreview from '@/components/ResumePreview';

export default function Home() {
  const [localTags, setLocalTags] = useState<string[]>(["ciao", "come", "va"]);
  
  const methods = useForm({
    defaultValues: {
      tags: localTags,
      phone: "123456",
      tag: '',
      fullName: 'John Developer',
      role: 'Full Stack Developer',
      email: 'john.developer@email.com',
      linkedin: 'https://linkedin.com/in/johndeveloper',
      github: 'https://github.com/johndeveloper',
      basedIn: 'San Francisco, CA',
      workExperiences: [
        {
          companyName: 'Tech Solutions Inc.',
          role: 'Senior Developer',
          startYear: '2020',
          endYear: '2023',
          description: 'Led a team of 5 developers in building a cloud-based SaaS platform. Implemented microservices architecture and improved system performance by 40%. Mentored junior developers and introduced modern development practices.'
        },
        {
          companyName: 'Digital Innovations Ltd.',
          role: 'Full Stack Developer',
          startYear: '2018',
          endYear: '2020',
          description: 'Developed and maintained multiple client-facing web applications using React and Node.js. Collaborated with UX team to implement responsive designs and improve user experience.'
        }
      ],
      projects: [
        {
          projectName: 'E-commerce Platform',
          role: 'Lead Developer',
          startYear: '2022',
          endYear: '2023',
          description: 'Built a full-stack e-commerce platform using Next.js and Node.js. Implemented secure payment processing, real-time inventory management, and achieved 99.9% uptime.'
        },
        {
          projectName: 'Mobile Analytics Dashboard',
          role: 'Full Stack Developer',
          startYear: '2021',
          endYear: '2022',
          description: 'Developed a responsive analytics dashboard that processes real-time data from multiple sources. Integrated data visualization libraries and implemented caching for improved performance.'
        }
      ],
      education: [
        {
          instituteName: 'University of Technology',
          degreeType: 'Bachelor of Science in Computer Science',
          year: '2018',
          grade: '3.8 GPA'
        },
        {
          instituteName: 'Tech Institute',
          degreeType: 'Master of Computer Science',
          year: '2020',
          grade: '3.9 GPA'
        }
      ]
    },
  });
  
  const { handleSubmit, control, setValue, getValues, watch } = methods;
  const watchTagInsert = watch("tags") as string[];
  
  const [experienceCount, setExperienceCount] = useState(2);
  const [projectCount, setProjectCount] = useState(2);
  const [educationCount, setEducationCount] = useState(2);

  const onSubmit = (data: any) => {
    console.log({ data }); // You can do something with the submitted data here
  };

  const handleSkillsReorder = (newTags: string[]) => {
    setLocalTags(newTags);
    setValue("tags", newTags);
  };

  const handleAddTag = () => {
    const allTags = getValues("tags");
    const insertingTag = getValues("tag");
    if (insertingTag && allTags.indexOf(insertingTag) === -1) {
      const newTags = [...allTags, insertingTag];
      setLocalTags(newTags);
      setValue("tags", newTags);
      setValue("tag", "");
    }
  };

  const addNewExperience = () => {
    setExperienceCount(prev => prev + 1);
  };

  const addNewProject = () => {
    setProjectCount(prev => prev + 1);
  };

  const addNewEducation = () => {
    setEducationCount(prev => prev + 1);
  };

  return (
    <StrictMode>
      <div>
        <nav className='left-0 top-0 z-10 mx-auto flex h-20 w-full items-center border-b-4 border-black bg-white py-16 px-8 m500:h-16'>
          <Avatar imageUrl='/icons/android-chrome-192x192.png' />
          <div className='mx-8 text-xl font-semibold'>Wizumee</div>
        </nav>
        <main className="min-h-screen grid grid-cols-2" >
          <FormProvider {...methods}>
            <div className='bg-[#c9dcd8] p-10'>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Section>
                  <Input label="Full Name" name="fullName" />
                  <Input label="Role/ Desired role" name="role" />
                </Section>
                <Section>
                  <Input label="Tel. number" name="phone" />
                  <Input label="Email" name="email" />
                  <Input label="Linkedin profile URL" name="linkedin" />
                  <Input label="Github profile URL" name="github" />
                  <Input label="Based in" name="basedIn" />
                </Section>
                <div className='mb-10'>
                  <h2 className="text-xl font-bold mb-6">Skills</h2>
                  <div className='flex flex-row-reverse mb-10 gap-4'>
                    <Button type='button' onClick={handleAddTag}>Add</Button>
                    <Input name="tag" />
                    Add a skill
                  </div>
                  <DraggableTags tags={localTags} onReorder={handleSkillsReorder} />
                </div>
                <div className='mb-10'>
                  <Accordion title='Work Experience'>
                    <div className="pb-14">
                      {[...Array(experienceCount)].map((_, index) => (
                        <div key={index} className='mb-6 p-4 border-b border-gray-200'>
                          <h3 className="w-full font-semibold mb-4">Experience {index + 1}</h3>
                          <div className='flex flex-wrap gap-4 mb-4'>
                            <Input 
                              label="Company name" 
                              name={`workExperiences.${index}.companyName`} 
                            />
                            <Input 
                              label="Role" 
                              name={`workExperiences.${index}.role`} 
                            />
                            <Input 
                              label="Start year" 
                              name={`workExperiences.${index}.startYear`} 
                              type="number" 
                              placeholder="YYYY"
                            />
                            <Input 
                              label="End year" 
                              name={`workExperiences.${index}.endYear`} 
                              type="number" 
                              placeholder="YYYY"
                            />
                          </div>
                          <Input 
                            label="Description" 
                            name={`workExperiences.${index}.description`} 
                            as="textarea"
                            className="w-full min-h-[100px] rounded-md border-2 border-black p-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none"
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        onClick={addNewExperience}
                        className="mt-4 absolute bottom-4 right-4"
                      >
                        Add Another Experience
                      </Button>
                    </div>
                  </Accordion>
                  <Accordion title='Projects'>
                    <div className="pb-14">
                      {[...Array(projectCount)].map((_, index) => (
                        <div key={index} className='mb-6 p-4 border-b border-gray-200'>
                          <h3 className="w-full font-semibold mb-4">Project {index + 1}</h3>
                          <div className='flex flex-wrap gap-4 mb-4'>
                            <Input 
                              label="Project name" 
                              name={`projects.${index}.projectName`} 
                            />
                            <Input 
                              label="Role" 
                              name={`projects.${index}.role`} 
                            />
                            <Input 
                              label="Start year" 
                              name={`projects.${index}.startYear`} 
                              type="number" 
                              placeholder="YYYY"
                            />
                            <Input 
                              label="End year" 
                              name={`projects.${index}.endYear`} 
                              type="number" 
                              placeholder="YYYY"
                            />
                          </div>
                          <Input 
                            label="Description" 
                            name={`projects.${index}.description`} 
                            as="textarea"
                            className="w-full min-h-[100px] rounded-md border-2 border-black p-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none"
                            placeholder="Describe the project, technologies used, and your achievements..."
                          />
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        onClick={addNewProject}
                        className="mt-4 absolute bottom-4 right-4"
                      >
                        Add Another Project
                      </Button>
                    </div>
                  </Accordion>
                  <Accordion title='Education'>
                    <div className="pb-14">
                      {[...Array(educationCount)].map((_, index) => (
                        <div key={index} className='mb-6 p-4 border-b border-gray-200'>
                          <h3 className="w-full font-semibold mb-4">Education {index + 1}</h3>
                          <div className='flex flex-wrap gap-4 mb-4'>
                            <Input 
                              label="Name of Institute" 
                              name={`education.${index}.instituteName`} 
                              placeholder="University or College name"
                            />
                            <Input 
                              label="Type of Degree" 
                              name={`education.${index}.degreeType`} 
                              placeholder="e.g., Bachelor of Science, Master's"
                            />
                            <Input 
                              label="Year" 
                              name={`education.${index}.year`} 
                              type="number"
                              placeholder="YYYY"
                            />
                            <Input 
                              label="Grade" 
                              name={`education.${index}.grade`} 
                              placeholder="e.g., 3.8 GPA, First Class"
                            />
                          </div>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        onClick={addNewEducation}
                        className="mt-4 absolute bottom-4 right-4"
                      >
                        Add Another Education
                      </Button>
                    </div>
                  </Accordion>
                </div>
                <div>
                  <Button type="submit">Download</Button>
                </div>
              </form>
            </div>
            <div className='p-10'>
              <ResumePreview />
            </div>
          </FormProvider>
        </main>
      </div>
    </StrictMode>
  )
}
