import { collection, query, where, doc, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import db from "../firebase";
import { format } from "date-fns";

export type Client = {
    name: string;
    phone: string;
};

export type Booking = {
    time: string;
    client: Client; // now an object
};

export const isSlotTaken = async (date: string, time: string): Promise<boolean> => {
    const q = query(
        collection(db, "bookings"),
        where("date", "==", date),
        where("time", "==", time)
    );
    const snap = await getDocs(q);
    return !snap.empty;
};

export const addBooking = async (data: any): Promise<void> => {
    await addDoc(collection(db, "bookings"), data);
};

export async function fetchBookingsByDate(dateToFetch: Date) {
    const formattedDate = format(dateToFetch, "yyyy-MM-dd");
    const todayDayName = format(dateToFetch, "EEEE");

    const snapshot = await getDocs(collection(db, "bookings"));
    let onboarding: Booking[] = [];
    let followup: Booking[] = [];

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const { type, date, time, followupDay, client } = data;

        if (type === "onboarding" && date === formattedDate) {
            onboarding.push({ time, client }); // client is an object
        }

        if (
            type === "followup" &&
            followupDay === todayDayName &&
            new Date(date) <= dateToFetch
        ) {
            followup.push({ time, client });
        }
    });

    return { onboarding, followup };
}

export async function deleteBooking(
    date: Date,
    time: string,
    type: "onboarding" | "followup"
) {
    const formattedDate = format(date, "yyyy-MM-dd");
    const todayDayName = format(date, "EEEE");

    const conditions = [
        where("date", "==", formattedDate),
        where("time", "==", time),
        where("type", "==", type),
    ];

    if (type === "followup") {
        conditions.push(where("followupDay", "==", todayDayName));
    }

    const q = query(collection(db, "bookings"), ...conditions);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error("Booking not found");
    }

    const batchDeletes = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "bookings", docSnap.id))
    );

    await Promise.all(batchDeletes);
}
