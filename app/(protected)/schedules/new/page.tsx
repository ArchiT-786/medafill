import { getPatients } from "@/actions/patients";
import { ScheduleMessageForm } from "@/components/schedules/schedule-message-form";

export default async function NewSchedulePage() {
  const result = await getPatients();

  const patients =
    result?.status === "success" && Array.isArray(result.patients)
      ? result.patients
      : [];

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <ScheduleMessageForm patients={patients} />
    </div>
  );
}