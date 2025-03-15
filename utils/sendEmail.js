import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error("Error sending email: ", error);
    }
};


export default sendEmail