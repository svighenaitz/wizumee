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
      basedIn: 'San Francisco, CA'
    },
  });
  
  const { handleSubmit, control, setValue, getValues, watch } = methods;
  const watchTagInsert = watch("tags") as string[];
  
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

  return (
    <StrictMode>
      <div>
        <nav className='left-0 top-0 z-10 mx-auto flex h-20 w-full items-center border-b-4 border-black bg-white py-16 px-8 m500:h-16'>
          <Avatar imageUrl='/icons/android-chrome-192x192.png' />
          <div className='mx-8 text-xl font-semibold'>Wizumee</div>
        </nav>
        <main className="min-h-screen grid grid-cols-2" >
          <div className='bg-[#c9dcd8] p-10'>
            <FormProvider {...methods}>
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
                  <Accordion title='Work Experience'> </Accordion>
                  <Accordion title='Projects'>  </Accordion>
                  <Accordion title='Education'>  </Accordion>
                </div>
                <div>
                  <Button type="submit">Download</Button>
                </div>
              </form>
            </FormProvider>
          </div>
          <div className='p-10'>
            <DocxRenderer />
          </div>
        </main>
      </div>
    </StrictMode>
  )
}
