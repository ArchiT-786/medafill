"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function getWhatsAppLogs() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
      data: [],
    };
  }

  try {
    const logs = await prisma.whatsAppLog.findMany({
      where: {
        patient: {
          userId: session.user.id,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            patientName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      status: "success" as const,
      data: logs,
    };
  } catch (error) {
    console.error("GET_WHATSAPP_LOGS_ERROR:", error);

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch WhatsApp logs",
      data: [],
    };
  }
}

export async function getPatientWhatsAppLogs(
  patientId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
      data: [],
    };
  }

  try {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      return {
        status: "error" as const,
        message: "Patient not found",
        data: [],
      };
    }

    const logs = await prisma.whatsAppLog.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      status: "success" as const,
      data: logs,
    };
  } catch (error) {
    console.error(
      "GET_PATIENT_WHATSAPP_LOGS_ERROR:",
      error,
    );

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch WhatsApp logs",
      data: [],
    };
  }
}