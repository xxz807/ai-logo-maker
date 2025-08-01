import { AILogoPrompt } from "../../configs/Aimodel";
import { db } from "../../configs/FirebaseConfig";

import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

// AIGuruLab API configuration
const BASE_URL = 'https://aigurulab.tech';
const API_KEY = process.env.AIGURU_API_KEY; // Store this in your .env file

export async function POST(req) {
    const { prompt, email, title, desc } = await req.json();

    try {
        
        console.log("------------start to generate logo prompt");
        // Step 1: Generate AI text prompt for logo using your existing model
        //const AiPromptResult = await AILogoPrompt.sendMessage(prompt);
        //const AIPrompt = JSON.parse(AiPromptResult.response.text()).prompt;
        //console.log("Generated logo prompt:", AIPrompt);

        console.log("------------start to call huggingface");
        // Step 2: Use AIGuruLab API to generate the image
        const response = await axios.post(
            `https://router.huggingface.co/fal-ai/fal-ai/flux-lora`,

            //AIPrompt,
            prompt,
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                responseType: 'arraybuffer'
            }
        );

        console.log("------------end to call huggingface");

        const buffer = Buffer.from(response.data, 'binary');
        const base64Image = buffer.toString('base64');

        const base64ImageWithMime = `data:image/png:base64,${base64Image}`;

        console.log(base64ImageWithMime);

        // Generic error handling
        return NextResponse.json({
            image: base64ImageWithMime
        });
    } catch (e) {
        return NextResponse.json({
            error: e
        });
    }
}