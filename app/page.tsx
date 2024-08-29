"use client"

import Accordion from '@/components/Accordion';
import Avatar from '@/components/Avatar';
import Button from '@/components/Button';
import Input from '@/components/Input'
import DocxRenderer from '@/components/MyDoc';
import Section from '@/components/Section';
import TagHolder from '@/components/TagHolder';
import { useForm, FormProvider, Controller } from "react-hook-form";


export default function Home() {

  const methods = useForm({
    defaultValues: {
      tags: ["ciao"],
      phone: "123456",
      tag: ''
    },
  });
  const { handleSubmit, control, setValue, getValues, watch } = methods;
  const watchTagInsert = watch<string[]>("tags")
  const onSubmit = (data: any) => {
    console.log({ data }); // You can do something with the submitted data here
  };

  return (
    <div>
      <nav className='left-0 top-0 z-10 mx-auto flex h-20 w-full items-center border-b-4 border-black bg-white px-5 m500:h-16'>
        <Avatar imageUrl='/icons/android-chrome-192x192.png' />
        <span className='mx-5'>Wizumee</span>
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
                <div className='flex flex-row-reverse mb-10 gap-4'>
                  <Button type='button' onClick={() => {
                    const allTags = getValues("tags")
                    const insertingTag = getValues("tag")
                    if (allTags.indexOf(insertingTag) === -1) {
                      setValue("tags", [...getValues("tags"), getValues("tag")])
                    }
                  }} >Add</Button>
                  <Input name="tag" />
                  Add a skill
                </div>
                <TagHolder tags={watchTagInsert} />

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
  )
}
