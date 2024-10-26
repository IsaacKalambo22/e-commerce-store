import mongoose from "mongoose";
import bycrypt from "bcryptjs"

// User schema to store user data 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    cartItems: [
        {
         quantity: {
            type: Number,
            default: 1
         },
         product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
         }
        }
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    }
    // createdAt, updatedAt and deletedAt are added by mongoose by default
}, {
    timestamps: true
});


//Pre-save hook to hash password before saving to database 
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    try {
        const salt = await bycrypt.genSalt(10);
        this.password = await bycrypt.hash(this.password, salt);
        next()
    } catch (error) {
      next(error)
    }
})

//Method to match entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return bycrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;