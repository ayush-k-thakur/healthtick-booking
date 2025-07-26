import { FiClock, FiTrash } from "react-icons/fi";

const statusStyles = {
  Available: "bg-green-50 border-green-200 text-green-600",
  "Follow-up": "bg-blue-50 border-blue-200 text-blue-600",
  Onboarding: "bg-purple-50 border-purple-200 text-purple-600",
};

interface Client {
  name: string;
  phone?: string;
  number?: string;
}

interface BookingCardProps {
  time: string;
  client?: string | Client;
  type: "onboarding" | "followup" | "available";
  onDelete?: (time: string, type: "onboarding" | "followup") => void;
  onBook?: (time: string) => void;
}

export default function BookingCard({
  time,
  client,
  type,
  onDelete,
  onBook,
}: BookingCardProps) {
  const isClientObj = (c: string | Client | undefined): c is Client =>
    typeof c === "object" && c !== null && "name" in c;

  if (type === "available") {
    return (
      <div
        className={`border rounded-lg p-3 cursor-pointer hover:shadow-md ${statusStyles.Available}`}
        onClick={() => onBook?.(time)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onBook?.(time);
        }}
        aria-label={`Book slot at ${time}`}
      >
        <div className="flex items-center gap-2 text-sm">
          <FiClock />
          {time}
        </div>
        <p className="font-semibold mt-1">Available</p>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-lg p-3 ${
        statusStyles[type === "onboarding" ? "Onboarding" : "Follow-up"]
      } relative`}
    >
      <div className="flex items-center gap-2 text-sm">
        <FiClock />
        {time}
      </div>
      <p className="font-medium">
        {isClientObj(client) ? client.name : client || "No Name"}
      </p>
      <p className="text-sm font-medium">
        {isClientObj(client) ? client.phone || client.number : ""}
      </p>

      {onDelete && (
        <button
          onClick={() => onDelete(time, type)}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          title={`Delete ${type} booking at ${time}`}
          aria-label={`Delete ${type} booking at ${time}`}
        >
          <FiTrash size={18} className="cursor-pointer" />
        </button>
      )}
    </div>
  );
}
