import React from "react";
import { useEffect, useState } from "react";


function LogoIdea({formData, onHandleInputChange}) {
    const [ideas, setIdeas] = useState()
    const [loading, setLoading] = useState(false)
    const [selectedOption, setSelectedOption] = useState();
    useEffect(() => {
        generateLogoDesignIdea();
    })

    const generateLogoDesignIdea = async () => {
        //setLoading(true)
        //const PROMPT = Prompt.DESIGN_IDEA_PROMPT
        
    }

    return (
        <div>
            LogoIdea
        </div>
    )
}

export default LogoIdea;