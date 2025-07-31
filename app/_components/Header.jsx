"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";

function Header() {
    const { user } = useUser();
    return (
        <div className="px-10 lg:px-32 xl:px-48 2xl:px-56 p-4 flex justify-between items-center shadow-sm">
            <Image src={"/logo.svg"} alt="logo" width={180} height={100} />
            <div className="flex gap-3 items-center">
                {user ? <Button>Dashboard</Button>
                    : <Button>Get Started</Button>}
                <UserButton></UserButton>
            </div>
        </div>
    )
}

export default Header;