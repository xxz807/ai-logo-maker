"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function Header() {
    const { user } = useUser();
    const router = useRouter();
    return (
        <div className="px-10 lg:px-32 xl:px-48 2xl:px-56 p-4 flex justify-between items-center shadow-sm">
            <Image src={"/logo.svg"} alt="logo" width={180} height={100} />
            <div className="flex gap-3 items-center">
                {user ? <Button onClick={() => { router.push("/dashboard") }}>Dashboard</Button>
                    : <div className="flex gap-3">
                        <Button onClick={() => { router.push("/create") }}>Get Started</Button>
                        <SignInButton mode='model' forceRedirectUrl={'/dashboard'}>
                            <Button >Login</Button>
                        </SignInButton>

                    </div>}
                <UserButton></UserButton>
            </div>
        </div>
    )
}

export default Header;