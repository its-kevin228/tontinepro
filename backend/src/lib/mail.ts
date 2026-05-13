import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Template de base partagé ───────────────────────────────────────────────
function baseTemplate(content: string): string {
  return `
    <div style="font-family:'Poppins',sans-serif; max-width:600px; margin:auto; background:#fffffe; border-radius:20px; overflow:hidden; border:1px solid #dfe5f2;">
      <!-- Header -->
      <div style="background:#272343; padding:32px 40px; text-align:center;">
        <span style="font-size:24px; font-weight:900; color:#ffd803; letter-spacing:-0.5px;">Tontine<span style="color:#fffffe;">Pro</span></span>
      </div>
      <!-- Body -->
      <div style="padding:40px;">
        ${content}
      </div>
      <!-- Footer -->
      <div style="background:#f8fafc; padding:20px 40px; border-top:1px solid #dfe5f2; text-align:center;">
        <p style="color:#a7a9be; font-size:12px; margin:0;">© 2026 TontinePro. Tous droits réservés.</p>
      </div>
    </div>
  `;
}

// ─── OTP ────────────────────────────────────────────────────────────────────
export const sendOTP = async (email: string, otp: string): Promise<void> => {
  const html = baseTemplate(`
    <h2 style="color:#272343; font-size:22px; font-weight:900; margin:0 0 12px;">Vérifiez votre email</h2>
    <p style="color:#2d334a; font-size:15px; margin:0 0 24px;">Utilisez le code ci-dessous pour activer votre compte TontinePro :</p>
    <div style="background:#ffd803; padding:24px; text-align:center; border-radius:16px; font-size:36px; font-weight:900; letter-spacing:8px; color:#272343; margin-bottom:24px;">
      ${otp}
    </div>
    <p style="color:#a7a9be; font-size:13px; margin:0;">Ce code expire dans <strong>10 minutes</strong>. Ne le partagez avec personne.</p>
  `);

  try {
    await transporter.sendMail({
      from: `"TontinePro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Votre code de vérification TontinePro',
      html,
    });
  } catch (error) {
    console.error('[Mail] Erreur envoi OTP:', error);
  }
};

// ─── Rappel de cotisation ────────────────────────────────────────────────────
export interface ReminderEmailData {
  name: string;
  email: string;
  circleName: string;
  cycleNumber: number;
  amount: number;
  endDate: Date;
}

export const sendReminderEmail = async (data: ReminderEmailData): Promise<void> => {
  const { name, email, circleName, cycleNumber, amount, endDate } = data;

  const formattedDate = endDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedAmount = amount.toLocaleString('fr-FR');

  const html = baseTemplate(`
    <h2 style="color:#272343; font-size:22px; font-weight:900; margin:0 0 8px;">⏰ Rappel de cotisation</h2>
    <p style="color:#2d334a; font-size:15px; margin:0 0 24px;">Bonjour <strong>${name}</strong>,</p>

    <div style="background:#ffd803; border-radius:16px; padding:24px; margin-bottom:24px;">
      <p style="color:#272343; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 8px;">Votre cotisation est due demain</p>
      <p style="color:#272343; font-size:28px; font-weight:900; margin:0;">${formattedAmount} FCFA</p>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <tr style="border-bottom:1px solid #dfe5f2;">
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Cercle</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">${circleName}</td>
      </tr>
      <tr style="border-bottom:1px solid #dfe5f2;">
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Cycle</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">#${cycleNumber}</td>
      </tr>
      <tr>
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Échéance</td>
        <td style="padding:12px 0; color:#f25f4c; font-size:14px; font-weight:700; text-align:right;">${formattedDate}</td>
      </tr>
    </table>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/member"
       style="display:block; background:#272343; color:#ffd803; text-align:center; padding:16px; border-radius:12px; font-weight:900; font-size:15px; text-decoration:none; margin-bottom:16px;">
      Payer ma cotisation →
    </a>

    <p style="color:#a7a9be; font-size:12px; text-align:center; margin:0;">
      Si vous avez déjà payé, ignorez ce message.
    </p>
  `);

  try {
    await transporter.sendMail({
      from: `"TontinePro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `⏰ Rappel : cotisation de ${formattedAmount} FCFA due demain — ${circleName}`,
      html,
    });
  } catch (error) {
    console.error(`[Mail] Erreur envoi rappel à ${email}:`, error);
    // On ne bloque pas le cron si un email échoue
  }
};

// ─── Notification KYC ───────────────────────────────────────────────────────
export const sendKycStatusEmail = async (
  email: string,
  name: string,
  status: 'APPROVED' | 'REJECTED',
  note?: string
): Promise<void> => {
  const isApproved = status === 'APPROVED';

  const html = baseTemplate(`
    <h2 style="color:#272343; font-size:22px; font-weight:900; margin:0 0 8px;">
      ${isApproved ? '✅ KYC approuvé' : '❌ KYC rejeté'}
    </h2>
    <p style="color:#2d334a; font-size:15px; margin:0 0 24px;">Bonjour <strong>${name}</strong>,</p>

    <div style="background:${isApproved ? '#42c88f' : '#f25f4c'}1a; border-left:4px solid ${isApproved ? '#42c88f' : '#f25f4c'}; border-radius:0 12px 12px 0; padding:20px; margin-bottom:24px;">
      <p style="color:#272343; font-size:15px; font-weight:700; margin:0;">
        ${isApproved
          ? 'Votre identité a été vérifiée avec succès. Vous pouvez maintenant créer et gérer des cercles de tontine.'
          : `Votre demande KYC a été rejetée.${note ? ` Raison : ${note}` : ' Veuillez soumettre à nouveau avec des documents valides.'}`
        }
      </p>
    </div>

    ${isApproved ? `
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/circles/new"
       style="display:block; background:#272343; color:#ffd803; text-align:center; padding:16px; border-radius:12px; font-weight:900; font-size:15px; text-decoration:none;">
      Créer mon premier cercle →
    </a>
    ` : `
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
       style="display:block; background:#272343; color:#ffd803; text-align:center; padding:16px; border-radius:12px; font-weight:900; font-size:15px; text-decoration:none;">
      Retourner sur TontinePro →
    </a>
    `}
  `);

  try {
    await transporter.sendMail({
      from: `"TontinePro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isApproved ? '✅ Votre KYC a été approuvé — TontinePro' : '❌ Votre KYC a été rejeté — TontinePro',
      html,
    });
  } catch (error) {
    console.error(`[Mail] Erreur envoi KYC status à ${email}:`, error);
  }
};

// ─── Confirmation de paiement ────────────────────────────────────────────────
export interface PaymentConfirmationEmailData {
  name: string;
  email: string;
  circleName: string;
  cycleNumber: number;
  amount: number;
  method: string;
  confirmedAt: Date;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Espèces',
  VIREMENT: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile Money',
};

export const sendPaymentConfirmationEmail = async (
  data: PaymentConfirmationEmailData
): Promise<void> => {
  const { name, email, circleName, cycleNumber, amount, method, confirmedAt } = data;

  const formattedAmount = amount.toLocaleString('fr-FR');
  const formattedDate = confirmedAt.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = baseTemplate(`
    <h2 style="color:#272343; font-size:22px; font-weight:900; margin:0 0 8px;">✅ Paiement confirmé</h2>
    <p style="color:#2d334a; font-size:15px; margin:0 0 24px;">Bonjour <strong>${name}</strong>, votre cotisation a bien été enregistrée.</p>

    <div style="background:#42c88f1a; border-left:4px solid #42c88f; border-radius:0 12px 12px 0; padding:20px; margin-bottom:24px;">
      <p style="color:#272343; font-size:28px; font-weight:900; margin:0 0 4px;">${formattedAmount} FCFA</p>
      <p style="color:#2d334a; font-size:13px; font-weight:700; margin:0;">Cotisation confirmée</p>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <tr style="border-bottom:1px solid #dfe5f2;">
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Cercle</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">${circleName}</td>
      </tr>
      <tr style="border-bottom:1px solid #dfe5f2;">
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Cycle</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">#${cycleNumber}</td>
      </tr>
      <tr style="border-bottom:1px solid #dfe5f2;">
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Méthode</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">${METHOD_LABELS[method] ?? method}</td>
      </tr>
      <tr>
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Date</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">${formattedDate}</td>
      </tr>
    </table>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/member/payments"
       style="display:block; background:#272343; color:#ffd803; text-align:center; padding:16px; border-radius:12px; font-weight:900; font-size:15px; text-decoration:none;">
      Télécharger mon reçu →
    </a>
  `);

  try {
    await transporter.sendMail({
      from: `"TontinePro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Cotisation de ${formattedAmount} FCFA confirmée — ${circleName}`,
      html,
    });
  } catch (error) {
    console.error(`[Mail] Erreur envoi confirmation paiement à ${email}:`, error);
  }
};

// ─── Alerte admin KYC à vérifier manuellement ────────────────────────────────
export const sendKycAdminAlert = async (
  adminEmail: string,
  adminName: string,
  userName: string,
  userEmail: string,
  reason: string,
  confidence: number,
  documentUrl: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const scoreDisplay = confidence >= 0 ? `${confidence}%` : "Non analysé (PDF)";
  const scoreColor = confidence >= 75 ? "#42c88f" : confidence >= 0 ? "#f25f4c" : "#a7a9be";

  const html = baseTemplate(`
    <h2 style="color:#272343; font-size:22px; font-weight:900; margin:0 0 8px;">⚠️ KYC à vérifier manuellement</h2>
    <p style="color:#2d334a; font-size:15px; margin:0 0 24px;">Bonjour <strong>${adminName}</strong>,</p>

    <div style="background:#ffd803; border-radius:16px; padding:20px; margin-bottom:24px;">
      <p style="color:#272343; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 4px;">
        Vérification manuelle requise
      </p>
      <p style="color:#272343; font-size:16px; font-weight:900; margin:0;">${reason}</p>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <tr style="border-bottom:1px solid #dfe5f2;">
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase;">Utilisateur</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">${userName}</td>
      </tr>
      <tr style="border-bottom:1px solid #dfe5f2;">
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase;">Email</td>
        <td style="padding:12px 0; color:#272343; font-size:14px; font-weight:700; text-align:right;">${userEmail}</td>
      </tr>
      <tr>
        <td style="padding:12px 0; color:#a7a9be; font-size:12px; font-weight:700; text-transform:uppercase;">Score OCR</td>
        <td style="padding:12px 0; font-size:14px; font-weight:900; text-align:right; color:${scoreColor};">${scoreDisplay}</td>
      </tr>
    </table>

    <a href="${documentUrl}" target="_blank"
       style="display:block; background:#f8fafc; border:1px solid #dfe5f2; color:#272343; text-align:center; padding:14px; border-radius:12px; font-weight:700; font-size:14px; text-decoration:none; margin-bottom:12px;">
      📄 Voir le document soumis
    </a>

    <a href="${frontendUrl}/admin/kyc"
       style="display:block; background:#272343; color:#ffd803; text-align:center; padding:16px; border-radius:12px; font-weight:900; font-size:15px; text-decoration:none;">
      Traiter ce KYC dans l'interface →
    </a>
  `);

  try {
    await transporter.sendMail({
      from: `"TontinePro" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `⚠️ KYC de ${userName} à vérifier manuellement`,
      html,
    });
  } catch (error) {
    console.error(`[Mail] Erreur alerte KYC admin:`, error);
  }
};
