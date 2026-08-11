import { getWhatsAppLogs } from "@/actions/whatsapp-logs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getStatusClassName(status: string) {
  switch (status) {
    case "SENT":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "SKIPPED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatRecipientType(type: string) {
  switch (type) {
    case "PATIENT":
      return "Patient";

    case "AGENCY":
      return "Agency";

    case "DOCTOR":
      return "Doctor";

    case "CLINIC":
      return "Clinic";

    default:
      return type;
  }
}

export default async function LogsPage() {
  const result = await getWhatsAppLogs();

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

  const logs = result.data;

  return (
    <div className="container space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          WhatsApp Logs
        </h1>

        <p className="text-muted-foreground">
          View the status of all WhatsApp messages sent from the
          application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Logs</CardTitle>
        </CardHeader>

        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="text-lg font-semibold">
                No WhatsApp logs found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                WhatsApp messages sent from patient records will appear
                here.
              </p>
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
                      Recipient
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Phone Number
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Message ID
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Error
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">
                        {log.patient.patientName}
                      </td>

                      <td className="px-4 py-3">
                        {formatRecipientType(log.recipientType)}
                      </td>

                      <td className="px-4 py-3">
                        {log.phoneNumber || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                            log.status,
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="max-w-[180px] truncate px-4 py-3 font-mono text-xs">
                        {log.messageId || "-"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(log.createdAt))}
                      </td>

                      <td className="max-w-[300px] px-4 py-3 text-sm text-destructive">
                        {log.error || "-"}
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