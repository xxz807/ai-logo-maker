"use client";
import { UserDetailContext } from "@/app/_context/UserDetailContext";
import axios from "axios";
import React from "react";
import Image from "next/image";import { useEffect, useState, useContext } from "react";

function LogoList() {

    const { userDetail } = useContext(UserDetailContext);
    const [logoList, setLogoList] = useState([]);
    useEffect(() => {
        fetchLogoList();
    }, [userDetail]);

    const fetchLogoList = async () => {
        if (userDetail?.email) {
            const response = await axios.get(`/api/logos?email=${userDetail?.email}`);
            if (response.data && Array.isArray(response.data)) {
            setLogoList(prev => [...prev, ...response.data]);
            } else {
                console.error("API response for logos is not an array:", response.data);
                setError("Failed to parse logo list from server.");
                setLogoList([]);
            }
        }
    }

    const ViewLogo = (image) => {
        const imageWindow = window.open();
        imageWindow.document.write(`<img src="${image}" alt="Base64 Image">`);
    }
    return (
        <div className="mt-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {logoList?.length > 0 ? logoList.map((logo, index) => (
                    <div key={index} className="hover:scale-105 transition-all cursor-pointer"
                    onClick={()=> ViewLogo(logo?.image)}>
                        <Image src={logo?.image} alt={logo?.title} width={400} height={200} 
                        className="w-full rounded-xl"/>
                        <h2 className="text-center text-lg font-medium mt-2">{logo?.title}</h2>
                        <p className="text-sm text-gray-500 text-center">{logo?.desc}</p>
                    </div>
                ))
                    : [1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="bg-slate-200 animate-pulse rounded-xl w-full h-[200px]"></div>))
                }
            </div>
        </div>
    )
}

export default LogoList;