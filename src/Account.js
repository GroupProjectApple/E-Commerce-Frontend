import React,{useContext,useState,useEffect} from 'react';
import { Link } from 'react-router-dom';
import "./Account.css";
import { Bvalue } from './SignIn';
/*import * as G from "./Generic forms"*/
export default function Account() {
    const{Username, Email,setFlag, Uid, setUid, Lat, Lng} = useContext(Bvalue);
    const [Address, setAddress] = useState('');
   
    useEffect(()=>{
      if(!Username || !Email){return;}
      const getAddressFromCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${Lat}&lon=${Lng}&format=json`
        );
        const data = await response.json();
        setAddress(data.display_name || "Address not found");
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    }
    getAddressFromCoordinates();
  },[Uid])
    if(!Username || !Email){return;}
    const handleLogout = () => {
        // Logic for logging out, e.g., clearing session or redirecting to login page
        alert("You have been logged out!");
        window.location.href = '/';
        setTimeout(()=>{setFlag(false);
        setUid('');},500);
        localStorage.removeItem('isSignedIn');
        localStorage.removeItem('uid');
        localStorage.removeItem('uname');
        localStorage.removeItem('umail');
      };
    
      return (
        <div className="account-container">
          <div className="account-header">
            <h1>Account</h1>
          </div>
    
          <div className="account-info">
            <p><strong>Name:</strong> {Username}</p>
            <p><strong>Email:</strong> {Email}</p>
            <p><strong>Address:</strong> {Address}</p>
          </div>
    
          <div className="logout-section">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      );
};