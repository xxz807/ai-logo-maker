import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../configs/mongodb';

export async function POST(req) {
    try {
        const { useremail, username } = await req.json();
        console.log("Fetched useremail from request: " + useremail);
        console.log("Fetched username from request: " + username);

        if (!useremail) {
            return NextResponse.json({ error: 'useremail is required' }, { status: 400 });
        }

        const { db } = await connectToDatabase();

        const existingUser = await db.collection('users').findOne(
            { email: useremail },
            {
                projection: {
                    name: 1,
                    email: 1,
                    credits: 1,
                }
            }
        );

        if (existingUser) {
            console.log("User already exists:", existingUser);
            return NextResponse.json(existingUser, { status: 200 });
        } else {
            const newUser = {
                name: username || 'Anonymous User',
                email: useremail,
                credits: 5,
                createdAt: new Date().toISOString()
            };

            const result = await db.collection('users').insertOne(newUser);
            console.log("try to insert: ", newUser);

            if (result.acknowledged) {
                return NextResponse.json(newUser, { status: 200 });
            } else {
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