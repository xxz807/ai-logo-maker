"use client"
import React, { useEffect, useState } from 'react'
import HeaderDesc from "./HeadingDesc";
import Lookup from "../../_data/Lookup.jsx";

function LogoTitle({ onHandleInputChange, formData }) {

    useEffect(() => {
        if (formData?.title) {
            console.log("Calling onHandleInputChange for initial title:", formData?.title); 
            onHandleInputChange(formData?.title);
        }
    }, []); 

    const handleInputChange = (e) => {
        onHandleInputChange(e.target.value);
    };

    return (
        <div>
            <div className="my-10">
                <HeaderDesc title={Lookup.LogoTitle}
                    desc={Lookup.LogoTitleDesc} />
            </div>

            <input
                className='p-4 border rounded-lg mt-5 w-full'
                type="text"
                placeholder={Lookup.InputTitlePlaceholder}
                defaultValue={formData?.title} 
                onChange={handleInputChange} 
            />
        </div>
    )
}

export default LogoTitle;