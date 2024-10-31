import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//generating tokens for user authentication 
const generateToken = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    return {accessToken, refreshToken};
}
//storing tokens in redis database
const storeRefreshToken = async(userId, refreshToken) => {
    //implementing refresh tokens
    await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
}

// setcookies function to set cookies
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent XSS attacks, cross site scripting
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", //prevents CRSF attacks, cross-site request forgery attacks
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // prevent XSS attacks, cross site scripting
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", //prevents CRSF attacks, cross-site request forgery attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    })
}
// signup the user  
export const Signup = async (req, res) => {
    const { email, password, name} = req.body;

    const userExists = await User.findOne({ email });

    try {
        // Check if user already exists or not 
        if(userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({name, email, password})

        // Authenticate the user and generate tokens
       const {accessToken, refreshToken} = generateToken(user._id);
       await storeRefreshToken(user._id, refreshToken);

       //setcookies function 
       setCookies(res, accessToken, refreshToken);

        // Send response
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("Error creating user:", error.message);
        res.status(500).json({message: error.message});
    }
};


//login the user 
export const Login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if(user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);
            

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
           });
        }
        else {
            res.status(401).json({message: "Invalid email or password"});
        } 
    } 
    catch (error) {
        console.error("Error logging in user:", error.message);
         res.status(500).json({message: error.message});
    }
}


// logout the user
export const Logout = async (req, res) => {
    try {
        // Delete refresh token from redis database
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`);
        } 
        // Clear cookies after logout
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        // Log user out from application or website
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error( "Error logging out user:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// this will refresh the access token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedRefreshToken = await redis.get(`refresh-token:${decoded.userId}`);

        if(storedRefreshToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        
        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevent XSS attacks, cross site scripting
            secure: process.env.NODE_ENV === "production", 
            sameSite: "strict", //prevents CRSF attacks, cross-site request forgery attacks
            maxAge: 15 * 60 * 1000, // 15 minutes
        })
        res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.error("Error refreshing token:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// implement get profile
export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
       res.status(500).json({ message: "Server error", error: error.message }); 
    }
}

    