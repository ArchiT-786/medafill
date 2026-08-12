export function formatWhatsAppMessage(patient: {
  patientName: string;
  age: number | null;
  policeStation: string | null;
  doctorName: string | null;
  clinicName: string | null;
  date: Date | null;
  advance: unknown;
}) {
  const date = patient.date
    ? new Intl.DateTimeFormat("en-IN").format(
        new Date(patient.date),
      )
    : "-";

  const advance =
    patient.advance !== null &&
    patient.advance !== undefined
      ? `₹${Number(patient.advance).toLocaleString("en-IN")}`
      : "-";

  return [
    `Patient Name: ${patient.patientName}`,
    `Age: ${patient.age ?? "-"}`,
    `Police Station: ${patient.policeStation ?? "-"}`,
    `Doctor Name: ${patient.doctorName ?? "-"}`,
    `Clinic Name: ${patient.clinicName ?? "-"}`,
    `Date: ${date}`,
    `Advance: ${advance}`,
  ].join("\n");
}