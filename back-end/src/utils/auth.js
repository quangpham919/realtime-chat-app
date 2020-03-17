// Import necessary libraries
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { loginValidation, registerValidation } from "./validation";
import { Admin } from "../resources/admin/admin.model";
import { User } from "../resources/user/user.model";


/* 
Methods need to be implemented
newToken
verifyToken
register
login
protect
*/

dotenv.config();

export const newToken = user => {
  return jwt.sign({ id: user._id }, process.env.TOKEN, { expiresIn: "1h" });
};

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.TOKEN, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });

export const register = async (req, res) => {
  // Pass user input to be validated with Joi
  const { error } = registerValidation(req.body);
  // Return error if invalid input
  if (error) return res.status(400).send(error);

  try {
    // Password salting and hasing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const admin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    const savedAdmin = await admin.save();
    res.status(201).send({
      success: true,
      message: `Admin: ${savedAdmin.name} is already registered`
    });
  } catch (error) {
    res.status(400).end();
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Check if the admin exists using email
    const adminData = req.body;
    const admin = await Admin.findOne({ email: adminData.email })
      .select("email password")
      .exec();
    if (!admin) {
      return res.status(401).send("Email or password is invalid");
    }

    const passwordCorrect = await bcrypt.compare(
      adminData.password,
      admin.password
    );

    if (!passwordCorrect) {
      res.status(400).send("Invalid Credentials");
    }

    // Assign a new token
    const token = newToken(admin);
    return res.status(200).json({
      success: true,
      token,
      expiresIn: "3600s",
      role: "admin"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

export const join = async (req, res) => {
  try {
    const userData = req.body;
    const user = await User.findOne({ name: userData.name })
      .lean()
      .exec();
    // Ask Jordan
    if (!user) {
      user = await User.create(req.body);
    }
    const token = newToken(user);
    return res.status(200).json({
      success: true,
      token,
      expiresIn: "3600s"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Server error"
    });
  }
};

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).end();
  }

  const token = bearer.split("Bearer ")[1].trim();
  let payload;
  try {
    payload = await verifyToken(token);
  } catch (e) {
    return res.status(401).end();
  }

  req.user = payload;
  next();
};
