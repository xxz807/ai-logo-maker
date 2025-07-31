import React from "react";
import Lookup from "../../_data/Lookup.jsx";
import HeadingDesc from "./HeadingDesc";


function LogoDesc({ onHandleInputChange, formData }) {
    return (
        <div className="my-10">
            <HeadingDesc title={Lookup.LogoDescTitle}
                desc={Lookup.LogoDescDesc} />
            <input className='p-4 border rounded-lg mt-5 w-full' type="text"
                placeholder={Lookup.InputTitlePlaceholder}
                defaultValue={formData?.desc}
                onChange={e => onHandleInputChange(e.target.value)}></input>
        </div>
    )
}

export default LogoDesc;