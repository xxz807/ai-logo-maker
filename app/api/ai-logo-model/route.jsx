// app/api/ai-logo-model/route.jsx

import axios from "axios";
import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';
import { connectToDatabase } from '../../configs/mongodb';
import Replicate from "replicate";

export async function POST(req) {
    // 1. 从请求体中解析数据
    const { prompt, email, title, desc, type, credits } = await req.json();

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

    const { db } = await connectToDatabase();
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

        let base64ImageWithMime;
        if (type == "Free") {
            // console.log("------------start to call Hugging Face via Supabase for image generation");
            // const imageResponse = await axios({
            //     method: 'post',
            //     url: process.env.SUPABASE_URL_HF_CALL + "hfquery", 
            //     headers: {
            //         'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
            //         'Content-Type': 'application/json'
            //     },
            //     data: {
            //         prompt: generatedPromptData.prompt,
            //         sync_mode: true
            //     },
            //     maxRedirects: 5,
            // });

            // console.log("------------End of Hugging Face image generation call");
            // base64ImageWithMime = imageResponse.data?.image;
            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
            });

            // bytedance / sdxl-lightning-4step
            const output = await replicate.run(
                "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe",
                {
                    input: {
                        seed: 0,
                        width: 848,
                        height: 848,
                        prompt: generatedPromptData.prompt,
                        scheduler: "K_EULER",
                        num_outputs: 1,
                        guidance_scale: 0,
                        negative_prompt: "worst quality, low quality",
                        num_inference_steps: 4
                    }
                }
            );

            console.log("--------------: " + output[0].url());

            if (output && Array.isArray(output) && output.length > 0 && output[0]) {
                const imageUrl = output[0];

                try {
                    // 1. 从 URL 获取图片数据
                    // responseType: 'arraybuffer' 确保响应作为二进制数据处理
                    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                    const imageData = response.data; // 这将是图片的二进制数据 (Buffer)

                    // 2. 将图片数据转换为 Base64 格式
                    const base64Image = Buffer.from(imageData).toString('base64');

                    // 拼接 Data URL 前缀
                    // 根据 output_format，MIME 类型应该是 'image/png'
                    const mimeType = 'image/png'; // 确保与 Replicate 的 output_format 匹配
                    base64ImageWithMime = `data:${mimeType};base64,${base64Image}`;

                    console.log("Image URL:", imageUrl);
                    console.log("Base64 Image (first 100 chars):", base64ImageWithMime.substring(0, 100) + "...");

                } catch (error) {
                    console.error("Error converting image to Base64:", error);
                }
            } else {
                console.error("Replicate API did not return a valid image URL.");
            }
        } else if (type == "Premium") {
            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
            });

            // bytedance / hyper-flux-8step
            const output = await replicate.run(
                "bytedance/hyper-flux-8step:16084e9731223a4367228928a6cb393b21736da2a0ca6a5a492ce311f0a97143",
                {
                    input: {
                        seed: 0,
                        width: 848,
                        height: 848,
                        prompt: generatedPromptData.prompt,
                        num_outputs: 1,
                        aspect_ratio: "1:1",
                        output_format: "png",
                        guidance_scale: 3.5,
                        output_quality: 80,
                        num_inference_steps: 8
                    }
                }
            );

            console.log("--------------: " + output[0].url());

            if (output && Array.isArray(output) && output.length > 0 && output[0]) {
                const imageUrl = output[0];

                try {
                    // 1. 从 URL 获取图片数据
                    // responseType: 'arraybuffer' 确保响应作为二进制数据处理
                    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                    const imageData = response.data; // 这将是图片的二进制数据 (Buffer)

                    // 2. 将图片数据转换为 Base64 格式
                    const base64Image = Buffer.from(imageData).toString('base64');

                    // 拼接 Data URL 前缀
                    // 根据 output_format，MIME 类型应该是 'image/png'
                    const mimeType = 'image/png'; // 确保与 Replicate 的 output_format 匹配
                    base64ImageWithMime = `data:${mimeType};base64,${base64Image}`;

                    console.log("Image URL:", imageUrl);
                    console.log("Base64 Image (first 100 chars):", base64ImageWithMime.substring(0, 100) + "...");


                    // 正确返回后，update credits                    
                    console.log("try to update credits");
                    await db.collection('users').updateOne(
                        { email: email },
                        {
                            $inc: { credits: credits - 1 }
                        }
                    );

                } catch (error) {
                    console.error("Error converting image to Base64:", error);
                }
            } else {
                console.error("Replicate API did not return a valid image URL.");
            }
        }

        if (!base64ImageWithMime) {
            console.error('API did not return a valid image data URL in the "image" field:', imageResponse.data);
            return NextResponse.json({ error: 'Failed to get image data from the server. Response was incomplete.' }, { status: 500 });
        }

        console.log("Generated Base64 Image (truncated):", base64ImageWithMime.substring(0, 100) + "...");

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