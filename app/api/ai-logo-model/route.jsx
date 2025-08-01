import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
    // 1. 从请求体中解析数据
    const { prompt, email, title, desc } = await req.json();

    try {
        // 2. 校验客户端传入的 prompt
        if (!prompt) {
            console.error('Validation Error: Client prompt is missing.');
            return NextResponse.json({ error: 'Please provide a prompt to generate the logo.' }, { status: 400 });
        }

        console.log("------------Start to generate logo prompt via Supabase Gemini function");

        // 3. 调用 Supabase 函数生成 AI 文本提示 (Logo Prompt)
        const promptResponse = await axios({
            method: 'post',
            url: process.env.SUPABASE_URL_GEMINI_CALL + "logo-prompt",
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: process.env.SUPABASE_URL_GEMIN_MODEL,
                prompt: prompt
            },
            maxRedirects: 5
        });

        const generatedPromptData = promptResponse.data;
        console.log("-----------------Generated Logo Prompt Data (from Supabase):", generatedPromptData);

        // 4. 校验生成的 prompt 是否有效
        if (!generatedPromptData || !generatedPromptData.prompt) {
            console.error('Supabase Gemini Response Error: Generated prompt is missing or invalid.');
            return NextResponse.json({ error: 'Failed to generate a valid logo prompt from AI.' }, { status: 500 });
        }

        console.log("------------start to call Hugging Face via Supabase for image generation");

        const imageResponse = await axios({
            method: 'post',
            url: process.env.SUPABASE_URL_HF_CALL + "hfquery", // 指向 Supabase 的 HF 路由
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                prompt: generatedPromptData.prompt, // 使用 AI 生成的 prompt
                sync_mode: true
            },
            maxRedirects: 5,
            // 移除 responseType: 'arraybuffer'，让 axios 自动解析 JSON
            // axios 默认会根据 Content-Type: application/json 解析为 JavaScript 对象
            // 如果 Supabase 返回的是 application/json 且包含 image URL，axios 就会直接提供该对象
        });

        console.log("------------End of Hugging Face image generation call");

        // === 关键修改：直接使用 imageResponse.data.image ===
        // Supabase 函数现在直接返回 { image: "data:image/..." } 这样的 JSON
        const base64ImageWithMime = imageResponse.data?.image;

        if (!base64ImageWithMime) {
            console.error('API did not return a valid image data URL in the "image" field:', imageResponse.data);
            return NextResponse.json({ error: 'Failed to get image data from the server. Response was incomplete.' }, { status: 500 });
        }

        console.log("Generated Base64 Image (truncated):", base64ImageWithMime.substring(0, 100) + "...");

        return NextResponse.json({
            image: base64ImageWithMime
        }, { status: 200 });

    } catch (error) {
        console.error("Critical Error in AI logo generation pipeline:", error);

        if (axios.isAxiosError(error) && error.response) {
            const errorDetails = error.response.data?.details || error.response.data?.error || error.message; // 尝试获取更具体的错误信息
            console.error("Axios response status:", error.response.status);
            console.error("Axios response data (if available):", errorDetails);

            return NextResponse.json(
                {
                    error: "External API call failed.",
                    details: errorDetails,
                    statusCode: error.response.status
                },
                { status: error.response.status }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error during logo generation process.', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}