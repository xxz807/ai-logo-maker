import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../configs/mongodb'; 

export async function POST(req) {
    try {
        // 解析请求体中的数据
        const { useremail, username } = await req.json();
        console.log("Fetched useremail from request: " + useremail);
        console.log("Fetched username from request: " + username);

        if (!useremail) {
            return NextResponse.json({ error: 'useremail is required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        // 检查是否已存在此用户
        const existingUser = await db.collection('users').findOne({ email: useremail });
        
        if (existingUser) {
            // 如果用户已存在，返回现有用户
            console.log("User already exists:", existingUser);
            return NextResponse.json(existingUser , { status: 200 });
        } else {
            // 如果没有找到用户，创建新用户
            const newUser = {
                name: username || 'Anonymous User',  // 使用提供的用户名，如果没有则为'Anonymous User'
                email: useremail,
                credits: 5,  // 初始信用
                createdAt: new Date().toISOString()
            };

            // 插入新用户到 MongoDB
            const result = await db.collection('users').insertOne(newUser);
            console.log("try to insert: ", newUser);

            if (result.acknowledged) {
                // 插入成功，返回新插入的用户
                return NextResponse.json(newUser , { status: 200 });
            } else {
                // 插入失败
                return NextResponse.json({ error: 'Failed to insert user' }, { status: 500 });
            }
        }

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        );
    }
}