import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

/**
 * Sends an invite email to a team member.
 * @param email Recipient's email address
 * @param clientName Name of the client organization
 * @param inviteLink Invite acceptance link
 */
export async function sendInviteEmail(email: string, clientName: string, inviteLink: string) {
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL as string,
    subject: `You're invited to join ${clientName} on Qylon`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Join ${clientName} on Qylon</h2>
        <p>Hello,</p>
        <p>You’ve been invited to join <strong>${clientName}</strong> on Qylon.</p>
        <p>Please click the button below to accept your invitation:</p>
        <p style="text-align: center;">
          <a href="${inviteLink}" style="
            background-color: #123956;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
          ">Accept Invitation</a>
        </p>
        <p>If the button doesn’t work, you can copy and paste this link:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <p>Thank you,<br>The Qylon Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    throw new Error(
      `Failed to send invite email: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
