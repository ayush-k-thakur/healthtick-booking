"use client";
import { useEffect, useState } from "react";
import db from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { format } from "date-fns";
import { clients } from "../data"; // adjust path if needed

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
  const [filteredClients, setFilteredClients] = useState(clients);
  const [client, setClient] = useState("");
  const [callType, setCallType] = useState<"onboarding" | "followup">("followup");
  const [loading, setLoading] = useState(false);

  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const followupDay = format(selectedDate, "EEEE");

  useEffect(() => {
    const lower = clientQuery.toLowerCase();
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) || c.number.includes(lower)
    );
    setFilteredClients(filtered);
  }, [clientQuery]);

  const isSlotTaken = async () => {
    const q = query(
      collection(db, "bookings"),
      where("date", "==", formattedDate),
      where("time", "==", selectedTime)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const handleBooking = async () => {
    if (!client) return alert("Please select a client");

    setLoading(true);

    const taken = await isSlotTaken();
    if (taken) {
      alert("This slot is already booked.");
      setLoading(false);
      return;
    }

    const bookingData = {
      client,
      type: callType,
      time: selectedTime,
      date: formattedDate,
      createdAt: new Date().toISOString(),
      ...(callType === "followup" && { followupDay }),
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      onBook();
      fetchDaySlots();
      setShowBookingModal(false);
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Something went wrong while booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <button
          onClick={() => setShowBookingModal(false)}
          className="absolute top-3 right-3 text-xl"
          disabled={loading}
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-4">Book New Call</h2>

        <div className="mb-4 text-sm bg-blue-100 p-2 rounded text-blue-700">
          📅 {formattedDate} at {selectedTime}
        </div>

        <label className="text-sm font-medium mb-1 block">Search Client (by name or number)</label>
        <input
          type="text"
          value={clientQuery}
          onChange={(e) => setClientQuery(e.target.value)}
          placeholder="Start typing name or number..."
          className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
          disabled={loading}
        />

        {!client && clientQuery.length > 0 && (
          <div className="w-[90%] h-40 overflow-y-auto border border-gray-200 rounded mb-5 absolute z-10 bg-white shadow-lg">
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <div
                  key={c.number}
                  onClick={() => {
                    setClient(`${c.name} (${c.number})`);
                    setClientQuery(`${c.name}`);
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {c.name} - {c.number}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">No match found</div>
            )}
          </div>
        )}

        {client && (
          <div className="mb-5 text-sm text-green-700 bg-green-100 px-3 py-2 rounded flex justify-between items-center">
            <span>Selected: {client}</span>
            <button
              onClick={() => {
                setClient("");
                setClientQuery("");
              }}
              className="text-red-500 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        <label className="text-sm font-medium mb-2 block">Call Type</label>
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-2">
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
          <label className="flex items-center gap-2">
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
          <span className="text-[13px] text-blue-700 relative top-[-15px] left-[20px] underline">
            repeats weekly on {followupDay}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 flex-1 hover:bg-gray-100 transition-colors cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleBooking}
            className={`px-4 py-2 bg-blue-600 text-white rounded flex-1 hover:bg-blue-700 transition-colors ${
              loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
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
