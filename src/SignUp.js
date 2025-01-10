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
    const [usernameError, setUsernameError] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSignUp = async () => {
        if(!fuser || !fpswd) alert("no username and/or password entered");
        else if(!isValid) alert("invalid email entered");
        else{
        try {
            const usernameCheck = await axios.get(`https://e-commerce-website-tioj.onrender.com/api/user?username=${username}`);
                if (usernameCheck.data && usernameCheck.data.length > 0) {
                    setUsernameError('Username already taken. Please choose a different one.');
                    return;
                }
        } catch (error) {
           try {
            const response = await axios.post('https://e-commerce-website-tioj.onrender.com/api/user', {
                username,
                email,
                password
            });
            await axios.post('https://e-commerce-website-tioj.onrender.com/api/search_phrases',{
                Uid: response.data.data._id,
                phrases:[username[0]]
            });
           }catch (error) {
              alert(`Error: ${error.response.data.message}`);
           }
        }
    }
     window.location.href= '/SignIn';
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
                    setUsernameError(''); 
                }} 
            />
            {usernameError && <p className="error-message">{usernameError}</p>}
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
