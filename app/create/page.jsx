"use client"
import React, { useState } from "react";
import LogoTitle from "./_components/LogoTitle";
import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LogoDesc from "./_components/LogoDesc";
import LogoColorPallete from "./_components/LogoColorPallete";
import LogoDesigns from "./_components/LogoDesigns";
import LogoIdea from "./_components/LogoIdea";
import PricingModel from "./_components/PricingModel";


function CreateLogo() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState();

    const onHandleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
        
        console.log(formData)
    }
    return (
        <div className="mt-28 p-10 border rounded-xl 2xl:mx-72">
            {step == 1 ?
                <LogoTitle onHandleInputChange={(v) => onHandleInputChange('title', v)} formData={formData} />
                : step == 2 ?
                    <LogoDesc onHandleInputChange={(v) => onHandleInputChange('desc', v)} formData={formData}></LogoDesc>
                    : step == 3 ?
                        <LogoColorPallete onHandleInputChange={(v) => onHandleInputChange('palette', v)} formData={formData}></LogoColorPallete>
                        : step == 4 ?
                            <LogoDesigns onHandleInputChange={(v) => onHandleInputChange('design', v)} formData={formData}></LogoDesigns>
                            : step == 5 ?
                                <LogoIdea onHandleInputChange={(v) => onHandleInputChange('idea', v)} formData={formData}></LogoIdea>
                                : step == 6 ?
                                <PricingModel onHandleInputChange={(v) => onHandleInputChange('pricing', v)} formData={formData}></PricingModel>
                                : null
            }
            <div className="flex justify-between items-center mt-10">
                {step != 1 && <Button variant='outline'
                onClick={() => setStep(step - 1)}><ArrowLeft />Previous</Button>}
                <Button onClick={() => setStep(step + 1)}><ArrowRight />Continue</Button>
            </div>
        </div>
    )
}

export default CreateLogo;