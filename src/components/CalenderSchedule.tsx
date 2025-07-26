"use client";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { FiClock, FiTrash } from "react-icons/fi";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import BookingModal from "./BookingModal";
import CardSkeleton from "./CardSkeleton";
import logo from "../assets/healthtick_logo.jpeg";
import db from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { initialSlots } from "../data";

const statusStyles = {
  Available: "bg-green-50 border-green-200 text-green-600",
  "Follow-up": "bg-blue-50 border-blue-200 text-blue-600",
  Onboarding: "bg-purple-50 border-purple-200 text-purple-600",
};

type Booking = {
  time: string;
  client: string; // e.g. "Sneha Joshi (9123901234)"
};

export default function CalendarSchedule() {
  const [date, setDate] = useState(new Date());
  const [onboardingSlots, setOnboardingSlots] = useState<Booking[]>([]);
  const [followUpSlots, setFollowUpSlots] = useState<Booking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Confirmation modal state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteDetails, setDeleteDetails] = useState<{
    time: string;
    type: "onboarding" | "followup";
  } | null>(null);

  const goToPrevDay = () => setDate(subDays(date, 1));
  const goToNextDay = () => setDate(addDays(date, 1));

  // Helper to convert "1:10 PM" to a Date object on an arbitrary date
  const parseTimeString = (timeStr: string) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const fetchDaySlots = async (dateToFetch: Date) => {
    setLoading(true);
    const formattedDate = format(dateToFetch, "yyyy-MM-dd");
    const todayDayName = format(dateToFetch, "EEEE");

    setOnboardingSlots([]);
    setFollowUpSlots([]);

    try {
      const snapshot = await getDocs(collection(db, "bookings"));
      let onboarding: Booking[] = [];
      let followup: Booking[] = [];

      snapshot.forEach((docSnap) => {
        const { type, date, time, followupDay, client } = docSnap.data();

        if (type === "onboarding" && date === formattedDate) {
          onboarding.push({ time, client });
        }

        if (
          type === "followup" &&
          followupDay === todayDayName &&
          new Date(date) <= dateToFetch
        ) {
          followup.push({ time, client });
        }
      });

      onboarding.sort(
        (a, b) => parseTimeString(a.time).getTime() - parseTimeString(b.time).getTime()
      );
      followup.sort(
        (a, b) => parseTimeString(a.time).getTime() - parseTimeString(b.time).getTime()
      );

      setOnboardingSlots(onboarding);
      setFollowUpSlots(followup);
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaySlots(date);
  }, [date]);

  const handleBookClick = (time: string) => {
    setSelectedTime(time);
    setShowBookingModal(true);
  };

  // Show confirmation modal
  const showDeleteConfirm = (
    time: string,
    type: "onboarding" | "followup"
  ) => {
    setDeleteDetails({ time, type });
    setConfirmDeleteOpen(true);
  };

  // Handle deletion after confirmation
  const handleDeleteBooking = async () => {
    if (!deleteDetails) return;
    const { time, type } = deleteDetails;

    setConfirmDeleteOpen(false);
    const formattedDate = format(date, "yyyy-MM-dd");
    const todayDayName = format(date, "EEEE");

    try {
      const q = query(
        collection(db, "bookings"),
        where("date", "==", formattedDate),
        where("time", "==", time),
        where("type", "==", type),
        ...(type === "followup" ? [where("followupDay", "==", todayDayName)] : [])
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Booking not found.");
        return;
      }

      const batchDeletes = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "bookings", docSnap.id))
      );
      await Promise.all(batchDeletes);

      alert("Booking deleted successfully.");
      fetchDaySlots(date);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    }
  };

  // Inline Confirmation Modal component
  function ConfirmModal({
    isOpen,
    bookingType,
    time,
    onConfirm,
    onCancel,
  }: {
    isOpen: boolean;
    bookingType: string;
    time: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    if (!isOpen) return null;
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        onClick={onCancel}
      >
        <div
          className="bg-white rounded-lg p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold mb-4 text-center">Delete Booking</h3>
          <p className="text-md font-semibold">Are you sure you want to delete?</p>
          <p className="mt-3 ml-3">
            Booking Type: {bookingType === 'onboarding' ? 'Onboarding' : 'Follow-Up'}
          </p>
          <p className="mt-1 mb-6 ml-3">Time Slot: {time}</p>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 flex-1 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 flex-1 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableSlots = initialSlots.filter((slot, index) => {
    if (followUpSlots.some((b) => b.time === slot)) return false;
    if (onboardingSlots.some((b) => b.time === slot)) return false;
    if (index > 0 && onboardingSlots.some((b) => b.time === initialSlots[index - 1]))
      return false;
    return true;
  });

  // Helper to split client string into name and phone
  const splitClient = (client: string) => {
    const name = client.split("(")[0].trim();
    const phoneMatch = client.match(/\((\d{10})\)/);
    const phone = phoneMatch ? phoneMatch[1] : "";
    return { name, phone };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showBookingModal && (
        <BookingModal
          selectedDate={date}
          selectedTime={selectedTime}
          setShowBookingModal={setShowBookingModal}
          onClose={() => setShowBookingModal(false)}
          onBook={() => fetchDaySlots(date)}
          fetchDaySlots={() => fetchDaySlots(date)}
        />
      )}

      <div className="flex items-center gap-5 sm:gap-10 mb-6">
        <img src={logo} alt="HealthTick" className="w-[40px] sm:w-[50px] rounded-full" />
        <p className="text-[20px] text-green-800">
          Health Coach Scheduling System
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between mb-4">
        <button onClick={goToPrevDay} className="text-xl font-bold">
          <FaAngleLeft className="cursor-pointer" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            {format(date, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>
        <button onClick={goToNextDay} className="text-xl font-bold">
          <FaAngleRight className="cursor-pointer" />
        </button>
      </div>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          Onboarding Slots (40 mins)
        </h3>
        {loading ? (
          <CardSkeleton length={2} />
        ) : onboardingSlots.length === 0 ? (
          <p className="text-gray-500 text-center">
            No onboarding slots booked.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 relative">
            {onboardingSlots.map(({ time, client }) => {
              const { name, phone } = splitClient(client);
              return (
                <div
                  key={time}
                  className={`border rounded-lg p-3 ${statusStyles.Onboarding} relative`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock />
                    {time}
                  </div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm font-medium">{phone}</p>
                  <button
                    onClick={() => showDeleteConfirm(time, "onboarding")}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title={`Delete onboarding booking at ${time}`}
                    aria-label={`Delete onboarding booking at ${time}`}
                  >
                    <FiTrash size={18} className="cursor-pointer" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          Follow-up Slots (20 mins)
        </h3>
        {loading ? (
          <CardSkeleton length={2} />
        ) : followUpSlots.length === 0 ? (
          <p className="text-gray-500 text-center">No follow-up slots booked.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 relative">
            {followUpSlots.map(({ time, client }) => {
              const { name, phone } = splitClient(client);
              return (
                <div
                  key={time}
                  className={`border rounded-lg p-3 ${statusStyles["Follow-up"]} relative`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <FiClock />
                    {time}
                  </div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm font-medium">{phone}</p>
                  <button
                    onClick={() => showDeleteConfirm(time, "followup")}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    title={`Delete follow-up booking at ${time}`}
                    aria-label={`Delete follow-up booking at ${time}`}
                  >
                    <FiTrash size={18} className="cursor-pointer" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Available Slots</h3>
        {loading ? (
          <CardSkeleton length={8} />
        ) : availableSlots.length === 0 ? (
          <p className="text-gray-500">No available slots left.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {availableSlots.map((time) => (
              <div
                key={time}
                className={`border rounded-lg p-3 cursor-pointer hover:shadow-md ${statusStyles.Available}`}
                onClick={() => handleBookClick(time)}
              >
                <div className="flex items-center gap-2 text-sm">
                  <FiClock />
                  {time}
                </div>
                <p className="font-semibold mt-1">Available</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        bookingType={deleteDetails?.type || ""}
        time={deleteDetails?.time || ""}
        onConfirm={handleDeleteBooking}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
