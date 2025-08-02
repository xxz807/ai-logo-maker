"use client"
import React, { Suspense, useState, useEffect } from "react";
import LogoTitle from "./_components/LogoTitle";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoDesc from "./_components/LogoDesc";
import LogoColorPallete from "./_components/LogoColorPallete";
import LogoDesigns from "./_components/LogoDesigns";
import LogoIdea from "./_components/LogoIdea";
import PricingModel from "./_components/PricingModel";
import { toast } from "sonner";


function CreateLogo() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        palette: '',
        design: {
            title: '',
            prompt: '',
            image: ''
        },
        idea: '',
        pricing: '',
    });

    useEffect(() => {
        console.log("Parent formData (updated):", formData);
        localStorage.setItem('formData', JSON.stringify(formData));
    }, [formData]);

    const onHandleInputChange = (field, value) => {
        setFormData(prev => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const handleContinue = () => {
        if (step === 1) {
            console.log(formData?.title)
            if (!formData?.title) {
                toast.error('Validation Error', {
                    description: 'The "Title" field cannot be empty. Please provide a value to continue.',
                });
                return;
            }
        }
        setStep(step + 1);
    };

    return (
        <div className="mt-28 p-10 border rounded-xl 2xl:mx-72">
            {step === 1 && (
                <Suspense fallback={<div>Loading title form...</div>}>
                    <LogoTitle onHandleInputChange={(v) => onHandleInputChange('title', v)} formData={formData} />
                </Suspense>
            )}
            {step === 2 && (
                <LogoDesc onHandleInputChange={(v) => onHandleInputChange('desc', v)} formData={formData} />
            )}
            {step === 3 && (
                <LogoColorPallete onHandleInputChange={(v) => onHandleInputChange('palette', v)} formData={formData} />
            )}
            {step === 4 && (
                <LogoDesigns onHandleInputChange={(v) => onHandleInputChange('design', v)} formData={formData} />
            )}
            {step === 5 && (
                <LogoIdea onHandleInputChange={(v) => onHandleInputChange('idea', v)} formData={formData} />
            )}
            {step === 6 && (
                <PricingModel onHandleInputChange={(v) => onHandleInputChange('pricing', v)} formData={formData} />
            )}

            <div className="flex justify-between items-center mt-10">
                {step !== 1 && (
                    <Button variant='outline'
                        onClick={() => setStep(step - 1)}><ArrowLeft />Previous</Button>
                )}
                {step !== 6 && (
                    <Button onClick={handleContinue}><ArrowRight />Continue</Button>
                )}
            </div>
        </div>
    )
}

export default CreateLogo;