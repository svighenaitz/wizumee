"use client"

import Button from '@/components/Button';
import Input from '@/components/Input'
import { useForm } from "react-hook-form";


export default function Home() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data:any) => {
    console.log(data); // You can do something with the submitted data here
  };

  return (
    <main className="min-h-screen grid grid-cols-2" >
      <div className='bg-[#c9dcd8] p-10'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <p>Full Name</p>
          <Input name="fullName" register={register} />
          <Button type="submit">Submit</Button>
        </form>

        
      </div>
      <div className='p-10'>
        <p>ciao</p>
      </div>
    </main>
  )
}
