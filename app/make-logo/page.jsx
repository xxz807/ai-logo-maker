"use client"
import React, { useContext, useEffect, useState, Suspense } from 'react'
import { UserDetailContext } from '../_context/UserDetailContext'
import Prompt from '../_data/Prompt';
import axios from 'axios';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation'; 
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const MakeLogoContent = () => {
    const { userDetail } = useContext(UserDetailContext);
    const [logoData, setLogoData] = useState();
    const [loading, setLoading] = useState();
    const [logoImage, setLogoImage] = useState();
    const [error, setError] = useState();
    const searchParams = useSearchParams(); 
    const modelType = searchParams.get('type');

    useEffect(() => {
        console.log("---------------- start userDetail." + JSON.stringify(userDetail));
        if (typeof window !== "undefined" && userDetail?.email) {
            console.log("---------------- start localStorage.");
            const storage = localStorage.getItem('formData');
            console.log("---------------- end localStorage..");
            if (storage) {
                try {
                    const parsedData = JSON.parse(storage);
                    setLogoData(parsedData);
                    console.log("Loaded logoData from localStorage:", parsedData);
                } catch (e) {
                    console.error("Error parsing logoData from localStorage:", e);
                    setError("Failed to load saved data. Please try again.");
                }
            } else {
                console.log("No logoData found in localStorage.");
            }
        }
    }, [userDetail]);

    useEffect(() => {
        console.log("---------------- start MakeAILogo.");
        if (logoData?.title && !loading && userDetail?.email && modelType) {
            MakeAILogo();
        } else {
            console.log("MakeAILogo NOT called. Conditions:", {
                logoTitle: logoData?.title,
                loading: loading,
                userEmail: userDetail?.email,
                modelType: modelType
            });
        }
    }, [logoData, loading, userDetail?.email, modelType]); 

    const MakeAILogo = async () => {
        if (modelType === 'Premium' && (!userDetail || userDetail.credits === undefined || userDetail.credits < 5)) { // 假设 Premium 需要 5 个积分
             setError("You don't have enough credits to make a logo. Please upgrade to Premium to get more credits.");
             toast.error("Not Enough Credits", { description: "You don't have enough credits to make a logo. Please upgrade to Premium to get more credits." });
             return;
         }

        setLoading(true);
        setError(null);
        setLogoImage(null);

        try {
            const PROMPT = Prompt.LOGO_PROMPT
                .replace('{logoTitle}', logoData?.title || '')
                .replace('{logoDesc}', logoData?.desc || '')
                .replace('{logoColor}', logoData?.palette || '')
                .replace('{logoIdea}', logoData?.idea || '')
                .replace('{logoDesign}', logoData?.design?.title || '')
                .replace('{logoPrompt}', logoData?.design?.prompt || '');

            console.log("------start to call /api/ai-logo-model with PROMPT:", PROMPT.substring(0, 100) + "...");

            const result = await axios.post('/api/ai-logo-model', {
                prompt: PROMPT,
                email: userDetail?.email,
                title: logoData.title,
                desc: logoData.desc,
                credits: userDetail?.credits, 
                type: modelType
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

    const handleDownloadLogo = () => {
        if (logoImage) {
            const link = document.createElement('a');
            link.href = logoImage;

            let filename = 'generated-logo';
            if (logoImage.startsWith('data:image/')) {
                const mimeTypeMatch = logoImage.match(/^data:([^;]+);/);
                if (mimeTypeMatch && mimeTypeMatch[1]) {
                    const mimeType = mimeTypeMatch[1];
                    if (mimeType.includes('image/png')) filename += '.png';
                    else if (mimeType.includes('image/jpeg')) filename += '.jpeg';
                    else if (mimeType.includes('image/webp')) filename += '.webp';
                    else if (mimeType.includes('image/svg+xml')) filename += '.svg';
                    else filename += '.bin';
                } else {
                    filename += '.bin';
                }
            } else {
                const urlParts = logoImage.split('/');
                const lastPart = urlParts[urlParts.length - 1];
                if (lastPart.includes('.')) {
                    filename = lastPart;
                } else {
                    filename += '.webp';
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.warn("No logo image available to download.");
        }
    };


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
                    <div className="flex gap-4 mt-6">
                        <Button
                            className="px-4 py-2 rounded-md hover:cursor-pointer"
                            onClick={MakeAILogo}
                        >
                            Make Another Logo
                        </Button>
                        <Button
                            className="px-4 py-2 rounded-md hover:cursor-pointer"
                            onClick={handleDownloadLogo}
                        >
                            Download Logo
                        </Button>
                        <Link href={'/create'}>
                            <Button
                                className="px-4 py-2 rounded-md hover:cursor-pointer">
                                Create New Logo
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <p>Preparing to make your logo...</p>
            )}
        </div>
    )
}

export default function MakeLogoPageWrapper() {
    return (
        <Suspense fallback={<div>Loading logo generation interface...</div>}>
            <MakeLogoContent />
        </Suspense>
    );
}