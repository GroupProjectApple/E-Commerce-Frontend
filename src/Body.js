import React,{useContext} from "react";
import "./Global.css";
import * as C from "./Webpage Components";
import {Bvalue} from "./SignIn"

export default function Body(){
    const {Flag, Recommend}=useContext(Bvalue)
    if(!Flag||!Recommend){
        return(
        <div>
            <body className="itm">
               <C.Product3 />
            </body>
        </div>
        );
    }
    return(
        <div>
             <body className="itm">
                <div class="hd">
                <h1>Recommended For You</h1>
                </div>
                <C.Recommendations/>
                <C.Product3 />
            </body>
        </div>
    );
}