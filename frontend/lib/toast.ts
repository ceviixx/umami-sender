import { toast } from 'react-notification-kit';

export enum notification_ids {
  webhook = "30c5eb83-5835-4187-9a9d-acfbf74d910f",
  webhook_test = "b10f14de-974e-4500-b18a-9c68cf018f6b",
  mailer = "59b6a11b-cee3-4e04-8bcf-dc15e8a2dffa",
  mailer_test = "cfa62815-07c5-4e87-9d25-fc5f989ef86e",
  user = "18e008dc-77ff-4b92-9752-58fae17ff3e0",
  account = "52c8533f-73bf-4108-8708-5e4cd05d4f5a",
  update_password = "e42c54ba-40a8-4faf-88df-d1f231a0df6c",
  job = "124954f0-1c50-441f-ae29-4769d055c91b",
  template_refresh = "246df2ca-4ead-414d-9693-01665c74c788",
  umami = "884127c2-f45c-4b39-bc15-948d7d047262",
  websites = "fbd38cfa-c990-4dbb-aeb6-ee3de7d434ed",
}

type ToastOptions = {
  id?: notification_ids;
  title?: string;
  description: string;
};

export const showSuccess = ({ id, title, description }: ToastOptions) => {
  toast.show({
    id,
    title: title,
    description,
    type: "success",
  });
};

export const showError = ({ id, title, description }: ToastOptions) => {
  toast.show({
    id,
    title: title,
    description,
    type: "error",
  });
};

export const showInfo = ({ id, title, description }: ToastOptions) => {
  toast.show({
    id,
    title: title,
    description,
    type: "info",
  });
};

export const showWarning = ({ id, title, description }: ToastOptions) => {
  toast.show({
    id,
    title: title,
    description,
    type: "warning",
  });
};

export const showDefault = ({ id, title, description }: ToastOptions) => {
  toast.show({
    id,
    title: title,
    description,
    type: "default",
  });
};





type ToastPayload = { title: string; description?: string };
type ToastContent<T = any> = ToastPayload | ((payload: T) => ToastPayload);

export type PromiseToastOptions<T = any> = {
  id: string;
  loading?: Partial<ToastPayload>;
  success?: ToastContent<T>;
  error?: ToastContent<any>;
};

export function showPromise<T>(
  promise: Promise<T>,
  { id, loading, success, error }: PromiseToastOptions<T>
): Promise<T> {
  const norm = <P,>(c: ToastContent<P> | undefined, p: P, fallback: ToastPayload): ToastPayload & { id: string } => {
    if (!c) return { id, ...fallback };
    const res = typeof c === "function" ? c(p) : c;
    return { id, title: res.title, description: res.description };
  };

  return toast.promise(promise, {
    loading: { id, title: loading?.title ?? "Loading", description: loading?.description ?? "Please wait..." },
    success: (res: T) => norm(success, res, { title: "Success", description: "Operation completed successfully" }),
    error: (err: any) => norm(error, err, { title: "Error", description: "Something went wrong" }),
  });
}
