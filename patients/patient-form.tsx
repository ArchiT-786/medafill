"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PatientStatus } from "@prisma/client";
import { z } from "zod";
import { toast } from "sonner";

import { createPatient, updatePatient } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const patientSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  age: z.string(),
  policeStation: z.string(),
  patientPhone: z.string(),
  agencyPhone: z.string(),
  doctorPhone: z.string(),
  clinicPhone: z.string(),
  status: z.nativeEnum(PatientStatus),
  doctorName: z.string(),
  clinicName: z.string(),
  date: z.string(),
  advance: z.string(),
});

type PatientFormProps = {
  patient?: {
    id: string;
    patientName: string;
    age: number | null;
    policeStation: string | null;
    patientPhone: string | null;
    agencyPhone: string | null;
    doctorPhone: string | null;
    clinicPhone: string | null;
    status: PatientStatus;
    doctorName: string | null;
    clinicName: string | null;
    date: Date | null;
    advance: unknown;
  };
};

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientName: patient?.patientName ?? "",
    age: patient?.age?.toString() ?? "",
    policeStation: patient?.policeStation ?? "",
    patientPhone: patient?.patientPhone ?? "",
    agencyPhone: patient?.agencyPhone ?? "",
    doctorPhone: patient?.doctorPhone ?? "",
    clinicPhone: patient?.clinicPhone ?? "",
    status: patient?.status ?? PatientStatus.ACTIVE,
    doctorName: patient?.doctorName ?? "",
    clinicName: patient?.clinicName ?? "",
    date: patient?.date
      ? new Date(patient.date).toISOString().split("T")[0]
      : "",
    advance:
      patient?.advance !== null &&
      patient?.advance !== undefined
        ? String(patient.advance)
        : "",
  });

  function handleChange(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validation = patientSchema.safeParse(form);

    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        patientName: form.patientName,
        age: form.age ? Number(form.age) : null,
        policeStation: form.policeStation || null,
        patientPhone: form.patientPhone || null,
        agencyPhone: form.agencyPhone || null,
        doctorPhone: form.doctorPhone || null,
        clinicPhone: form.clinicPhone || null,
        status: form.status,
        doctorName: form.doctorName || null,
        clinicName: form.clinicName || null,
        date: form.date ? new Date(form.date) : null,
        advance: form.advance ? Number(form.advance) : null,
      };

      const result = patient
        ? await updatePatient(patient.id, payload)
        : await createPatient(payload);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(
        patient
          ? "Patient updated successfully"
          : "Patient created successfully",
      );

      router.push(
        patient
          ? `/patients/${patient.id}`
          : "/patients",
      );

      router.refresh();
    } catch (error) {
      console.error("PATIENT_FORM_ERROR", error);

      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="patientName">
              Patient Name
            </Label>

            <Input
              id="patientName"
              value={form.patientName}
              onChange={(event) =>
                handleChange(
                  "patientName",
                  event.target.value,
                )
              }
              placeholder="Enter patient name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>

            <Input
              id="age"
              type="number"
              min="0"
              value={form.age}
              onChange={(event) =>
                handleChange("age", event.target.value)
              }
              placeholder="Enter age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policeStation">
              Police Station
            </Label>

            <Input
              id="policeStation"
              value={form.policeStation}
              onChange={(event) =>
                handleChange(
                  "policeStation",
                  event.target.value,
                )
              }
              placeholder="Enter police station"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>

            <Select
              value={form.status}
              onValueChange={(value) =>
                handleChange("status", value)
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={PatientStatus.ACTIVE}>
                  Active
                </SelectItem>

                <SelectItem value={PatientStatus.COMPLETED}>
                  Completed
                </SelectItem>

                <SelectItem value={PatientStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>

            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(event) =>
                handleChange("date", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance">Advance</Label>

            <Input
              id="advance"
              type="number"
              min="0"
              step="0.01"
              value={form.advance}
              onChange={(event) =>
                handleChange(
                  "advance",
                  event.target.value,
                )
              }
              placeholder="Enter advance amount"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Contacts</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="patientPhone">
              Patient Phone
            </Label>

            <Input
              id="patientPhone"
              type="tel"
              value={form.patientPhone}
              onChange={(event) =>
                handleChange(
                  "patientPhone",
                  event.target.value,
                )
              }
              placeholder="Patient WhatsApp number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agencyPhone">
              Agency Phone
            </Label>

            <Input
              id="agencyPhone"
              type="tel"
              value={form.agencyPhone}
              onChange={(event) =>
                handleChange(
                  "agencyPhone",
                  event.target.value,
                )
              }
              placeholder="Agency WhatsApp number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorPhone">
              Doctor Phone
            </Label>

            <Input
              id="doctorPhone"
              type="tel"
              value={form.doctorPhone}
              onChange={(event) =>
                handleChange(
                  "doctorPhone",
                  event.target.value,
                )
              }
              placeholder="Doctor WhatsApp number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicPhone">
              Clinic Phone
            </Label>

            <Input
              id="clinicPhone"
              type="tel"
              value={form.clinicPhone}
              onChange={(event) =>
                handleChange(
                  "clinicPhone",
                  event.target.value,
                )
              }
              placeholder="Clinic WhatsApp number"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctor & Clinic</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="doctorName">
              Doctor Name
            </Label>

            <Input
              id="doctorName"
              value={form.doctorName}
              onChange={(event) =>
                handleChange(
                  "doctorName",
                  event.target.value,
                )
              }
              placeholder="Enter doctor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicName">
              Clinic Name
            </Label>

            <Input
              id="clinicName"
              value={form.clinicName}
              onChange={(event) =>
                handleChange(
                  "clinicName",
                  event.target.value,
                )
              }
              placeholder="Enter clinic name"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : patient
              ? "Update Patient"
              : "Create Patient"}
        </Button>
      </div>
    </form>
  );
}