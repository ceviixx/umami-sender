import { useRouter } from 'next/router';

interface ListItemProps {
  id: number;
  title: string;
  subtitle?: string;
  href?: string;
  onDelete?: (id: string) => void;
  statusColor?: string; // z. B. "bg-green-500"
  statusTitle?: string;
  icon?: React.ReactNode;
  contextMenu?: React.ReactNode;
}

export function ListItem({
  id,
  title,
  subtitle,
  href,
  onDelete,
  statusColor,
  statusTitle,
  icon,
  contextMenu,
}: ListItemProps) {
  const router = useRouter();

  return (
    <li className="border rounded p-3 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        {statusColor && (
          <span
            className={`w-3 h-3 rounded-full ${statusColor}`}
            title={statusTitle}
          />
        )}
        {icon}

        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          {subtitle && <div className="text-gray-600 text-sm">{subtitle}</div>}
        </div>
      </div>

      {contextMenu ?? null}
    </li>
  );
}