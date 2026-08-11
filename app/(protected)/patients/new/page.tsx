import { PatientForm } from "@/components/patients/patient-form";

export default function NewPatientPage() {
  return (
    <div className="container max-w-4xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Add Patient
        </h1>

        <p className="text-muted-foreground">
          Add a new patient record and WhatsApp contact details.
        </p>
      </div>

      <PatientForm />
    </div>
  );
}