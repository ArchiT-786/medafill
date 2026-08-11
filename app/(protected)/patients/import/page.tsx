import Link from "next/link";

import { PatientCsvImport } from "@/components/patients/patient-csv-import";

export default function PatientImportPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Import Patients
          </h1>

          <p className="text-sm text-muted-foreground">
            Upload a CSV file to create multiple patient
            records.
          </p>
        </div>

        <Link
          href="/patients"
          className="text-sm font-medium hover:underline"
        >
          Back to Patients
        </Link>
      </div>

      <PatientCsvImport />
    </div>
  );
}