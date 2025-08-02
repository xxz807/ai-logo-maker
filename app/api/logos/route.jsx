import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '../../configs/mongodb';

export async function GET(req) {
    const useremail = req.nextUrl.searchParams.get('email');
    if (!useremail) {
        return NextResponse.json({ error: 'useremail is required' }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    try {

        const userLogos = await db.collection('users').findOne(
            { email: useremail },
            {
                projection: {
                    logos: { $slice: -100 }
                }
            }
        );
        return NextResponse.json( userLogos?.logos ?? [] );

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}