import { Request, Response } from 'express';
import User from '../models/User';
import { upload } from '../middeware/multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import generatePassword from '../services/PasswordGenertor';
import { sendRegistrationEmail } from '../services/emailService';
import sequelize from '../config/db';
import { log } from 'console';
const JWT_SECRET = '12345'; 

export const registerUser = async (req: any, res: any) => {
  try {
    const { firstName, lastName, email, phone, gender, hobbies, userType, agencyId } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !gender || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log("typeof agencyId", typeof agencyId);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate random password and hash it
    const password = generatePassword();  // You should have a method to generate a random password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Access files
    const filesData = req.files as {
      profileImage?: Express.Multer.File[];
      resumeFile?: Express.Multer.File[];
    };

    const profileImage = userType === '1' && filesData.profileImage ? filesData.profileImage[0].originalname : null;
    const resumeFile = userType === '1' && filesData.resumeFile ? filesData.resumeFile[0].originalname : null;

    // Create user record
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      gender,
      userType,
      hobbies: Array.isArray(hobbies) ? hobbies : [hobbies], // Ensure hobbies is an array
      profileImage,
      password: hashedPassword,
      resumeFile,
      agencyId: userType === '1' ? agencyId : null // Set agencyId only if Job Seeker
    });

    console.log("AgencyId", user.agencyId);
  
    // Send registration email
    await sendRegistrationEmail(email, firstName, password);
  
    // Send success response
    return res.status(201).json({ message: "User Registered Successfully", user });
  } catch (error) {
    console.error("Error message", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



  export const loginUser = async (req: Request, res: any) => {
    const { email, password } = req.body;

    try {
      const user:any = await User.findOne({ where: {email} });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: user.id, userType: user.userType }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      
      res.json({ message: 'Login successful', token , user});
    } catch (error) {
      res.status(500).json({ message: 'Error logging in' });
    }
  };
  

export const jobSeeker = async (req: any , res:any )=>{

  // const userId = req.userType; // assuming JWT middleware adds userId to the request

  // const user:any = await User.findByPk(userId);
  // // console.log("user", user);
  // if (user.userType !== '2') {
  //   return res.status(403).json({ message: 'Unauthorized UserType' });
  // }

  // // Fetch job seekers who selected this agency
  // const jobSeekers:any = await User.findAll({
  //   where: { agencyId: user.userType, userType: '2' },
  // });

  // console.log(jobSeekers);

  // res.json(jobSeekers);
  // res.json(jobSeekers);
}

 // Adjust the path as necessary

export const dashboard = async (req: any, res: any) => {
 // try {
    // Extract the JWT from the Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided.' });
    }

    // Verify and decode the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string); // Make sure to set your JWT_SECRET in the environment variables

    // Extract userType from decoded token
    const userType = decoded.userType; // Assuming userType is stored in the token
    const userId = decoded.userId;
    console.log(userType);
    // Fetch job seekers (userType === 1) who selected this agency
 
    const userList = await User.findAll({
      where: {
        userType: userType,id:userId // Job Seeker userType
      },
      attributes: ['id', 'firstName', 'lastName','gender','phone','email','usertype'], // Fetch only necessary fields
    });
  

    // Return the result
    return res.status(200).json({ userList });
  // } catch (error) {
  //   console.error('Error fetching job seekers:', error);
  //   return res.status(500).json({ message: 'Internal server error.' });
  // }
};


export const getAgency = async (req: any, res: any) => {
  try {

    // Fetch job seekers (userType === 1) who selected this agency
    const agencies = await User.findAll({
      where: {
        userType: 2, // Job Seeker userType
  
      },
      attributes: ['id', 'firstName', 'lastName'], // Fetch only necessary fields
    });

    // Return the result
    return res.status(200).json({ agencies });
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

