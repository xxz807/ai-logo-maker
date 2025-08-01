"use client"
import React, { useEffect, useState } from 'react'
import HeaderDesc from "./HeadingDesc";
import Lookup from "../../_data/Lookup.jsx";
import { useSearchParams } from "next/navigation";

function LogoTitle({ onHandleInputChange }) {
    const searchParam = useSearchParams();
    const [title, setTitle] = useState(searchParam?.get('title') ?? '');

    useEffect(() => {
        if (title) {
            console.log("Calling onHandleInputChange for initial title:", title); 
            onHandleInputChange(title);
        }
    }, []); 

    const handleInputChange = (e) => {
        onHandleInputChange(e.target.value);
    };

    return (
        <div>
            <div className="my-10">
                <HeaderDesc title={Lookup.LogoTitle}
                    desc={Lookup.LogoTitileDesc} />
            </div>

            <input
                className='p-4 border rounded-lg mt-5 w-full'
                type="text"
                placeholder={Lookup.InputTitlePlaceholder}
                defaultValue={title} 
                onChange={handleInputChange} 
            />
        </div>
    )
}

export default LogoTitle;