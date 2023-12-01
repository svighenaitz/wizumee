"use client"
import React from "react";
import { useForm } from "react-hook-form";

interface Props extends React.ComponentPropsWithoutRef<"input"> {
    value?: string
    setValue?: React.Dispatch<React.SetStateAction<string>>
    placeholder?: string
    register?: any
    name?: any
  }
  
  const Input = ({ value, setValue, placeholder,register, name, ...rest }: Props) => {
    return (
      <input
        className="rounded-md border-2 border-black p-[10px] font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-[3px] focus:translate-y-[3px] focus:shadow-none"
        type="text"
        aria-label={placeholder}
        {...register(name)} 
        {...rest}
      />
    )
  }
  
  export default React.forwardRef(Input)