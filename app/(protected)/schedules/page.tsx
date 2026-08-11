import Link from "next/link";
import { CalendarClock, Plus } from "lucide-react";

import { getWhatsAppSchedules } from "@/actions/whatsapp-schedules";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusClassName(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "SENT":
      return "bg-green-100 text-green-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default async function SchedulesPage() {
  const result = await getWhatsAppSchedules();

  const schedules =
    result.status === "success"
      ? result.schedules
      : [];

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            WhatsApp Schedules
          </h1>

          <p className="text-muted-foreground">
            Schedule automatic WhatsApp messages for all
            eligible patients.
          </p>
        </div>

        <Button asChild>
          <Link href="/schedules/new">
            <Plus className="mr-2 size-4" />
            Create Schedule
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarClock className="size-5" />

            <div>
              <CardTitle>
                Scheduled Messages
              </CardTitle>

              <CardDescription>
                Each schedule is a batch that processes
                all eligible patients when the scheduled
                time arrives.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarClock className="mb-4 size-10 text-muted-foreground" />

              <h3 className="text-lg font-semibold">
                No schedules found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a schedule to automatically send
                WhatsApp messages.
              </p>

              <Button asChild className="mt-4">
                <Link href="/schedules/new">
                  Create Schedule
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">
                      Scheduled For
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Created
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Sent At
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-3">
                        {formatDateTime(
                          schedule.scheduledAt,
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                            schedule.status,
                          )}`}
                        >
                          {schedule.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(
                          schedule.createdAt,
                        )}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {schedule.sentAt
                          ? formatDateTime(
                              schedule.sentAt,
                            )
                          : "-"}
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