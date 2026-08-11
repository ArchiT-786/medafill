import { notFound } from "next/navigation";

import { getPatient } from "@/actions/patients";
import { PatientForm } from "@/components/patients/patient-form";

type EditPatientPageProps = {
  params: {
    id: string;
  };
};

export default async function EditPatientPage({
  params,
}: EditPatientPageProps) {
  const result = await getPatient(params.id);

  if (result.status === "error" || !result.data) {
    notFound();
  }

  return (
    <div className="container max-w-4xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Edit Patient
        </h1>

        <p className="text-muted-foreground">
          Update the patient record and WhatsApp contact details.
        </p>
      </div>

      <PatientForm patient={result.data} />
    </div>
  );
}