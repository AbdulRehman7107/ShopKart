const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicCustomer(customer) {
  return { _id: customer._id, fullName: customer.fullName, email: customer.email, phone: customer.phone };
}

async function registerCustomer(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All fields are mandatory" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    if (await Customer.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    const customer = await Customer.create({ fullName, email: normalizedEmail, password, phone });
    return res.status(201).json({ success: true, message: "Customer registered successfully", customer: publicCustomer(customer) });
  } catch (error) { next(error); }
}

async function loginCustomer(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email ||!password) return res.status(401).json({ success:false, message:"Invalid credentials"});
    const customer = await Customer.findOne({ email: email.toLowerCase().trim()}).select("+password");
    if (!customer ||!(await customer.comparePassword(password))) {
      return res.status(401).json({ success: false, message:"Invalid credentials"});
    }
    res.cookie("token", generateToken(customer._id), cookieOptions);
    return res.status(200).json({ success: true, message:"Login successful", customer: publicCustomer(customer)});
  } catch (error) { next(error);}
}

function getMyProfile(req, res) {
  return res.status(200).json(publicCustomer(req.user));
}

function logoutCustomer(req, res) {
  res.clearCookie("token", {httpOnly:true, secure:process.env.NODE_ENV === "production", sameSite: "lax"});
  return res.status(200).json({ success: true, message: "Logged out successfully"});
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword ||!newPassword) return res.status(400).json({ success: false, message: "Old and new passwords are required" });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });
    const customer = await Customer.findById(req.user._id).select("+password");
    if (!(await customer.comparePassword(oldPassword))) return res.status(401).json({ success: false, message: "Old password is incorrect" });
    customer.password = newPassword;
    await customer.save();
    return res.status(200).json({ success: true, message: "Password changed successfully"});
  } catch (error) {next(error);}
}

module.exports = { registerCustomer, loginCustomer, getMyProfile, logoutCustomer, changePassword };
