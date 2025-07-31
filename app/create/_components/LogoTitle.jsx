"use client"
import React from "react";
import HeaderDesc from "./HeadingDesc";
import Lookup from "../../_data/Lookup.jsx";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function LogoTitle({ onHandleInputChange }) {
    const searchParam = useSearchParams();
    const [title, setTitle] = useState(searchParam?.get('title') ?? '');
    return (
        <div>
            <div className="my-10">
                <HeaderDesc title={Lookup.LogoTitle}
                    desc={Lookup.LogoTitileDesc} />
            </div>

            <input className='p-4 border rounded-lg mt-5 w-full' type="text" placeholder={Lookup.InputTitlePlaceholder}
                defaultValue={title}
                onChange={e => onHandleInputChange(e.target.value)}></input>
        </div>
    )
}

export default LogoTitle;