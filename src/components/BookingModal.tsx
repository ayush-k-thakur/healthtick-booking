"use client";

import { useState } from "react";
import { format } from "date-fns";
import { addBooking, isSlotTaken } from "../services/bookingServices";
import ClientSearch from "./ClientSearch";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";

type ClientType = {
  name: string;
  number: string;
};

type Props = {
  selectedTime: string;
  selectedDate: Date;
  onClose: () => void;
  onBook: () => void;
  setShowBookingModal: (val: boolean) => void;
  fetchDaySlots: () => void;
};

export default function BookingModal({
  selectedTime,
  selectedDate,
  onClose,
  onBook,
  setShowBookingModal,
  fetchDaySlots,
}: Props) {
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [callType, setCallType] = useState<"onboarding" | "followup">("followup");
  const [loading, setLoading] = useState(false);

  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const followupDay = format(selectedDate, "EEEE");

  const handleBooking = async () => {
    if (!selectedClient) return alert("Please select a client");

    setLoading(true);
    try {
      const taken = await isSlotTaken(formattedDate, selectedTime);
      if (taken) {
        toast.error("This slot is already booked.");
        return;
      }

      const bookingData = {
        client: selectedClient,
        type: callType,
        time: selectedTime,
        date: formattedDate,
        createdAt: new Date().toISOString(),
        ...(callType === "followup" && { followupDay }),
      };

      await addBooking(bookingData);
      onBook();
      fetchDaySlots();
      setShowBookingModal(false);
      toast("Booking successful!");
    } catch (err) {
      console.error("Booking Error:", err);
      toast.error("Error occurred while booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <button
          onClick={() => setShowBookingModal(false)}
          className="absolute top-3 right-3 text-xl cursor-pointer"
          disabled={loading}
        >
          <RxCross1 className="inline-block" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Book New Call</h2>

        <div className="mb-4 text-sm bg-blue-100 p-2 rounded text-blue-700">
          📅 {formattedDate} at {selectedTime}
        </div>

        <label className="text-sm font-medium mb-1 block">Search Client</label>
        <input
          type="text"
          value={clientQuery}
          onChange={(e) => setClientQuery(e.target.value)}
          placeholder="Search by name or number"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          disabled={loading}
        />

        {!selectedClient && clientQuery.length > 0 && (
          <ClientSearch
            query={clientQuery}
            onSelect={(c) => {
              setSelectedClient(c);
              setClientQuery(c.name);
            }}
          />
        )}

        {selectedClient && (
          <div className="mb-4 text-sm text-green-700 bg-green-100 px-3 py-2 rounded flex justify-between items-center">
            <span>
              Selected: {selectedClient.name} ({selectedClient.number})
            </span>
            <button
              onClick={() => {
                setSelectedClient(null);
                setClientQuery("");
              }}
              className="text-red-500 text-sm cursor-pointer"
            >
              <RxCross1 className="inline-block scale-150" />
            </button>
          </div>
        )}

        <label className="text-sm font-medium mb-1 block">Call Type</label>
        <div className="mb-5 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="callType"
              value="onboarding"
              checked={callType === "onboarding"}
              onChange={() => setCallType("onboarding")}
              disabled={loading}
            />
            <span>Onboarding (40 mins)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="callType"
              value="followup"
              checked={callType === "followup"}
              onChange={() => setCallType("followup")}
              disabled={loading}
            />
            <span>Follow-up (20 mins)</span>
          </label>
          <span className="text-[12px] text-blue-700 ml-6 underline relative top-[-17px]">
            Repeats weekly on {followupDay}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 flex-1 hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleBooking}
            className={`px-4 py-2 bg-blue-600 text-white rounded flex-1 hover:bg-blue-700 transition ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
            disabled={loading}
          >
            {loading ? "Booking..." : "Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
