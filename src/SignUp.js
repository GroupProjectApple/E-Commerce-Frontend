import './Account.css';
import { useState } from 'react';
import axios from 'axios';

export default function SignUp() {
    const [fuser,setfuser] = useState(false);
    const [fpswd,setfpswd] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isValid, setIsValid] = useState(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSignUp = async () => {
        if(!fuser || !fpswd) alert("no username and/or password entered");
        else if(!isValid) alert("invalid email entered");
        else{
        try {
            const response = await axios.post('https://e-commerce-website-tioj.onrender.com/api/user', {
                username,
                email,
                password
            });
            alert('User created successfully');
        } catch (error) {
            alert(`Error: ${error.response.data.message}`);
        }
    }
    };

    return (
        <div className="sign-up">
            <h2>Sign Up</h2>
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => {
                    setUsername(e.target.value)
                    setfuser(e.target.value.length !== 0)
                }} 
            />
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={(e) => {
                    setIsValid(emailRegex.test(e.target.value));
                    setEmail(e.target.value)} }
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) =>{ 
                    setPassword(e.target.value)
                    setfpswd(e.target.value.length !== 0)
                }} 
            />
            <button className="sign-up-btn" onClick={()=>{handleSignUp();}}>
                Create Account
            </button>
            <p>Already have an account? <a href='/SignIn'>Sign In</a></p>
        </div>
    );
}
