const WHATSAPP_API_VERSION =
  process.env.WHATSAPP_API_VERSION || "v23.0";

const WHATSAPP_ACCESS_TOKEN =
  process.env.WHATSAPP_ACCESS_TOKEN;

const WHATSAPP_PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_NUMBER_ID;

type SendWhatsAppMessageParams = {
  phoneNumber: string;
  message: string;
};

type WhatsAppResponse = {
  messaging_product?: string;
  contacts?: {
    input: string;
    wa_id: string;
  }[];
  messages?: {
    id: string;
  }[];
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_data?: {
      messaging_product?: string;
      details?: string;
    };
  };
};

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, "");
}

export async function sendWhatsAppMessage({
  phoneNumber,
  message,
}: SendWhatsAppMessageParams) {
  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not configured");
  }

  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID is not configured",
    );
  }

  const normalizedPhoneNumber =
    normalizePhoneNumber(phoneNumber);

  if (!normalizedPhoneNumber) {
    throw new Error("Invalid WhatsApp phone number");
  }

  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedPhoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    },
  );

  const data =
    (await response.json()) as WhatsAppResponse;

  if (!response.ok) {
    const errorMessage =
      data.error?.error_data?.details ||
      data.error?.message ||
      "Failed to send WhatsApp message";

    throw new Error(errorMessage);
  }

  const messageId = data.messages?.[0]?.id;

  if (!messageId) {
    throw new Error(
      "WhatsApp API did not return a message ID",
    );
  }

  return {
    messageId,
    phoneNumber: normalizedPhoneNumber,
  };
}