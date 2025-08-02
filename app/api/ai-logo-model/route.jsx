// app/api/ai-logo-model/route.jsx

import axios from "axios";
import { NextResponse } from "next/server";
import fs from 'fs/promises'; 
import path from 'path';  
import { connectToDatabase } from '../../configs/mongodb'; 

export async function POST(req) {
    // 1. 从请求体中解析数据
    const { prompt, email, title, desc } = await req.json();

    // --- 测试模式逻辑开始 ---
    // 检查环境变量是否启用测试模式
    const isTestMode = process.env.NEXT_PUBLIC_ENABLE_LOGO_TEST_MODE === 'true';

    if (isTestMode) {
        console.log("-----------------Test mode: Returning static image from public folder.");
        try {
            // 定义测试图片的路径和名称
            const testImageFileName = 'test-logo.png'; // 确保这个文件名与您 public 文件夹中的文件匹配
            const testImagePath = path.join(process.cwd(), 'public', testImageFileName);

            // 读取图片文件
            const imageBuffer = await fs.readFile(testImagePath);

            // 将 Buffer 转换为 Base64 字符串
            const base64Image = imageBuffer.toString('base64');

            // 根据测试图片的实际类型设置 MIME Type
            // 如果您的测试图片是 .jpg，则改为 'image/jpeg'
            const mimeType = 'image/png';

            // 构建 Base64 Data URL
            const base64ImageWithMime = `data:${mimeType};base64,${base64Image}`;

            console.log("-----------------Test mode: Generated static image Base64 (truncated):", base64ImageWithMime.substring(0, 100) + "...");

            // 返回 Base64 编码的测试图片
            return NextResponse.json({ image: base64ImageWithMime }, { status: 200 });

        } catch (fileError) {
            console.error("-----------------Test mode error: Failed to read static image from public folder:", fileError);
            return NextResponse.json(
                { error: 'Test mode failed: Could not load static test image. Check if "public/test-logo.png" exists.' },
                { status: 500 }
            );
        }
    }
    // --- 测试模式逻辑结束 ---


    // 正常生产模式下的代码（只有当 isTestMode 为 false 时才执行）
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
        });

        console.log("------------End of Hugging Face image generation call");

        const base64ImageWithMime = imageResponse.data?.image;

        if (!base64ImageWithMime) {
            console.error('API did not return a valid image data URL in the "image" field:', imageResponse.data);
            return NextResponse.json({ error: 'Failed to get image data from the server. Response was incomplete.' }, { status: 500 });
        }

        console.log("Generated Base64 Image (truncated):", base64ImageWithMime.substring(0, 100) + "...");

        const { db } = await connectToDatabase();
        const logo = {
            image: base64ImageWithMime,
            title: title,
            desc: desc,
            createdAt: new Date() // 可选，存储 logo 创建时间
        };
        const user = await db.collection('users').findOne({ email: email });

        if (user) {
            // 如果用户存在，更新该用户的 `logos` 数组，插入新的 logo
            await db.collection('users').updateOne(
                { email: email },
                {
                    $push: { logos: logo } // 使用 `$push` 操作符将新 logo 添加到 `logos` 数组中
                }
            );
            console.log("Logo added successfully.");
        }

        return NextResponse.json({
            image: base64ImageWithMime
        }, { status: 200 });

    } catch (error) {
        console.error("Critical Error in AI logo generation pipeline:", error);

        if (axios.isAxiosError(error) && error.response) {
            const errorDetails = error.response.data?.details || error.response.data?.error || error.message;
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