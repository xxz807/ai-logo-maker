"use client"
import React, { useEffect, useState, useRef } from 'react'
import HeaderDesc from "./HeadingDesc";
import Lookup from "../../_data/Lookup.jsx";
import { useSearchParams, useRouter } from 'next/navigation';

function LogoTitle({ onHandleInputChange, formData }) {
    const searchParam = useSearchParams();
    const router = useRouter();
    const isInitialMount = useRef(true);

    const initialTitleFromUrl = searchParam?.get('title');

    const [formDataTitle, setFormDataTitle] = useState(() => {
        if (initialTitleFromUrl) {
            return initialTitleFromUrl;
        }
        return formData?.title ?? '';
    });

    useEffect(() => {
        if (formData?.title !== undefined && formData?.title !== formDataTitle) {
            setFormDataTitle(formData?.title);
        }
    }, [formData?.title]);

    useEffect(() => {
        if (formDataTitle) {
            console.log("Calling onHandleInputChange for initial title:", formDataTitle);
            onHandleInputChange(formDataTitle);
        }
    }, []);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (formDataTitle) {
            const currentSearchParams = new URLSearchParams(window.location.search);
            currentSearchParams.set('title', formDataTitle);
            router.replace(`?${currentSearchParams.toString()}`, { scroll: false });
        } else {
            const currentSearchParams = new URLSearchParams(window.location.search);
            currentSearchParams.delete('title');
            router.replace(`?${currentSearchParams.toString()}`, { scroll: false });
        }
    }, [formDataTitle, router]);


    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setFormDataTitle(newValue);
        onHandleInputChange(newValue);
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
                value={formDataTitle}
                onChange={handleInputChange}
            />
        </div>
    )
}

export default LogoTitle;