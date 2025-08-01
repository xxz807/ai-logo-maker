"use client"
import React, { useEffect, useState } from 'react'
import HeadingDesc from './HeadingDesc'
import Lookup from '../../_data/Lookup'
import Prompt from '../../_data/Prompt'
import axios from 'axios'
import { Loader2Icon } from 'lucide-react'

const LogoIdea = ({ formData, onHandleInputChange }) => {
    const [ideas, setIdeas] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (formData?.title) {
            console.log("useEffect: Initializing idea generation.");
            generateLogoDesignIdea();
        }
    }, [formData?.title, formData?.desc, formData?.design?.title, formData?.design?.prompt]); 

    const generateLogoDesignIdea = async () => {
        setLoading(true);
        setIdeas(null); 
        const PROMPT = Prompt.DESIGN_IDEA_PROMPT
            .replace('{logoType}', formData?.design?.title || '')
            .replace('{logoTitle}', formData.title || '')
            .replace('{logoDesc}', formData.desc || '')
            .replace('{logoPrompt}', formData?.design?.prompt || '')

        console.log("PROMPT for AI ideas:", PROMPT);

        try {
            const result = await axios.post('/api/ai-design-ideas', {
                prompt: PROMPT
            })

            console.log("AI ideas result data:", result.data);

            if (result.data && result.data.ideas) {
                setIdeas(result.data.ideas);
            } else {
                console.warn("AI did not return ideas in the expected format.");
                setIdeas([]); 
            }
        } catch (error) {
            console.error("Error generating logo design ideas:", error);
            setIdeas([]);
        } finally {
            setLoading(false);
        }
    }

    const handleIdeaClick = (item) => {
        console.log("-------------Clicked idea: " + item); 
        onHandleInputChange(item); 
    };

    const handleAIChoiceClick = () => {
        const aiChoice = 'Let AI Select the best idea';
        console.log("-------------Clicked: " + aiChoice);
        onHandleInputChange(aiChoice);
    };


    return (
        <div className='my-10'>
            <HeadingDesc
                title={Lookup.LogoIdeaTitle}
                description={Lookup.LogoIdeaDesc} />
            <div className='flex items-center justify-center'>
                {loading && <Loader2Icon className='animate-spin my-10' size={40} />} {/* 增加 Loader2Icon 的大小 */}
            </div>

            <div className='flex flex-wrap gap-3 mt-6'>
                {/* 确保 ideas 存在且不是空数组 */}
                {ideas && ideas.length > 0 ? (
                    ideas.map((item, index) => (
                        <h2 key={index}
                            onClick={() => handleIdeaClick(item)}
                            className={`p-2 rounded-full border px-3 cursor-pointer
                                hover:border-primary ${formData?.idea == item ? 'border-primary' : ''}`}
                        >
                            {item}
                        </h2>
                    ))
                ) : (
                    !loading && <p>No ideas generated yet. Please provide more details.</p>
                )}

                {/* Let AI Select the best idea 按钮 */}
                <h2
                    onClick={handleAIChoiceClick}
                    className={`p-2 rounded-full border px-3 cursor-pointer
                        hover:border-primary ${formData?.idea == 'Let AI Select the best idea' ? 'border-primary' : ''}`}
                >
                    Let AI Select the best idea
                </h2>
            </div>
        </div>
    )
}

export default LogoIdea