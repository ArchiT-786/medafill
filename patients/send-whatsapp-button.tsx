"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { sendPatientWhatsApp } from "@/actions/whatsapp";
import { Button } from "@/components/ui/button";

type SendWhatsAppButtonProps = {
  patientId: string;
};

export function SendWhatsAppButton({
  patientId,
}: SendWhatsAppButtonProps) {
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    setIsSending(true);

    try {
      const result = await sendPatientWhatsApp(patientId);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      const { sentCount, failedCount, skippedCount } = result.data;

      if (failedCount === 0 && skippedCount === 0) {
        toast.success(
          `${sentCount} WhatsApp message${
            sentCount === 1 ? "" : "s"
          } sent successfully.`,
        );

        return;
      }

      const details = [];

      if (sentCount > 0) {
        details.push(`${sentCount} sent`);
      }

      if (failedCount > 0) {
        details.push(`${failedCount} failed`);
      }

      if (skippedCount > 0) {
        details.push(`${skippedCount} skipped`);
      }

      toast.warning(`WhatsApp: ${details.join(", ")}.`);
    } catch (error) {
      console.error("SEND_WHATSAPP_BUTTON_ERROR", error);

      toast.error("Failed to send WhatsApp messages.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleSend}
      disabled={isSending}
    >
      <MessageCircle className="mr-2 h-4 w-4" />

      {isSending ? "Sending..." : "Send WhatsApp"}
    </Button>
  );
}