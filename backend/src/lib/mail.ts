import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"TontinePro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Votre code de vérification TontinePro',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e3f6f5; border-radius: 20px;">
        <h2 style="color: #272343;">Bienvenue sur TontinePro !</h2>
        <p style="color: #2d334a; font-size: 16px;">Veuillez utiliser le code suivant pour vérifier votre adresse email :</p>
        <div style="background: #ffd803; padding: 20px; text-align: center; border-radius: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #272343;">
          ${otp}
        </div>
        <p style="color: #2d334a; font-size: 14px; margin-top: 20px;">Ce code expirera dans 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #e3f6f5; margin: 20px 0;" />
        <p style="color: #a7a9be; font-size: 12px; text-align: center;">© 2026 TontinePro. Tous droits réservés.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email OTP:', error);
    // On ne bloque pas tout le processus si l'email échoue en dev, mais on log l'erreur
  }
};
