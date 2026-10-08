import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLocations } from "@/hooks/useLocations";
import {
  useBookings,
  statusLabels,
  toDateString,
  nights,
  type Booking,
  type BookingStatus,
} from "@/hooks/useBookings";

const DAYS = 30;
const DAY_WIDTH = 44;

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-primary text-primary-foreground",
  pending: "bg-yellow-500/85 text-white",
  cancelled: "bg-muted text-muted-foreground line-through",
};

interface FormState {
  id: string | null;
  locationId: string;
  guestName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: BookingStatus;
  note: string;
}

const BookingsTimeline = ({ canEdit }: { canEdit: boolean }) => {
  const { data: locations } = useLocations();
  const { data: bookings, isLoading } = useBookings();
  const queryClient = useQueryClient();

  const [rangeStart, setRangeStart] = useState(() => startOfDay(new Date()));
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const days = useMemo(
    () => Array.from({ length: DAYS }, (_, i) => addDays(rangeStart, i)),
    [rangeStart]
  );
  const rangeEnd = addDays(rangeStart, DAYS);

  const openEdit = (booking: Booking) => {
    setForm({
      id: booking.id,
      locationId: booking.locationId,
      guestName: booking.guestName,
      email: booking.email,
      phone: booking.phone,
      checkIn: toDateString(booking.checkIn),
      checkOut: toDateString(booking.checkOut),
      guests: booking.guests,
      status: booking.status,
      note: booking.note,
    });
  };

  const openCreate = (locationId?: string, day?: Date) => {
    const start = day ?? rangeStart;
    setForm({
      id: null,
      locationId: locationId ?? locations?.[0]?.id ?? "",
      guestName: "",
      email: "",
      phone: "",
      checkIn: toDateString(start),
      checkOut: toDateString(addDays(start, 2)),
      guests: 2,
      status: "pending",
      note: "",
    });
  };

  const save = async () => {
    if (!form) return;
    if (!form.locationId) {
      toast.error("Выберите локацию");
      return;
    }
    if (form.checkOut <= form.checkIn) {
      toast.error("Дата выезда должна быть позже заезда");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        location_id: form.locationId,
        guest_name: form.guestName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        check_in: form.checkIn,
        check_out: form.checkOut,
        guests: Number(form.guests) || 1,
        status: form.status,
        note: form.note.trim(),
      };
      const { error } = form.id
        ? await supabase.from("bookings").update(payload).eq("id", form.id)
        : await supabase.from("bookings").insert(payload);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(form.id ? "Бронь обновлена" : "Бронь добавлена");
      setForm(null);
    } catch (e: any) {
      toast.error(`Не удалось сохранить: ${e.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", form.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Бронь удалена");
      setForm(null);
    } catch (e: any) {
      toast.error(`Не удалось удалить: ${e.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const barGeometry = (booking: Booking) => {
    const startIndex = Math.max(
      0,
      Math.round((booking.checkIn.getTime() - rangeStart.getTime()) / 86400000)
    );
    const endIndex = Math.min(
      DAYS,
      Math.round((booking.checkOut.getTime() - rangeStart.getTime()) / 86400000)
    );
    return { left: startIndex * DAY_WIDTH, width: Math.max(1, endIndex - startIndex) * DAY_WIDTH };
  };

  const visibleBookings = (locationId: string) =>
    (bookings ?? []).filter(
      (b) => b.locationId === locationId && b.checkOut > rangeStart && b.checkIn < rangeEnd
    );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRangeStart(addDays(rangeStart, -14))}
            className="text-[11px] uppercase tracking-wider font-normal"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-xs font-light text-muted-foreground min-w-[190px] text-center">
            {format(rangeStart, "d MMM yyyy", { locale: ru })} —{" "}
            {format(addDays(rangeStart, DAYS - 1), "d MMM yyyy", { locale: ru })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRangeStart(addDays(rangeStart, 14))}
            className="text-[11px] uppercase tracking-wider font-normal"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRangeStart(startOfDay(new Date()))}
            className="text-[11px] uppercase tracking-wider font-normal"
          >
            Сегодня
          </Button>
        </div>

        <Button
          size="sm"
          disabled={!canEdit}
          onClick={() => openCreate()}
          className="rounded-full text-[11px] uppercase tracking-wider font-normal"
        >
          <Plus className="mr-2 h-3 w-3" />
          Добавить бронь
        </Button>
      </div>

      <p className="text-xs text-muted-foreground font-light mb-4">
        {canEdit
          ? "Нажмите на полосу брони, чтобы изменить даты, гостя или статус. Клик по пустой клетке создаёт новую бронь."
          : "Просмотр: изменять брони может только администратор"}
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground font-light">Загрузка...</p>
      ) : (
        <Card className="border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 200 + DAYS * DAY_WIDTH }}>
              {/* Шкала дней */}
              <div className="flex border-b border-border bg-secondary/30">
                <div className="w-[200px] shrink-0 px-4 py-3">
                  <span className="text-[11px] uppercase tracking-wider font-normal">Локация</span>
                </div>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    style={{ width: DAY_WIDTH }}
                    className={`shrink-0 text-center py-3 border-l border-border ${
                      isSameDay(day, new Date()) ? "bg-primary/10" : ""
                    }`}
                  >
                    <p className="text-[10px] uppercase text-muted-foreground font-light">
                      {format(day, "EEEEEE", { locale: ru })}
                    </p>
                    <p className="text-xs font-light">{format(day, "d")}</p>
                  </div>
                ))}
              </div>

              {/* Строки локаций */}
              {(locations ?? []).map((loc) => (
                <div key={loc.id} className="flex border-b border-border last:border-b-0">
                  <div className="w-[200px] shrink-0 px-4 py-4">
                    <p className="text-sm font-normal truncate">{loc.name}</p>
                    <p className="text-xs text-muted-foreground font-light truncate">{loc.location}</p>
                  </div>
                  <div className="relative flex" style={{ height: 64 }}>
                    {days.map((day) => (
                      <button
                        key={day.toISOString()}
                        style={{ width: DAY_WIDTH }}
                        disabled={!canEdit}
                        onClick={() => openCreate(loc.id, day)}
                        className={`shrink-0 h-full border-l border-border transition-colors ${
                          canEdit ? "hover:bg-secondary/50" : ""
                        } ${isSameDay(day, new Date()) ? "bg-primary/5" : ""}`}
                        aria-label={`Новая бронь ${loc.name} ${format(day, "d MMMM", { locale: ru })}`}
                      />
                    ))}

                    {visibleBookings(loc.id).map((booking) => {
                      const geo = barGeometry(booking);
                      return (
                        <button
                          key={booking.id}
                          onClick={() => canEdit && openEdit(booking)}
                          style={{ left: geo.left + 2, width: geo.width - 4 }}
                          className={`absolute top-3 h-10 rounded-full px-3 text-left text-xs font-light truncate shadow-soft ${
                            statusStyles[booking.status]
                          } ${canEdit ? "hover:opacity-90" : "cursor-default"}`}
                          title={`${booking.guestName} · ${nights(booking)} ноч. · ${
                            statusLabels[booking.status]
                          }`}
                        >
                          {booking.guestName || "Без имени"} · {booking.guests} гост.
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-light">
              {form?.id ? "Редактирование брони" : "Новая бронь"}
            </DialogTitle>
          </DialogHeader>

          {form && (
            <div className="space-y-5">
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Локация</Label>
                <Select
                  value={form.locationId}
                  onValueChange={(v) => setForm({ ...form, locationId: v })}
                >
                  <SelectTrigger className="mt-2 text-sm font-light">
                    <SelectValue placeholder="Выберите локацию" />
                  </SelectTrigger>
                  <SelectContent>
                    {(locations ?? []).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id} className="text-sm font-light">
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Заезд</Label>
                  <Input
                    type="date"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    className="mt-2 text-sm font-light"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Выезд</Label>
                  <Input
                    type="date"
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    className="mt-2 text-sm font-light"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Гость</Label>
                <Input
                  value={form.guestName}
                  onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                  className="mt-2 text-sm font-light"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Почта</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 text-sm font-light"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Телефон</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-2 text-sm font-light"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Гостей</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                    className="mt-2 text-sm font-light"
                  />
                </div>
                <div>
                  <Label className="text-[11px] uppercase tracking-wider font-normal">Статус</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as BookingStatus })}
                  >
                    <SelectTrigger className="mt-2 text-sm font-light">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(statusLabels) as BookingStatus[]).map((s) => (
                        <SelectItem key={s} value={s} className="text-sm font-light">
                          {statusLabels[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Заметка</Label>
                <Textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="mt-2 text-sm font-light"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {form?.id && (
              <Button
                variant="ghost"
                disabled={!canEdit || saving}
                onClick={remove}
                className="text-destructive hover:text-destructive mr-auto text-[11px] uppercase tracking-wider font-normal"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Удалить
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setForm(null)}
              className="text-[11px] uppercase tracking-wider font-normal"
            >
              Отмена
            </Button>
            <Button
              disabled={!canEdit || saving}
              onClick={save}
              className="text-[11px] uppercase tracking-wider font-normal"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsTimeline;
