import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hiephoang1752004@gmail.com',
    pass: 'yyfz nzqe wjgp saeo' 
  }
});

export default transporter;
