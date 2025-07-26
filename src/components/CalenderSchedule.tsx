"use client";
import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";
import BookingModal from "./BookingModal";
import CardSkeleton from "./CardSkeleton";
import logo from "../assets/healthtick_logo.jpeg";
import DeleteModal from "./DeleteModal";
import BookingCard from "./BookingCard";
import { fetchBookingsByDate, deleteBooking } from "../services/bookingServices";
import type { Booking } from "../services/bookingServices";
import { initialSlots } from "../data";
import { toast } from "react-toastify";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

export default function CalendarSchedule() {
  const [date, setDate] = useState(new Date());
  const [onboardingSlots, setOnboardingSlots] = useState<Booking[]>([]);
  const [followUpSlots, setFollowUpSlots] = useState<Booking[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteDetails, setDeleteDetails] = useState<{ time: string; type: "onboarding" | "followup"; } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const goToPrevDay = () => setDate(subDays(date, 1));
  const goToNextDay = () => setDate(addDays(date, 1));

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
    try {
      const { onboarding, followup } = await fetchBookingsByDate(dateToFetch);

      onboarding.sort((a, b) => parseTimeString(a.time).getTime() - parseTimeString(b.time).getTime());
      followup.sort((a, b) => parseTimeString(a.time).getTime() - parseTimeString(b.time).getTime());

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

  const showDeleteConfirm = (time: string, type: "onboarding" | "followup") => {
    setDeleteDetails({ time, type });
    setConfirmDeleteOpen(true);
  };

  const handleDeleteBooking = async () => {
    if (!deleteDetails) return;

    setIsDeleting(true);
    try {
      await deleteBooking(date, deleteDetails.time, deleteDetails.type);
      toast("Booking deleted successfully.");
      fetchDaySlots(date);
      setConfirmDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const availableSlots = initialSlots.filter((slot, index) => {
    if (followUpSlots.some((b) => b.time === slot)) return false;
    if (onboardingSlots.some((b) => b.time === slot)) return false;
    if (index > 0 && onboardingSlots.some((b) => b.time === initialSlots[index - 1])) return false;
    return true;
  });

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
        <p className="text-[20px] text-green-800">Health Coach Scheduling System</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between mb-4">
        <button onClick={goToPrevDay} className="text-xl font-bold" aria-label="Previous Day">
          <FaAngleLeft className="cursor-pointer" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</h2>
        </div>
        <button onClick={goToNextDay} className="text-xl font-bold" aria-label="Next Day">
          <FaAngleRight className="cursor-pointer" />
        </button>
      </div>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Onboarding Slots (40 mins)</h3>
        {loading ? (
          <CardSkeleton length={2} />
        ) : onboardingSlots.length === 0 ? (
          <p className="text-gray-500 text-center">No onboarding slots booked.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 relative">
            {onboardingSlots.map(({ time, client }) => (
              <BookingCard
                key={time}
                time={time}
                client={client}
                type="onboarding"
                onDelete={showDeleteConfirm}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Follow-up Slots (20 mins)</h3>
        {loading ? (
          <CardSkeleton length={2} />
        ) : followUpSlots.length === 0 ? (
          <p className="text-gray-500 text-center">No follow-up slots booked.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 relative">
            {followUpSlots.map(({ time, client }) => (
              <BookingCard
                key={time}
                time={time}
                client={client}
                type="followup"
                onDelete={showDeleteConfirm}
              />
            ))}
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
              <BookingCard key={time} time={time} client="" type="available" onBook={handleBookClick} />
            ))}
          </div>
        )}
      </section>

      <DeleteModal
        isOpen={confirmDeleteOpen}
        bookingType={deleteDetails?.type || ""}
        time={deleteDetails?.time || ""}
        onConfirm={handleDeleteBooking}
        onCancel={() => setConfirmDeleteOpen(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
