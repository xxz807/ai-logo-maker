import React from "react";

function HeadingDesc({title, desc}) {
    return (
        <div>
            <h2 className='font-bold text-3xl text-primary'>{title}</h2>
            <p className='text-gray-500 text-lg mt-2'>{desc}</p>
        </div>
    )
}

export default HeadingDesc;