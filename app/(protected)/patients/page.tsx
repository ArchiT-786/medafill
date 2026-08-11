import Link from "next/link";
import { Plus } from "lucide-react";

import { getPatients } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PatientsPage() {
  const result = await getPatients();

  if (result.status === "error") {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-destructive">
              {result.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const patients = result.data;

  return (
    <div className="container space-y-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Patients
          </h1>

          <p className="text-muted-foreground">
            Manage patient records and WhatsApp contacts.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href="/patients/import">
            Import CSV
          </Link>
        </Button>

        <Button asChild>
          <Link href="/patients/new">
            Add Patient
          </Link>
        </Button>

        <Button asChild>
          <Link href="/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>

        <CardContent>
          {patients.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold">
                No patients found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add your first patient to get started.
              </p>

              <Button className="mt-4" asChild>
                <Link href="/patients/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">
                      Patient Name
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Age
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Police Station
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Doctor
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Clinic
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {patient.patientName}
                      </td>

                      <td className="px-4 py-3">
                        {patient.age ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {patient.policeStation ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {patient.doctorName ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {patient.clinicName ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {patient.status}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {patient.date
                          ? new Intl.DateTimeFormat("en-IN").format(
                              new Date(patient.date),
                            )
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/patients/${patient.id}`}
                          >
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}