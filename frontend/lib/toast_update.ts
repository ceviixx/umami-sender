import { toast } from "react-notification-kit";

type ShowUpdateToastParams = {
  id: string;
  title: string;
  current: string;
  latest: string;
  href: string;
  duration?: number;
  onDismiss?: () => void;
};

export function showUpdateAvailableToast({
  id,
  title,
  current,
  latest,
  href,
  onDismiss,
}: ShowUpdateToastParams) {
  return toast.show(
    {
      id,
      title,
      description: `${current} → ${latest}`,
      type: "info",
      duration: 100000,
      dismissible: true,
      action: {
        label: "Details",
        onClick: () => {
          window.open(href, "_blank", "noopener,noreferrer");
          onDismiss?.();
        },
      },
    }
  );
}
