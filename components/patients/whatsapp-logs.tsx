import {
  WhatsAppMessageStatus,
  WhatsAppRecipientType,
} from "@prisma/client";

import { getPatientWhatsAppLogs } from "@/actions/whatsapp-logs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WhatsAppLogsProps = {
  patientId: string;
};

function getStatusClassName(status: WhatsAppMessageStatus) {
  switch (status) {
    case WhatsAppMessageStatus.SENT:
      return "bg-green-100 text-green-700";

    case WhatsAppMessageStatus.FAILED:
      return "bg-red-100 text-red-700";

    case WhatsAppMessageStatus.PENDING:
      return "bg-yellow-100 text-yellow-700";

    case WhatsAppMessageStatus.SKIPPED:
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-muted text-muted-foreground";
  }
}

function getRecipientName(type: WhatsAppRecipientType) {
  switch (type) {
    case WhatsAppRecipientType.PATIENT:
      return "Patient";

    case WhatsAppRecipientType.AGENCY:
      return "Agency";

    case WhatsAppRecipientType.DOCTOR:
      return "Doctor";

    case WhatsAppRecipientType.CLINIC:
      return "Clinic";

    default:
      return type;
  }
}

export async function WhatsAppLogs({
  patientId,
}: WhatsAppLogsProps) {
  const result = await getPatientWhatsAppLogs(patientId);

  if (result.status === "error") {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">
            {result.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const logs = result.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Message History</CardTitle>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No WhatsApp messages have been sent for this patient.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {getRecipientName(log.recipientType)}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {log.phoneNumber || "No phone number"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClassName(
                      log.status,
                    )}`}
                  >
                    {log.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Sent At
                    </p>

                    <p className="text-sm">
                      {new Intl.DateTimeFormat("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(log.createdAt))}
                    </p>
                  </div>

                  {log.messageId && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Message ID
                      </p>

                      <p className="break-all font-mono text-xs">
                        {log.messageId}
                      </p>
                    </div>
                  )}

                  {log.error && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Error
                      </p>

                      <p className="text-sm text-destructive">
                        {log.error}
                      </p>
                    </div>
                  )}

                  {log.message && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Message
                      </p>

                      <pre className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                        {log.message}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}