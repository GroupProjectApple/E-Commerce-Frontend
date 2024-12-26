import React from "react";
import "./Global.css";
import Logo from "./logo";
import * as C from "./Webpage Components";
import { BvalueProvider } from "./SignIn";
export default function Navbar(){
    return (
        <div>
            <header class="nav">
                <Logo />
                <C.DeliveryLocation />
                <C.Searchbar />
                <C.AccountButton />
                <C.Orders />
                <C.Cart />
            </header>
        </div>
    );
}