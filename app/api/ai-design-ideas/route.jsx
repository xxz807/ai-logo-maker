import { NextResponse } from 'next/server'; 
import axios from 'axios';

export async function POST(request) { 
    
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

    try {
        console.log("-----------------start call ai");

        const response = await axios({
            method: 'post',
            url: process.env.SUPABASE_URL_GEMINI_CALL+"ai-ideas",
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

        let parsedAiData; // 不带类型注解
        
        // 这里的逻辑可以保留，以防 Supabase 函数有时未能正确返回纯 JSON
        // 但如果您已经优化了 Supabase 函数使其返回纯 JSON，那么下面的 if/else 可以简化
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
                // 如果是纯文本但不是 markdown json，尝试直接解析
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
            // 如果 response.data 已经是对象 (axios 自动解析了)
            parsedAiData = rawSupabaseResponseData;
            console.log("-----------------Supabase response is already a JSON object:", parsedAiData);
        } else {
            // 兜底情况，如果响应格式未知
            console.warn("Supabase response data is an unexpected type.");
            return NextResponse.json(
                { error: "Unexpected AI response format.", rawResponse: rawSupabaseResponseData },
                { status: 500 }
            );
        }

        console.log("-----------------end call ai: complete");

        // 使用 NextResponse.json() 返回成功响应
        return NextResponse.json(parsedAiData, { status: 200 });

    } catch (error) { // 移除类型注解
        console.error("Error in AI call:", error.message || error);
        if (axios.isAxiosError(error) && error.response) {
            console.error("Axios response error data:", error.response.data);
            console.error("Axios response error status:", error.response.status);
            // 使用 NextResponse.json() 返回错误响应
            return NextResponse.json(
                { error: "Error from Supabase function.", details: error.response.data },
                { status: error.response.status } // 保持 Supabase 返回的错误状态码
            );
        }
        // 使用 NextResponse.json() 返回内部服务器错误
        return NextResponse.json(
            { error: 'Internal server error during AI call', details: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}