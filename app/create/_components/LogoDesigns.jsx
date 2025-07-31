"use client"
import React from "react";
import Lookup from "@/app/_data/Lookup";
import LogoDesign from "@/app/_data/LogoDesign";
import HeadingDesc from "./HeadingDesc";
import Image from "next/image";
import { useState } from "react";



function LogoDesigns({ onHandleInputChange, formData }) {

    const [selectedOption, setSelectedOption] = useState(formData?.design?.title);
    return (
        <div className="my-10">
            <HeadingDesc title={Lookup.LogoDesignTitle}
                desc={Lookup.LogoDesignDesc} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mt-10">
                {LogoDesign.map((design, index) => (
                    <div key={index}
                        onClick={() => {
                            setSelectedOption(design.title);
                            onHandleInputChange(design);
                        }}
                        className={`p-1 hover:border-2 border-primary rounded-xl ${selectedOption == design.title && 'border-2 rounded-xl border-primary'}`}>
                        <Image src={design.image} alt={design.title} width={300}
                            height={200}
                            className='w-full rounded-xl h-[150px] object-cover'
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LogoDesigns;