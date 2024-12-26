import React from "react";
import "./logo.css";
import { useNavigate } from "react-router-dom";
export default function Logo(){
    const navg=useNavigate();
    return(
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC0m-B5OAZzgiUq0KeC5knE2oBMFiOiExXFQ&s" alt="Pegasus" className="logo" onClick={()=>{window.location.href='/';}}/>
    );
}