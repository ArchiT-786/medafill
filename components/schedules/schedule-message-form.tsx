"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { createWhatsAppSchedule } from "@/actions/whatsapp-schedules";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScheduleMessageForm() {
  const router = useRouter();

  const [scheduledAt, setScheduledAt] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!scheduledAt) {
      setError(
        "Please select a date and time.",
      );
      return;
    }

    setLoading(true);

    try {
      const result =
        await createWhatsAppSchedule({
          scheduledAt: new Date(scheduledAt),
        });

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      setSuccess(
        "WhatsApp message schedule created successfully.",
      );

      setScheduledAt("");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create schedule.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5" />
          <CardTitle>
            Schedule WhatsApp Messages
          </CardTitle>
        </div>

        <CardDescription>
          Schedule a time to automatically send the
          patient message to all configured WhatsApp
          numbers.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">
              Scheduled Date & Time
            </Label>

            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(
                  event.target.value,
                )
              }
              disabled={loading}
            />

            <p className="text-sm text-muted-foreground">
              At this time, the system will fetch all
              eligible patients and send their WhatsApp
              messages one by one.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading
              ? "Creating Schedule..."
              : "Create Schedule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}