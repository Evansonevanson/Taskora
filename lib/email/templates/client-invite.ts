export interface ClientInviteEmailData {
  clientName: string;
  companyName?: string;
  email: string;
  temporaryPassword?: string;
  appUrl: string;
}

export function generateClientInviteEmailHtml({
  clientName,
  companyName,
  email,
  temporaryPassword,
  appUrl,
}: ClientInviteEmailData): string {
  const loginUrl = `${appUrl.replace(/\/+$/, '')}/login`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Taskora — Client Portal Access</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f4;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0a09; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #1c1917; border: 1px solid #292524; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #292524;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      <span style="color: #6366f1;">Task</span>ora
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background-color: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px;">
                      Portal Access
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Welcome to your Client Portal
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #a8a29e; line-height: 1.5;">
                Hello ${clientName}${companyName ? ` (${companyName})` : ''}, your dedicated client portal account is ready. You can use it to track deliverables, review completed work, and provide feedback directly.
              </p>

              <!-- Credentials Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #292524; border: 1px solid #44403c; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716c; margin-bottom: 8px; font-weight: 600;">
                      Login Credentials
                    </div>
                    <div style="font-size: 13px; color: #d6d3d1; margin-bottom: 6px;">
                      <strong style="color: #ffffff;">Email:</strong> ${email}
                    </div>
                    ${
                      temporaryPassword
                        ? `<div style="font-size: 13px; color: #d6d3d1;">
                            <strong style="color: #ffffff;">Temporary Password:</strong> <code style="background-color: #1c1917; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #a5b4fc;">${temporaryPassword}</code>
                          </div>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
                      Sign in to Client Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #78716c; line-height: 1.5; text-align: center;">
                For security, we recommend changing your password after your initial sign in.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #141210; border-top: 1px solid #292524; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #57534e;">
                &copy; ${new Date().getFullYear()} Taskora. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
