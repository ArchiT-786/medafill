import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { getPatient } from "@/actions/patients";
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { SendWhatsAppButton } from "@/components/patients/send-whatsapp-button";
import { WhatsAppLogs } from "@/components/patients/whatsapp-logs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PatientPageProps = {
  params: {
    id: string;
  };
};

export default async function PatientPage({
  params,
}: PatientPageProps) {
  const result = await getPatient(params.id);

  if (result.status === "error" || !result.data) {
    notFound();
  }

  const patient = result.data;

  return (
    <div className="container max-w-5xl space-y-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/patients">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patients
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {patient.patientName}
          </h1>

          <p className="text-muted-foreground">
            Patient details and contact information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SendWhatsAppButton patientId={patient.id} />

          <Button variant="outline" asChild>
            <Link href={`/dashboard/patients/${patient.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Patient
            </Link>
          </Button>

          <DeletePatientButton patientId={patient.id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Patient Name
              </p>
              <p className="font-medium">{patient.patientName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">{patient.age ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Police Station
              </p>
              <p className="font-medium">
                {patient.policeStation ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{patient.status}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {patient.date
                  ? new Intl.DateTimeFormat("en-IN").format(
                      new Date(patient.date),
                    )
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Advance
              </p>
              <p className="font-medium">
                {patient.advance !== null
                  ? `₹${Number(patient.advance).toLocaleString("en-IN")}`
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doctor & Clinic</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Doctor Name
              </p>
              <p className="font-medium">
                {patient.doctorName ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Doctor WhatsApp
              </p>
              <p className="font-medium">
                {patient.doctorPhone ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Clinic Name
              </p>
              <p className="font-medium">
                {patient.clinicName ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Clinic WhatsApp
              </p>
              <p className="font-medium">
                {patient.clinicPhone ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>WhatsApp Contacts</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Patient
                </p>
                <p className="font-medium">
                  {patient.patientPhone ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Agency
                </p>
                <p className="font-medium">
                  {patient.agencyPhone ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Doctor
                </p>
                <p className="font-medium">
                  {patient.doctorPhone ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Clinic
                </p>
                <p className="font-medium">
                  {patient.clinicPhone ?? "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <WhatsAppLogs patientId={patient.id} />
        </div>
      </div>
    </div>
  );
}