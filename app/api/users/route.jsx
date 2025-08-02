import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../configs/mongodb';

export async function GET(req) {
    try {
        const { db } = await connectToDatabase();

        const useremail = req.nextUrl.searchParams.get('useremail');
        console.log("Fetched useremail from MongoDB: " + useremail);

        if (!useremail) {
            console.log("No useremail provided, returning empty array.");
            return NextResponse.json({ users: {} }, { status: 200 });
        }

        const query = { email: useremail }

        const users = await db.collection('users').find(query).toArray();

        console.log("Successfully fetched users from MongoDB: " + JSON.stringify(users));
        if (users.length === 0) {
            console.error('No users found in MongoDB:');
            return NextResponse.json({ users: {} }, { status: 200 });
        }
        const tmp = users[0];
        return NextResponse.json({ tmp }, { status: 200 });

    } catch (error) {
        console.error('Error fetching users from MongoDB:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users from MongoDB.', details: error.message },
            { status: 500 }
        );
    }
}