
import { db } from "../../configs/FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
export async function POST(req) {

    const { userEmail, userName } = req.json();

    try {
        // if users exists
        const docRef = doc(db, "users", user.userEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return NextResponse.json(docSnap.data())
        } else {
            // doc does not exist, create a new user
            const data = {
                name: userName,
                email: userEmail,
                credits: 5
            }
            await setDoc(doc(db, "users", userEmail), {
                ...data
            })
            return NextResponse.json(data)
        }
    } catch (error) {
            return NextResponse.json({})
    }
}