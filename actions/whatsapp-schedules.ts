"use server";

import { WhatsAppScheduleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type CreateScheduleInput = {
  scheduledAt: Date;
};

export async function createWhatsAppSchedule(
  data: CreateScheduleInput,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
    };
  }

  if (
    Number.isNaN(
      new Date(data.scheduledAt).getTime(),
    )
  ) {
    return {
      status: "error" as const,
      message: "Invalid scheduled date and time",
    };
  }

  if (
    new Date(data.scheduledAt).getTime() <=
    Date.now()
  ) {
    return {
      status: "error" as const,
      message:
        "Scheduled date and time must be in the future",
    };
  }

  const schedule =
    await prisma.whatsAppSchedule.create({
      data: {
        userId: session.user.id,
        scheduledAt: new Date(
          data.scheduledAt,
        ),
        status: WhatsAppScheduleStatus.PENDING,
      },
    });

  revalidatePath("/schedules");

  return {
    status: "success" as const,
    message:
      "WhatsApp schedule created successfully",
    schedule,
  };
}

export async function getWhatsAppSchedules() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
      schedules: [],
    };
  }

  const schedules =
    await prisma.whatsAppSchedule.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });

  return {
    status: "success" as const,
    schedules,
  };
}

export async function cancelWhatsAppSchedule(
  scheduleId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
    };
  }

  const schedule =
    await prisma.whatsAppSchedule.findFirst({
      where: {
        id: scheduleId,
        userId: session.user.id,
      },
    });

  if (!schedule) {
    return {
      status: "error" as const,
      message: "Schedule not found",
    };
  }

  if (
    schedule.status !==
    WhatsAppScheduleStatus.PENDING
  ) {
    return {
      status: "error" as const,
      message:
        "Only pending schedules can be cancelled",
    };
  }

  await prisma.whatsAppSchedule.update({
    where: {
      id: schedule.id,
    },
    data: {
      status:
        WhatsAppScheduleStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/schedules");

  return {
    status: "success" as const,
    message:
      "WhatsApp schedule cancelled successfully",
  };
}