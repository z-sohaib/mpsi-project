/**
 * Server-side utilities for sending emails via the API
 */

interface SendEmailParams {
  token: string;
  email: string;
  subject: string;
  username: string;
  numeroInventaire?: string;
  cause?: string;
  designation?: string;
}

/**
 * Sends an email using the API
 * @param params Object containing email parameters
 * @returns Promise resolving to the API response
 */
export async function sendEmail({
  token,
  email,
  subject,
  username,
  numeroInventaire,
  cause,
  designation,
}: SendEmailParams): Promise<{ success: boolean; message?: string }> {
  try {
    // Construct the request body with all parameters
    const requestBody: Record<string, string> = {
      email,
      subject,
      username,
    };

    // Add optional parameters if they exist
    if (numeroInventaire) requestBody.numeroInventaire = numeroInventaire;
    if (cause) requestBody.cause = cause;
    if (designation) requestBody.designation = designation;

    // Make the API request
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/send-html-email/',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      },
    );

    // Handle response
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error sending email:', errorData);
      return {
        success: false,
        message: `Failed to send email: ${response.status} ${response.statusText}`,
      };
    }

    // Parse successful response
    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Email sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while sending the email',
    };
  }
}

/**
 * Sends an email notification for an irreparable equipment
 * @param token Authentication token
 * @param email Recipient email address
 * @param username Recipient username
 * @param numeroInventaire Equipment inventory number
 * @param cause Reason why the equipment is irreparable
 * @returns Promise resolving to the API response
 */
export async function sendEquipmentIrreparableEmail(
  token: string,
  email: string,
  username: string,
  numeroInventaire: string,
  cause: string,
): Promise<{ success: boolean; message?: string }> {
  return sendEmail({
    token,
    email,
    subject: 'Equipement Irreparable',
    username,
    numeroInventaire,
    cause,
  });
}

/**
 * Sends an email notification for a completed repair
 * @param token Authentication token
 * @param email Recipient email address
 * @param username Recipient username
 * @param numeroInventaire Equipment inventory number
 * @param designation Equipment description/name
 * @returns Promise resolving to the API response
 */
export async function sendRepairCompletedEmail(
  token: string,
  email: string,
  username: string,
  numeroInventaire: string,
  designation: string,
): Promise<{ success: boolean; message?: string }> {
  return sendEmail({
    token,
    email,
    subject: 'Reparation Terminee',
    username,
    numeroInventaire,
    designation,
  });
}

/**
 * Sends an email notification for an accepted request
 * @param token Authentication token
 * @param email Recipient email address
 * @param username Recipient username
 * @param numeroInventaire Equipment inventory number
 * @returns Promise resolving to the API response
 */
export async function sendRequestAcceptedEmail(
  token: string,
  email: string,
  username: string,
  numeroInventaire: string,
): Promise<{ success: boolean; message?: string }> {
  return sendEmail({
    token,
    email,
    subject: 'Demande Acceptee',
    username,
    numeroInventaire,
  });
}

/**
 * Sends an email notification for a rejected request
 * @param token Authentication token
 * @param email Recipient email address
 * @param username Recipient username
 * @param numeroInventaire Equipment inventory number
 * @param cause Reason for rejection
 * @returns Promise resolving to the API response
 */
export async function sendRequestRejectedEmail(
  token: string,
  email: string,
  username: string,
  numeroInventaire: string,
  cause: string,
): Promise<{ success: boolean; message?: string }> {
  return sendEmail({
    token,
    email,
    subject: 'Demande Refusee',
    username,
    numeroInventaire,
    cause,
  });
}

// Keep the general notification functions for backward compatibility
/**
 * Sends a notification email about an equipment status change
 * @param token Authentication token
 * @param email Recipient email address
 * @param username Recipient username
 * @param designation Equipment designation/name
 * @param numeroInventaire Equipment inventory number
 * @param cause Reason for the notification
 * @returns Promise resolving to the API response
 */
export async function sendEquipmentNotification(
  token: string,
  email: string,
  username: string,
  designation: string,
  numeroInventaire: string,
  cause: string,
): Promise<{ success: boolean; message?: string }> {
  return sendEmail({
    token,
    email,
    subject: "Notification: Changement de statut d'équipement",
    username,
    designation,
    numeroInventaire,
    cause,
  });
}

/**
 * Sends a welcome email to a new user
 * @param token Authentication token
 * @param email Recipient email address
 * @param username Recipient username
 * @returns Promise resolving to the API response
 */
export async function sendWelcomeEmail(
  token: string,
  email: string,
  username: string,
): Promise<{ success: boolean; message?: string }> {
  return sendEmail({
    token,
    email,
    subject: 'Bienvenue sur le système ITMS',
    username,
  });
}

/**
 * Sends an email with the PDF list of equipments to the inventory service
 * @param token Authentication token
 * @param email Email address to send the equipment list to
 * @returns Promise resolving to the API response
 */
export async function sendEquipmentsListEmail(
  token: string,
  email: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/equipements-pdf-email/',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error sending equipments list email:', errorData);
      return {
        success: false,
        message: `Failed to send equipments list: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Liste des équipements envoyée avec succès',
    };
  } catch (error) {
    console.error('Error sending equipments list email:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors de l'envoi de la liste d'équipements",
    };
  }
}

/**
 * Downloads a PDF list of all equipments
 * @param token Authentication token
 * @returns Promise resolving to the PDF blob
 */
export async function downloadEquipmentsPdf(
  token: string,
): Promise<{ success: boolean; blob?: Blob; message?: string }> {
  try {
    const response = await fetch(
      'https://itms-mpsi.onrender.com/api/equipements-export-pdf/',
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${token}`,
          Accept: 'application/pdf',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error downloading equipments PDF:', errorData);
      return {
        success: false,
        message: `Failed to download PDF: ${response.status} ${response.statusText}`,
      };
    }

    const blob = await response.blob();
    return {
      success: true,
      blob,
      message: 'Liste des équipements téléchargée avec succès',
    };
  } catch (error) {
    console.error('Error downloading equipments PDF:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Une erreur s'est produite lors du téléchargement de la liste d'équipements",
    };
  }
}
