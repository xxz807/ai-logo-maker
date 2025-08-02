"use client"
import React, { useContext, useEffect, useState } from 'react'
import { UserDetailContext } from '../_context/UserDetailContext'
import Prompt from '../_data/Prompt'; 
import axios from 'axios';
import Image from 'next/image';
import { Loader2 } from 'lucide-react'; 

const MakeLogo = () => {
    const { userDetail } = useContext(UserDetailContext);
    const [formData, setFormData] = useState(null); 
    const [loading, setLoading] = useState(false);
    const [logoImage, setLogoImage] = useState(null); 
    const [error, setError] = useState(null);

    // Effect 1: 从 localStorage 加载 formData
    useEffect(() => {
        if (typeof window !== "undefined" && userDetail?.email) {
            const storage = localStorage.getItem('formData');
            if (storage) {
                try {
                    const parsedData = JSON.parse(storage);
                    setFormData(parsedData);
                    console.log("Loaded formData from localStorage:", parsedData);
                } catch (e) {
                    console.error("Error parsing formData from localStorage:", e);
                    setError("Failed to load saved data. Please try again.");
                }
            } else {
                console.log("No formData found in localStorage.");
            }
        }
    }, [userDetail]); 

    // Effect 2: 当 formData 准备好时，调用 MakeAILogo
    useEffect(() => {
        if (formData?.title && !loading) {
            MakeAILogo();
        }
    }, [formData]); 
    const MakeAILogo = async () => {
        setLoading(true);
        setError(null);
        setLogoImage(null); 

        try {
            const PROMPT = Prompt.LOGO_PROMPT
                .replace('{logoTitle}', formData?.title || '') 
                .replace('{logoDesc}', formData?.desc || '')
                .replace('{logoColor}', formData?.palette || '')
                .replace('{logoIdea}', formData?.idea || '')
                .replace('{logoDesign}', formData?.design?.title || '')
                .replace('{logoPrompt}', formData?.design?.prompt || '');

            console.log("------start to call /api/ai-logo-model with PROMPT:", PROMPT.substring(0, 100) + "...");

            const result = await axios.post('/api/ai-logo-model', {
                prompt: PROMPT,
                email: userDetail?.email, 
                title: formData.title,
                desc: formData.desc
            });

            console.log("------end to call /api/ai-logo-model, try to parse" + result.data);
            if (result.data?.image) {
                setLogoImage(result.data.image);
                console.log("Logo image data received and set:", result.data.image.substring(0, 100) + "..."); 
            } else {
                console.error("API did not return image data:", result.data);
                setError("Failed to get image data from the server. Response was incomplete.");
            }

        } catch (err) {
            console.error("Error making logo:", err);
            if (axios.isAxiosError(err) && err.response) {
                const apiErrorMessage = err.response.data?.error || err.response.data?.details || err.message;
                setError(`Failed to create logo: ${apiErrorMessage}.`);
            } else {
                setError("An unexpected error occurred while making the logo. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
            {loading ? (
                <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 text-lg">Creating your custom logo...</p>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center">
                    <p>{error}</p>
                    <button
                        className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                        onClick={MakeAILogo}
                    >
                        Try Again
                    </button>
                </div>
            ) : logoImage ? (
                <div className="flex flex-col items-center">
                    <div className="border rounded-lg p-4 shadow-md">
                        <Image
                            src={logoImage}
                            alt="Generated Logo"
                            width={300}
                            height={300}
                            className="rounded-md"
                            priority
                            unoptimized 
                            onError={(e) => {
                                console.error("Image loading error on frontend:", e);
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/placeholder-broken-image.png";
                                setError("Generated image could not be displayed. It might be corrupted.");
                            }}
                        />
                    </div>
                    <button
                        className="mt-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                        onClick={MakeAILogo}
                    >
                        Make Another Logo
                    </button>
                </div>
            ) : (
                <p>Preparing to make your logo...</p>
            )}
        </div>
    )
}

export default MakeLogo