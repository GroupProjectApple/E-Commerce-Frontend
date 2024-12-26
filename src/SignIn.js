import './Account.css';
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create the context
export const Bvalue = createContext();

// Create the context provider
export const BvalueProvider = ({ children }) => {
    const [Flag, setFlag] = useState(false);
    const [Uid, setUid] = useState('');
    const [Catg, setCatg]= useState('');
    const [Recommend, setRecommend] = useState([]);
    const [Pl3, setPl3]=useState([]);
    const[Username, setUsername]=useState('');
    const[Email, setEmail]=useState('');
    const[Lat, setLat]=useState(0);
    const[Lng, setLng]=useState(0);
    useEffect(()=>{
        const savedflag =localStorage.getItem('isSignedIn')=== 'true';
        setFlag(savedflag);
        const saveduser = localStorage.getItem('uid');
        if(saveduser){setUid(saveduser);}
        const savedusername = localStorage.getItem('uname');
        if(savedusername){setUsername(savedusername);}
        const savedusermail = localStorage.getItem('umail');
        if(savedusermail){setEmail(savedusermail);}
    },[])

    return (
        <Bvalue.Provider value={{ Flag, setFlag, Uid, setUid, Catg, setCatg, Recommend, setRecommend, Pl3, setPl3, Username, setUsername, Email, setEmail, Lat, setLat, Lng, setLng  }}>
            {children} 
        </Bvalue.Provider>
    );
};


export function SignIn() {
    const navigate = useNavigate();
    const context = useContext(Bvalue); // Get the context
   

    // Check if context is available
    if (!context) {
        throw new Error('SignIn must be used within a BvalueProvider');
    }

    // Destructure the context values
    const { Flag, setFlag, Uid, setUid, Recommend, setRecommend  } = context; 
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleClick = async () => {
        try {
            const response = await axios.get("https://e-commerce-website-tioj.onrender.com/api/users", {
                params: { username: username, email: email, password: password },
            });
            
            // Check if the response is valid
            if (response.data) {
                console.log("Response data:", response.data);
                setFlag(true); // Update the Flag
                const userid= response.data[0]._id;
                const usernm= response.data[0].username;
                const mail= response.data[0].email;
                setUid(userid);
                console.log(Uid);
                setUsername(usernm);
                setEmail(mail)
                localStorage.setItem('isSignedIn', 'true'); 
                localStorage.setItem('uid', userid );
                localStorage.setItem('uname', usernm );
                localStorage.setItem('umail', mail );
                alert("Succesful Login");
                console.log("Flag set to true.");
                window.location.href='/'; // Navigate after successful login
            } else {
                alert("Invalid response structure");
            }
        } catch (error) {
            alert("Wrong credentials");
            console.error("Error occurred:", error);
        }
    };

    return (
        <div className="sign-in">
            <h2>Sign In</h2>
            <input 
                type="text" 
                placeholder="Username"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <div className="social-sign-in">
                <button className="google">Google</button>
                <button className="facebook">Facebook</button>
                <button className="phone">Phone</button>
            </div>
            <button className="sign-in-btn" onClick={handleClick}>Sign In</button>
            <p>Don't have an account? <a href='/SignUp'>Create Account</a></p>
        </div>
    );
}

