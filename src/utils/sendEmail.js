require("dotenv").config();
import nodemailer from "nodemailer";

module.exports = async (email, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html: htmlContent,
        });

        console.log("Email sent successfully!");
    } catch (error) {
        console.log("Email sent error: " + error);
    }
}
