# HealthTick Booking Calendar

A React + TypeScript + Vite app for managing health coach call bookings.

---

## How to Run the App

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure Firebase:**
   - Update the `.env` file with your Firebase project credentials.

3. **Start the development server:**
   ```sh
   npm run dev
   ```

4. **Build for production:**
   ```sh
   npm run build
   ```

5. **Preview production build:**
   ```sh
   npm run preview
   ```

---

## Firebase Schema Description

The app uses a single Firestore collection: `bookings`.

### Collection: `bookings`

Each document represents a booked slot and has the following fields:

| Field         | Type     | Description                                                                 |
|---------------|----------|-----------------------------------------------------------------------------|
| `client`      | string   | Client name and phone, e.g. `"Sneha Joshi (9123901234)"`                    |
| `type`        | string   | `"onboarding"` or `"followup"`                                              |
| `time`        | string   | Time slot, e.g. `"10:30 AM"`                                                |
| `date`        | string   | Date in `"yyyy-MM-dd"` format                                               |
| `createdAt`   | string   | ISO timestamp when the booking was created                                  |
| `followupDay` | string   | (Only for follow-up) Day of week, e.g. `"Monday"`                           |

- **Onboarding bookings**: Only for the selected date.
- **Follow-up bookings**: Repeat weekly on the same weekday (`followupDay`).

---

## Assumptions Made

- **Clients** are pre-defined in [`src/data.ts`](src/data.ts) and not managed via Firebase.
- **Time slots** are fixed and listed in [`initialSlots`](src/data.ts).
- **Follow-up calls** repeat weekly on the same weekday as the original booking.
- **Onboarding calls** are 40 minutes; **follow-up calls** are 20 minutes.
- Only one booking per slot per day is allowed.
- Deleting a booking removes it only for the selected day (not future repeats).
- No authentication is implemented; all users can book and delete slots.
