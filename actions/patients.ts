"use server";

import { PatientStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type PatientInput = {
  patientName: string;
  age?: number | null;
  policeStation?: string | null;
  patientPhone?: string | null;
  agencyPhone?: string | null;
  doctorPhone?: string | null;
  clinicPhone?: string | null;
  status: PatientStatus;
  doctorName?: string | null;
  clinicName?: string | null;
  date?: Date | null;
  advance?: number | null;
};

export async function getPatients() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
      data: [],
    };
  }

  try {
    const patients =
      await prisma.patient.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return {
      status: "success" as const,
      data: patients,
    };
  } catch (error) {
    console.error(
      "GET_PATIENTS_ERROR",
      error,
    );

    return {
      status: "error" as const,
      message: "Failed to fetch patients",
      data: [],
    };
  }
}

export async function getPatient(
  patientId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
      data: null,
    };
  }

  try {
    const patient =
      await prisma.patient.findFirst({
        where: {
          id: patientId,
          userId: session.user.id,
        },
      });

    if (!patient) {
      return {
        status: "error" as const,
        message: "Patient not found",
        data: null,
      };
    }

    return {
      status: "success" as const,
      data: patient,
    };
  } catch (error) {
    console.error(
      "GET_PATIENT_ERROR",
      error,
    );

    return {
      status: "error" as const,
      message: "Failed to fetch patient",
      data: null,
    };
  }
}

export async function createPatient(
  data: PatientInput,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
    };
  }

  if (!data.patientName.trim()) {
    return {
      status: "error" as const,
      message: "Patient name is required",
    };
  }

  try {
    const patient =
      await prisma.patient.create({
        data: {
          userId: session.user.id,
          patientName:
            data.patientName.trim(),
          age: data.age ?? null,
          policeStation:
            data.policeStation?.trim() ||
            null,
          patientPhone:
            data.patientPhone?.trim() ||
            null,
          agencyPhone:
            data.agencyPhone?.trim() ||
            null,
          doctorPhone:
            data.doctorPhone?.trim() ||
            null,
          clinicPhone:
            data.clinicPhone?.trim() ||
            null,
          status: data.status,
          doctorName:
            data.doctorName?.trim() ||
            null,
          clinicName:
            data.clinicName?.trim() ||
            null,
          date: data.date ?? null,
          advance: data.advance ?? null,
        },
      });

    revalidatePath("/patients");

    return {
      status: "success" as const,
      data: patient,
    };
  } catch (error) {
    console.error(
      "CREATE_PATIENT_ERROR",
      error,
    );

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create patient",
    };
  }
}

export async function updatePatient(
  patientId: string,
  data: PatientInput,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
    };
  }

  if (!data.patientName.trim()) {
    return {
      status: "error" as const,
      message: "Patient name is required",
    };
  }

  try {
    const existingPatient =
      await prisma.patient.findFirst({
        where: {
          id: patientId,
          userId: session.user.id,
        },
      });

    if (!existingPatient) {
      return {
        status: "error" as const,
        message: "Patient not found",
      };
    }

    const patient =
      await prisma.patient.update({
        where: {
          id: patientId,
        },
        data: {
          patientName:
            data.patientName.trim(),
          age: data.age ?? null,
          policeStation:
            data.policeStation?.trim() ||
            null,
          patientPhone:
            data.patientPhone?.trim() ||
            null,
          agencyPhone:
            data.agencyPhone?.trim() ||
            null,
          doctorPhone:
            data.doctorPhone?.trim() ||
            null,
          clinicPhone:
            data.clinicPhone?.trim() ||
            null,
          status: data.status,
          doctorName:
            data.doctorName?.trim() ||
            null,
          clinicName:
            data.clinicName?.trim() ||
            null,
          date: data.date ?? null,
          advance: data.advance ?? null,
        },
      });

    revalidatePath("/patients");
    revalidatePath(
      `/patients/${patientId}`,
    );

    return {
      status: "success" as const,
      data: patient,
    };
  } catch (error) {
    console.error(
      "UPDATE_PATIENT_ERROR",
      error,
    );

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update patient",
    };
  }
}

export async function deletePatient(
  patientId: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
    };
  }

  try {
    const existingPatient =
      await prisma.patient.findFirst({
        where: {
          id: patientId,
          userId: session.user.id,
        },
      });

    if (!existingPatient) {
      return {
        status: "error" as const,
        message: "Patient not found",
      };
    }

    await prisma.patient.delete({
      where: {
        id: patientId,
      },
    });

    revalidatePath("/patients");

    return {
      status: "success" as const,
      message: "Patient deleted successfully",
    };
  } catch (error) {
    console.error(
      "DELETE_PATIENT_ERROR",
      error,
    );

    return {
      status: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete patient",
    };
  }
}