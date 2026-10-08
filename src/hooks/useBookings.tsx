import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  locationId: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status: BookingStatus;
  note: string;
}

export const statusLabels: Record<BookingStatus, string> = {
  confirmed: "Подтверждено",
  pending: "В ожидании",
  cancelled: "Отменено",
};

const parseDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export const fetchBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("check_in", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    locationId: row.location_id,
    guestName: row.guest_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    checkIn: parseDate(row.check_in),
    checkOut: parseDate(row.check_out),
    guests: row.guests ?? 1,
    status: (row.status as BookingStatus) ?? "pending",
    note: row.note ?? "",
  }));
};

export const useBookings = () =>
  useQuery({ queryKey: ["bookings"], queryFn: fetchBookings });

export const nights = (booking: Pick<Booking, "checkIn" | "checkOut">) =>
  Math.max(
    1,
    Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86400000)
  );

export const getBookingStats = (bookings: Booking[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    upcoming: bookings.filter((b) => b.checkIn >= today && b.status !== "cancelled").length,
  };
};
