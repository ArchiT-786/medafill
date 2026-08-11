"use server";

import {
  WhatsAppMessageStatus,
  WhatsAppRecipientType,
} from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { formatWhatsAppMessage } from "@/lib/whatsapp-message";

type Recipient = {
  type: WhatsAppRecipientType;
  phoneNumber: string | null;
};

export async function sendPatientWhatsApp(
  patientId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error",
      message: "Unauthorized",
    };
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      userId: session.user.id,
    },
  });

  if (!patient) {
    return {
      status: "error",
      message: "Patient not found",
    };
  }

  const message = formatWhatsAppMessage(patient);

  const recipients: Recipient[] = [
    {
      type: WhatsAppRecipientType.PATIENT,
      phoneNumber: patient.patientPhone,
    },
    {
      type: WhatsAppRecipientType.AGENCY,
      phoneNumber: patient.agencyPhone,
    },
    {
      type: WhatsAppRecipientType.DOCTOR,
      phoneNumber: patient.doctorPhone,
    },
    {
      type: WhatsAppRecipientType.CLINIC,
      phoneNumber: patient.clinicPhone,
    },
  ];

  const results = [];

  for (const recipient of recipients) {
    if (!recipient.phoneNumber?.trim()) {
      const log = await prisma.whatsAppLog.create({
        data: {
          patientId: patient.id,
          recipientType: recipient.type,
          phoneNumber: "",
          status: WhatsAppMessageStatus.SKIPPED,
          message,
          error:
            "WhatsApp phone number is not configured",
        },
      });

      results.push({
        recipientType: recipient.type,
        status: WhatsAppMessageStatus.SKIPPED,
        logId: log.id,
      });

      continue;
    }

    const log = await prisma.whatsAppLog.create({
      data: {
        patientId: patient.id,
        recipientType: recipient.type,
        phoneNumber: recipient.phoneNumber,
        status: WhatsAppMessageStatus.PENDING,
        message,
      },
    });

    try {
      const response = await sendWhatsAppMessage({
        phoneNumber: recipient.phoneNumber,
        message,
      });

      await prisma.whatsAppLog.update({
        where: {
          id: log.id,
        },
        data: {
          status: WhatsAppMessageStatus.SENT,
          messageId: response.messageId,
          error: null,
        },
      });

      results.push({
        recipientType: recipient.type,
        status: WhatsAppMessageStatus.SENT,
        logId: log.id,
        messageId: response.messageId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown WhatsApp API error";

      await prisma.whatsAppLog.update({
        where: {
          id: log.id,
        },
        data: {
          status: WhatsAppMessageStatus.FAILED,
          error: errorMessage,
        },
      });

      results.push({
        recipientType: recipient.type,
        status: WhatsAppMessageStatus.FAILED,
        logId: log.id,
        error: errorMessage,
      });
    }
  }

  const sentCount = results.filter(
    (result) =>
      result.status ===
      WhatsAppMessageStatus.SENT,
  ).length;

  const failedCount = results.filter(
    (result) =>
      result.status ===
      WhatsAppMessageStatus.FAILED,
  ).length;

  const skippedCount = results.filter(
    (result) =>
      result.status ===
      WhatsAppMessageStatus.SKIPPED,
  ).length;

  return {
    status: "success",
    data: {
      patientId: patient.id,
      results,
      sentCount,
      failedCount,
      skippedCount,
      totalRecipients: recipients.length,
    },
  };
}