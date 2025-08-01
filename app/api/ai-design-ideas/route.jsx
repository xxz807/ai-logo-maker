import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    // 1. 从请求体中解析数据
    let prompt;
    try {
        const body = await request.json();
        prompt = body.prompt;
    } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        return NextResponse.json(
            { error: 'Invalid request body. Please send a JSON object with a "prompt".' },
            { status: 400 }
        );
    }

    if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    // --- 测试模式逻辑开始 ---
    const isTestMode = process.env.NEXT_PUBLIC_ENABLE_IDEAS_TEST_MODE === 'true';

    if (isTestMode) {
        console.log("-----------------Test mode: Returning predefined AI ideas.");
        const predefinedIdeas = {
            ideas: [
                "Test Idea A: Minimalist icon design",
                "Test Idea B: Abstract geometric pattern",
                "Test Idea C: Hand-drawn character sketch",
                "Test Idea D: Typographic and bold",
                "Test Idea E: Nature-inspired emblem"
            ]
        };
        // 直接返回预设的 ideas
        return NextResponse.json(predefinedIdeas, { status: 200 });
    }
    // --- 测试模式逻辑结束 ---


    // 正常生产模式下的代码（只有当 isTestMode 为 false 时才执行）
    try {
        console.log("-----------------start call ai");

        const response = await axios({
            method: 'post',
            url: process.env.SUPABASE_URL_GEMINI_CALL + "ai-ideas", // 确保 URL 正确，指向生成 ideas 的 Supabase 路由
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

        const rawSupabaseResponseData = response.data;
        console.log("-----------------Supabase raw response data (from axios):", rawSupabaseResponseData);

        let parsedAiData;

        // 这段逻辑可以保留，以防 Supabase 函数有时未能正确返回纯 JSON
        // 理想情况下，您的 Supabase 函数应该已经优化到总是返回纯 JSON
        if (typeof rawSupabaseResponseData === 'string') {
            const jsonMatch = rawSupabaseResponseData.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    parsedAiData = JSON.parse(jsonMatch[1]);
                    console.log("-----------------Parsed JSON from Supabase response (markdown):", parsedAiData);
                } catch (parseError) {
                    console.error("Failed to parse JSON from Supabase response (markdown block):", parseError);
                    return NextResponse.json(
                        { error: "Failed to parse AI response JSON.", rawResponse: rawSupabaseResponseData },
                        { status: 500 }
                    );
                }
            } else {
                try {
                    parsedAiData = JSON.parse(rawSupabaseResponseData);
                    console.log("-----------------Parsed JSON from Supabase response (direct string parse):", parsedAiData);
                } catch (parseError) {
                    console.warn("Supabase response is raw text and not parseable as JSON directly.");
                    return NextResponse.json(
                        { error: "Unexpected AI response format (not JSON).", rawResponse: rawSupabaseResponseData },
                        { status: 500 }
                    );
                }
            }
        } else if (typeof rawSupabaseResponseData === 'object') {
            parsedAiData = rawSupabaseResponseData;
            console.log("-----------------Supabase response is already a JSON object:", parsedAiData);
        } else {
            console.warn("Supabase response data is an unexpected type.");
            return NextResponse.json(
                { error: "Unexpected AI response format.", rawResponse: rawSupabaseResponseData },
                { status: 500 }
            );
        }

        console.log("-----------------end call ai: complete");

        return NextResponse.json(parsedAiData, { status: 200 });

    } catch (error) {
        console.error("Error in AI call:", error.message || error);
        if (axios.isAxiosError(error) && error.response) {
            const errorDetails = error.response.data?.details || error.response.data?.error || error.message;
            console.error("Axios response data:", error.response.data);
            console.error("Axios response status:", error.response.status);
            return NextResponse.json(
                { error: "Error from Supabase function.", details: errorDetails },
                { status: error.response.status }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error during AI call', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}