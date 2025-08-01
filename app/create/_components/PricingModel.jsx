"use client";
import React, { useEffect, useState } from 'react';
import HeadingDesc from './HeadingDesc';
import Lookup from '../../_data/Lookup.jsx';
import Image from 'next/image';
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

const PricingModel = ({ formData }) => {
    const { user } = useUser();
    useEffect(() => {
        if (formData?.title && typeof window !== 'undefined') {
            localStorage.setItem('formData', JSON.stringify(formData))
        }
    }, [formData])
    return (
        <div>
            <HeadingDesc title={Lookup.LogoPricingModelTitle}
                desc={Lookup.LogoPricingModelDesc}></HeadingDesc>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mt-10'>
                {Lookup.pricingOption.map((pricing, index) => (
                    <div key={index} className='flex flex-col items-center p-5 border rounded'>
                        <Image src={pricing.icon} alt={pricing.title}
                            width={60}
                            height={60} />

                        <h2 className='font-medium text-2xl'>{pricing.title}</h2>
                        <div>
                            {pricing.features.map((feature, index) => (
                                <h2 className='text-lg mt-3' key={index}>{feature}</h2>
                            ))}
                        </div>
                        {user ?
                            <Link href={'/make-logo?type=' + pricing.title}>
                                <Button className='mt-5'>{pricing.button}</Button>
                            </Link>
                            : <SignInButton mode='model' forceRedirectUrl={'/make-logo?type=' + pricing.title}>
                                <Button className='mt-5'>{pricing.button}</Button>
                            </SignInButton>

                        }

                    </div>
                ))}
            </div>
        </div>
    )
}

export default PricingModel;