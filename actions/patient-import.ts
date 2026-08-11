"use server";

import Papa from "papaparse";
import { PatientStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

type CsvPatientRow = {
  Phone1?: string;
  Phone2?: string;
  Phone3?: string;
  Phone4?: string;
  Status?: string;
  "Patient Name"?: string;
  Age?: string;
  PS?: string;
  "Docter Name"?: string;
  "Doctor Name"?: string;
  "Clinic Name"?: string;
  Date?: string;
  Advance?: string;
};

type ImportResult = {
  row: number;
  patientName: string;
  status: "imported" | "failed";
  error?: string;
};

function normalizePhoneNumber(value?: string) {
  if (!value) {
    return null;
  }

  const phone = value
    .trim()
    .replace(/\D/g, "");

  return phone || null;
}

function parseStatus(
  value?: string,
): PatientStatus | null {
  if (!value) {
    return null;
  }

  const status = value.trim().toUpperCase();

  if (
    status === PatientStatus.ACTIVE ||
    status === PatientStatus.COMPLETED ||
    status === PatientStatus.CANCELLED
  ) {
    return status;
  }

  return null;
}

function parseDate(value?: string): Date | null {
  if (!value?.trim()) {
    return null;
  }

  const dateValue = value.trim();

  const match = dateValue.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  );

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  if (day < 1 || day > 31) {
    return null;
  }

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseAge(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  const age = Number(value.trim());

  if (!Number.isInteger(age) || age < 0) {
    return null;
  }

  return age;
}

function parseAdvance(value?: string) {
  if (!value?.trim()) {
    return null;
  }

  const advance = Number(
    value.trim().replace(/,/g, ""),
  );

  if (!Number.isFinite(advance) || advance < 0) {
    return null;
  }

  return advance;
}

export async function importPatientsFromCsv(
  csvText: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error" as const,
      message: "Unauthorized",
      results: [],
    };
  }

  if (!csvText.trim()) {
    return {
      status: "error" as const,
      message: "CSV file is empty",
      results: [],
    };
  }

  const parsed = Papa.parse<CsvPatientRow>(
    csvText,
    {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) =>
        header.trim(),
      transform: (value) =>
        typeof value === "string"
          ? value.trim()
          : value,
    },
  );

  if (parsed.errors.length > 0) {
    return {
      status: "error" as const,
      message:
        parsed.errors[0]?.message ||
        "Failed to parse CSV file",
      results: [],
    };
  }

  const results: ImportResult[] = [];

  for (
    let index = 0;
    index < parsed.data.length;
    index++
  ) {
    const row = parsed.data[index];

    if (!row) {
      continue;
    }

    const rowNumber = index + 2;

    const patientName =
      row["Patient Name"]?.trim() || "";

    if (!patientName) {
      results.push({
        row: rowNumber,
        patientName: "",
        status: "failed",
        error: "Patient Name is required",
      });

      continue;
    }

    const status = parseStatus(row.Status);

    if (!status) {
      results.push({
        row: rowNumber,
        patientName,
        status: "failed",
        error:
          "Status must be ACTIVE, COMPLETED, or CANCELLED",
      });

      continue;
    }

    const age = parseAge(row.Age);

    if (
      row.Age?.trim() &&
      age === null
    ) {
      results.push({
        row: rowNumber,
        patientName,
        status: "failed",
        error: "Invalid age",
      });

      continue;
    }

    const date = parseDate(row.Date);

    if (
      row.Date?.trim() &&
      date === null
    ) {
      results.push({
        row: rowNumber,
        patientName,
        status: "failed",
        error:
          `Invalid date "${row.Date}". ` +
          "Expected DD/MM/YYYY.",
      });

      continue;
    }

    const advance = parseAdvance(
      row.Advance,
    );

    if (
      row.Advance?.trim() &&
      advance === null
    ) {
      results.push({
        row: rowNumber,
        patientName,
        status: "failed",
        error: "Invalid advance amount",
      });

      continue;
    }

    try {
      await prisma.patient.create({
        data: {
          userId: session.user.id,

          patientPhone:
            normalizePhoneNumber(row.Phone1),

          agencyPhone:
            normalizePhoneNumber(row.Phone2),

          doctorPhone:
            normalizePhoneNumber(row.Phone3),

          clinicPhone:
            normalizePhoneNumber(row.Phone4),

          status,

          patientName,

          age,

          policeStation:
            row.PS?.trim() || null,

          doctorName:
            row["Docter Name"]?.trim() ||
            row["Doctor Name"]?.trim() ||
            null,

          clinicName:
            row["Clinic Name"]?.trim() ||
            null,

          date,

          advance,
        },
      });

      results.push({
        row: rowNumber,
        patientName,
        status: "imported",
      });
    } catch (error) {
      console.error(
        `CSV_IMPORT_ROW_${rowNumber}`,
        error,
      );

      results.push({
        row: rowNumber,
        patientName,
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "Failed to create patient",
      });
    }
  }

  revalidatePath("/patients");

  const imported = results.filter(
    (result) =>
      result.status === "imported",
  ).length;

  const failed = results.filter(
    (result) =>
      result.status === "failed",
  ).length;

  return {
    status: "success" as const,
    message: `Imported ${imported} patient(s), ${failed} failed`,
    imported,
    failed,
    results,
  };
}