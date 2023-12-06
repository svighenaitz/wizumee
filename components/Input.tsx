"use client"
import React from "react";
import { useFormContext } from "react-hook-form";

interface Props extends React.ComponentPropsWithoutRef<"input"> {
  label?: string
  setValue?: React.Dispatch<React.SetStateAction<string>>
  placeholder?: string
  name?: any
}

const Input = ({ label, setValue, placeholder, name, ...rest }: Props) => {
  const { register } = useFormContext();

  return (
    <div>
      <p>{label}</p>
      <input
        className="rounded-md border-2 border-black p-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none"
        type="text"
        aria-label={placeholder}
        {...register(name)}
        {...rest}
      />
    </div>
  )
}

export default Input