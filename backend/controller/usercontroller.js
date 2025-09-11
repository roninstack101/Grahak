import bcrypt from 'bcryptjs';
import User from '../models/users.model.js';
import Shop from '../models/shops.model.js';
import  jwt  from 'jsonwebtoken';

//registration
export const registration = async (req, res) => {
 
    const {name,email, phone, password}= req.body;

    try {
        const existingUser = await User.findOne({email});
        if (existingUser) {
           return res.status(400).json({message: "user already exists"});
        }

        const hashedpassword = await bcrypt.hash(password,10);
        const user = new User({name, email, phone, password: hashedpassword});
        await user.save();
        
        res.status(201).json({message: "user successfully registered", user});
    } catch (error) {
        res.status(500).json({message: "server error", error: error.message});
        
    }

  
}


// for login 
export const loginuser = async (req,res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user)
           return res.status(400).json({message: "user not found"});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)
            return res.status(401).json({message: "incorrect password"});
        
        const token = jwt.sign(
            {userID: user._id, role: user.role },
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );

        res.status(201).json({message: "login successful!",
           user: {
            userId: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
            shopId : user.shopRequest.shopId
        },
        token
    });
    } catch (error) {
        res.status(500).json({message: "server error", error: error.message});
        
    }
};


//for profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userID;
    const user = await User.findById(userId).select("-password");

    let shop = null;
    if (user.role === "shop_owner") {
      shop = await Shop.findOne({ owner: userId }).select("name category image isApproved");
    }

    res.json({ user, shop });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};


//update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { name, email, phone, shopImage } = req.body;

     if (email) {
        const emailExists = await User.findOne({ email, _id: { $ne: userId } });
        if (emailExists) {
            return res.status(400).json({ message: 'Email is already in use by another account.' });
        }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select("-password");

    let shop = null;
    if (shopImage) {
      shop = await Shop.findOneAndUpdate(
        { owner: userId },
        { image: shopImage },
        { new: true }
      ).select("image");
    }

    res.json({ user, shop });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};
  