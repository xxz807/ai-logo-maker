"use client"
import React, { useContext, useEffect, useState } from 'react'
import { UserDetailContext } from '../_context/UserDetailContext'
import Prompt from '../_data/Prompt'; // 确保这个路径和导入是正确的
import axios from 'axios';
import Image from 'next/image'; // 导入 next/image
import { Loader2 } from 'lucide-react'; // 如果您有 lucide-react 安装

const MakeLogo = () => {
    const { userDetail } = useContext(UserDetailContext);
    const [formData, setFormData] = useState(null); // 初始化为 null，避免 undefined 行为
    const [loading, setLoading] = useState(false);
    const [logoImage, setLogoImage] = useState(null); // 初始化为 null
    const [error, setError] = useState(null);

    // Effect 1: 从 localStorage 加载 formData
    useEffect(() => {
        // 确保在客户端环境且 userDetail 已加载
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
                // 如果 localStorage 中没有 formData，可以考虑初始化一个默认值
                console.log("No formData found in localStorage.");
                // setFormData({ /* default initial values */ });
            }
        }
    }, [userDetail]); // 仅当 userDetail 变化时运行

    // Effect 2: 当 formData 准备好时，调用 MakeAILogo
    useEffect(() => {
        // 确保 formData 存在且其 title 属性存在，并且当前不是在加载状态，避免重复调用
        if (formData?.title && !loading) {
            MakeAILogo();
        }
    }, [formData]); // 仅当 formData 变化时运行

    const MakeAILogo = async () => {
        // 每次开始新请求时，清除旧的错误和图片
        setLoading(true);
        setError(null);
        setLogoImage(null); // 清除旧图片，显示加载状态

        try {
            // 确保 Prompt.LOGO_PROMPT 是一个字符串并且包含所有占位符
            const PROMPT = Prompt.LOGO_PROMPT
                .replace('{logoTitle}', formData?.title || '') // 提供空字符串作为备用
                .replace('{logoDesc}', formData?.desc || '')
                .replace('{logoColor}', formData?.palette || '')
                .replace('{logoIdea}', formData?.idea || '')
                .replace('{logoDesign}', formData?.design?.title || '')
                .replace('{logoPrompt}', formData?.design?.prompt || '');

            console.log("------start to call /api/ai-logo-model with PROMPT:", PROMPT.substring(0, 100) + "..."); // 打印 PROMPT 方便调试

            const result = await axios.post('/api/ai-logo-model', {
                prompt: PROMPT,
                email: userDetail?.email, // 确保 userDetail 已加载
                title: formData.title,
                desc: formData.desc
            });

            console.log("------end to call /api/ai-logo-model, try to parse" + result.data);
            // 检查 API 响应是否包含 image 数据
            if (result.data?.image) {
                setLogoImage(result.data.image);
                console.log("Logo image data received and set:", result.data.image.substring(0, 100) + "..."); // 打印前100字符
            } else {
                console.error("API did not return image data:", result.data);
                setError("Failed to get image data from the server. Response was incomplete.");
            }

        } catch (err) {
            console.error("Error making logo:", err);
            // 更详细的错误反馈
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
                // 核心改动在这里：添加 unoptimized prop
                <div className="flex flex-col items-center">
                    <div className="border rounded-lg p-4 shadow-md">
                        <Image
                            src={logoImage}
                            alt="Generated Logo"
                            width={300}
                            height={300}
                            className="rounded-md"
                            priority
                            unoptimized // <-- 添加这个 prop
                            onError={(e) => {
                                console.error("Image loading error on frontend:", e);
                                // Fallback to a placeholder or show error if image fails to load
                                e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
                                e.currentTarget.src = "/placeholder-broken-image.png"; // Fallback placeholder
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
                // 初始状态或没有图片时的显示
                <p>Preparing to make your logo...</p>
                // 如果您想显示“Made Logo”那个占位符，可以在这里：
                // <div className="border rounded-lg p-4 shadow-md w-[300px] h-[300px] flex flex-col items-center justify-center">
                //    <img src="/path-to-your-broken-image-icon.png" alt="Placeholder" />
                //    <p className="mt-2">Made Logo</p>
                // </div>
            )}
        </div>
    )
}

export default MakeLogo