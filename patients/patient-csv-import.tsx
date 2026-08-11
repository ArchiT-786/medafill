"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { importPatientsFromCsv } from "@/actions/patient-import";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PreviewRow = {
  row: number;
  patientName: string;
  phone1: string;
  phone2: string;
  phone3: string;
  phone4: string;
  status: string;
  age: string;
  policeStation: string;
  doctorName: string;
  clinicName: string;
  date: string;
  advance: string;
  valid: boolean;
  error?: string;
};

type ImportResult = {
  row: number;
  patientName: string;
  status: "imported" | "failed";
  error?: string;
};

function normalizePhone(value?: string) {
  if (!value) {
    return "";
  }

  return value.replace(/\D/g, "");
}

function validateStatus(value: string) {
  const status = value.trim().toUpperCase();

  return [
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
  ].includes(status);
}

function validateDate(value: string) {
  if (!value.trim()) {
    return true;
  }

  const match = value
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > 31) {
    return false;
  }

  const date = new Date(
    Date.UTC(year, month - 1, day),
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateRow(
  row: Record<string, string>,
  rowNumber: number,
): PreviewRow {
  const patientName =
    row["Patient Name"]?.trim() || "";

  const phone1 = normalizePhone(row.Phone1);
  const phone2 = normalizePhone(row.Phone2);
  const phone3 = normalizePhone(row.Phone3);
  const phone4 = normalizePhone(row.Phone4);

  const status =
    row.Status?.trim().toUpperCase() || "";

  const age = row.Age?.trim() || "";

  const policeStation =
    row.PS?.trim() || "";

  const doctorName =
    row["Docter Name"]?.trim() ||
    row["Doctor Name"]?.trim() ||
    "";

  const clinicName =
    row["Clinic Name"]?.trim() || "";

  const date =
    row.Date?.trim() || "";

  const advance =
    row.Advance?.trim() || "";

  let error = "";

  if (!patientName) {
    error = "Patient Name is required";
  } else if (!status) {
    error = "Status is required";
  } else if (!validateStatus(status)) {
    error =
      "Status must be ACTIVE, COMPLETED, or CANCELLED";
  } else if (
    age &&
    !Number.isInteger(Number(age))
  ) {
    error = "Age must be a valid number";
  } else if (
    age &&
    (Number(age) < 0 || Number(age) > 150)
  ) {
    error = "Age must be between 0 and 150";
  } else if (
    advance &&
    (!Number.isFinite(
      Number(advance.replace(/,/g, "")),
    ) ||
      Number(advance.replace(/,/g, "")) < 0)
  ) {
    error = "Advance must be a valid number";
  } else if (
    date &&
    !validateDate(date)
  ) {
    error =
      "Invalid date. Use DD/MM/YYYY, for example 20/11/2026";
  }

  return {
    row: rowNumber,
    patientName,
    phone1,
    phone2,
    phone3,
    phone4,
    status,
    age,
    policeStation,
    doctorName,
    clinicName,
    date,
    advance,
    valid: !error,
    error: error || undefined,
  };
}

export function PatientCsvImport() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<PreviewRow[]>([]);

  const [csvText, setCsvText] =
    useState("");

  const [isReading, setIsReading] =
    useState(false);

  const [isImporting, setIsImporting] =
    useState(false);

  const [results, setResults] =
    useState<ImportResult[]>([]);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      toast.error(
        "Please select a CSV file",
      );

      event.target.value = "";
      return;
    }

    setIsReading(true);
    setPreview([]);
    setResults([]);
    setCsvText("");

    try {
      const text = await selectedFile.text();

      setFile(selectedFile);
      setCsvText(text);

      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim());

      if (lines.length < 2) {
        toast.error(
          "CSV must contain a header and at least one patient",
        );

        setFile(null);
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((header) =>
          header
            .trim()
            .replace(/^"|"$/g, ""),
        );

      const requiredHeaders = [
        "Phone1",
        "Phone2",
        "Phone3",
        "Phone4",
        "Status",
        "Patient Name",
        "Age",
        "PS",
        "Clinic Name",
        "Date",
        "Advance",
      ];

      const hasDoctorName =
        headers.includes("Docter Name") ||
        headers.includes("Doctor Name");

      if (!hasDoctorName) {
        requiredHeaders.push("Docter Name");
      }

      const missingHeaders =
        requiredHeaders.filter(
          (header) =>
            !headers.includes(header),
        );

      if (missingHeaders.length > 0) {
        toast.error(
          `Missing columns: ${missingHeaders.join(", ")}`,
        );

        setFile(null);
        setCsvText("");
        return;
      }

      const rows: PreviewRow[] = [];

      for (
        let index = 1;
        index < lines.length;
        index++
      ) {
        const values = lines[index]
          .split(",")
          .map((value) =>
            value
              .trim()
              .replace(/^"|"$/g, ""),
          );

        const row: Record<string, string> =
          {};

        headers.forEach(
          (header, columnIndex) => {
            row[header] =
              values[columnIndex] || "";
          },
        );

        rows.push(
          validateRow(
            row,
            index + 1,
          ),
        );
      }

      setPreview(rows);
    } catch (error) {
      console.error(
        "CSV_READ_ERROR",
        error,
      );

      toast.error(
        "Failed to read CSV file",
      );
    } finally {
      setIsReading(false);
    }
  }

  async function handleImport() {
    if (!file || !csvText) {
      toast.error(
        "Please select a CSV file",
      );

      return;
    }

    const invalidRows =
      preview.filter(
        (row) => !row.valid,
      );

    if (invalidRows.length > 0) {
      toast.error(
        `${invalidRows.length} row(s) contain errors`,
      );

      return;
    }

    setIsImporting(true);
    setResults([]);

    try {
      const result =
        await importPatientsFromCsv(
          csvText,
        );

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      setResults(result.results);

      toast.success(result.message);

      router.refresh();
    } catch (error) {
      console.error(
        "PATIENT_CSV_IMPORT_ERROR",
        error,
      );

      toast.error(
        "Failed to import CSV file",
      );
    } finally {
      setIsImporting(false);
    }
  }

  function resetImport() {
    setFile(null);
    setPreview([]);
    setResults([]);
    setCsvText("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const validRows =
    preview.filter(
      (row) => row.valid,
    ).length;

  const invalidRows =
    preview.filter(
      (row) => !row.valid,
    ).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Upload Patient CSV
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={isReading}
            >
              {isReading
                ? "Reading..."
                : "Choose CSV File"}
            </Button>

            {file && (
              <p className="mt-3 text-sm text-muted-foreground">
                {file.name}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-sm font-medium">
              CSV columns
            </p>

            <code className="text-xs">
              Phone1, Phone2, Phone3, Phone4,
              Status, Patient Name, Age, PS,
              Docter Name, Clinic Name, Date,
              Advance
            </code>

            <p className="mt-3 text-xs text-muted-foreground">
              Date format: DD/MM/YYYY
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Example: 20/11/2026
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Status: Active, Completed, or
              Cancelled
            </p>
          </div>
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Preview
              </CardTitle>

              <div className="flex gap-3 text-sm">
                <span className="text-green-600">
                  {validRows} valid
                </span>

                <span className="text-red-600">
                  {invalidRows} invalid
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-3">
                      Row
                    </th>

                    <th className="p-3">
                      Patient
                    </th>

                    <th className="p-3">
                      Patient Phone
                    </th>

                    <th className="p-3">
                      Agency Phone
                    </th>

                    <th className="p-3">
                      Doctor Phone
                    </th>

                    <th className="p-3">
                      Clinic Phone
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                    <th className="p-3">
                      Age
                    </th>

                    <th className="p-3">
                      PS
                    </th>

                    <th className="p-3">
                      Doctor
                    </th>

                    <th className="p-3">
                      Clinic
                    </th>

                    <th className="p-3">
                      Date
                    </th>

                    <th className="p-3">
                      Advance
                    </th>

                    <th className="p-3">
                      Validation
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {preview.map((row) => (
                    <tr
                      key={row.row}
                      className="border-b"
                    >
                      <td className="p-3">
                        {row.row}
                      </td>

                      <td className="p-3 font-medium">
                        {row.patientName ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {row.phone1 || "-"}
                      </td>

                      <td className="p-3">
                        {row.phone2 || "-"}
                      </td>

                      <td className="p-3">
                        {row.phone3 || "-"}
                      </td>

                      <td className="p-3">
                        {row.phone4 || "-"}
                      </td>

                      <td className="p-3">
                        {row.status || "-"}
                      </td>

                      <td className="p-3">
                        {row.age || "-"}
                      </td>

                      <td className="p-3">
                        {row.policeStation ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {row.doctorName ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {row.clinicName ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {row.date || "-"}
                      </td>

                      <td className="p-3">
                        {row.advance || "-"}
                      </td>

                      <td className="p-3">
                        {row.valid ? (
                          <span className="text-green-600">
                            Valid
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {row.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetImport}
                disabled={isImporting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleImport}
                disabled={
                  isImporting ||
                  invalidRows > 0 ||
                  validRows === 0
                }
              >
                {isImporting
                  ? "Importing..."
                  : `Import ${validRows} Patient${
                      validRows === 1
                        ? ""
                        : "s"
                    }`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Import Results
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">
                      Row
                    </th>

                    <th className="p-3">
                      Patient
                    </th>

                    <th className="p-3">
                      Result
                    </th>

                    <th className="p-3">
                      Error
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => (
                    <tr
                      key={`${result.row}-${result.patientName}`}
                      className="border-b"
                    >
                      <td className="p-3">
                        {result.row}
                      </td>

                      <td className="p-3">
                        {result.patientName ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {result.status ===
                        "imported" ? (
                          <span className="text-green-600">
                            Imported
                          </span>
                        ) : (
                          <span className="text-red-600">
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-destructive">
                        {result.error || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}