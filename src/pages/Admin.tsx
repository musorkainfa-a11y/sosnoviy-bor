import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, Users, DollarSign, MapPin, Mail, Phone, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import LocationsManager from "@/components/admin/LocationsManager";
import SiteImagesManager from "@/components/admin/SiteImagesManager";
import BookingsTimeline from "@/components/admin/BookingsTimeline";
import { formatRub } from "@/data/locations";
import { useLocations } from "@/hooks/useLocations";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useBookings, getBookingStats, statusLabels, nights } from "@/hooks/useBookings";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: locations } = useLocations();
  const { data: bookings } = useBookings();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const allBookings = bookings ?? [];
  const stats = getBookingStats(allBookings);
  const canEdit = !!isAdmin;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-light">Загрузка...</p>
      </div>
    );
  }

  const getLocationById = (id: string) => (locations ?? []).find((l) => l.id === id);

  const filteredBookings = selectedLocation === "all"
    ? allBookings
    : allBookings.filter(b => b.locationId === selectedLocation);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const calculateRevenue = () => {
    return filteredBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((total, booking) => {
        const location = getLocationById(booking.locationId);
        if (!location) return total;
        return total + location.price * nights(booking);
      }, 0);
  };

  const tabClass =
    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-xs font-light border border-border";

  return (
    <div className="min-h-screen bg-background">
      <Navigation variant="dark" />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-[11px] uppercase tracking-wider font-normal"
              >
                <ArrowLeft className="mr-2 h-3 w-3" />
                На главную
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-[11px] uppercase tracking-wider font-normal text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-3 w-3" />
                Выйти
              </Button>
            </div>

            <h1 className="text-3xl md:text-4xl font-light mb-3 tracking-tight">
              Панель администратора
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              Управляйте бронированиями, локациями и фотографиями сайта
            </p>
          </motion.div>

          <Tabs defaultValue="bookings">
            <TabsList className="mb-8 flex-wrap h-auto gap-2 bg-transparent p-0">
              <TabsTrigger value="bookings" className={tabClass}>
                Бронирования
              </TabsTrigger>
              <TabsTrigger value="timeline" className={tabClass}>
                Таймлайн
              </TabsTrigger>
              <TabsTrigger value="locations" className={tabClass}>
                Локации
              </TabsTrigger>
              <TabsTrigger value="photos" className={tabClass}>
                Фото сайта
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-0">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
              >
                <Card className="p-6 border border-border shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-light mb-1">{stats.total}</p>
                  <p className="text-xs text-muted-foreground font-light">Всего бронирований</p>
                </Card>

                <Card className="p-6 border border-border shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-light mb-1">{stats.upcoming}</p>
                  <p className="text-xs text-muted-foreground font-light">Предстоящие</p>
                </Card>

                <Card className="p-6 border border-border shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-light mb-1">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground font-light">В ожидании</p>
                </Card>

                <Card className="p-6 border border-border shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-light mb-1">{formatRub(calculateRevenue())}</p>
                  <p className="text-xs text-muted-foreground font-light">Ожидаемый доход</p>
                </Card>
              </motion.div>

              {/* Location Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Tabs defaultValue="all" onValueChange={setSelectedLocation}>
                  <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-transparent p-0">
                    <TabsTrigger value="all" className={tabClass}>
                      Все локации
                    </TabsTrigger>
                    {(locations ?? []).map((loc) => (
                      <TabsTrigger key={loc.id} value={loc.id} className={tabClass}>
                        {loc.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value={selectedLocation} className="mt-0">
                    <Card className="border border-border shadow-soft overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border">
                              <TableHead className="text-[11px] uppercase tracking-wider font-normal">Гость</TableHead>
                              <TableHead className="text-[11px] uppercase tracking-wider font-normal">Локация</TableHead>
                              <TableHead className="text-[11px] uppercase tracking-wider font-normal">Даты</TableHead>
                              <TableHead className="text-[11px] uppercase tracking-wider font-normal">Гостей</TableHead>
                              <TableHead className="text-[11px] uppercase tracking-wider font-normal">Статус</TableHead>
                              <TableHead className="text-[11px] uppercase tracking-wider font-normal">Контакты</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBookings.map((booking) => {
                              const location = getLocationById(booking.locationId);
                              return (
                                <TableRow key={booking.id} className="border-border">
                                  <TableCell>
                                    <div>
                                      <p className="text-sm font-normal">{booking.guestName}</p>
                                      <p className="text-xs text-muted-foreground font-light">
                                        {booking.id.slice(0, 8)}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm font-light">{location?.name || booking.locationId}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm font-light">
                                      <p>{format(booking.checkIn, "d MMM", { locale: ru })} — {format(booking.checkOut, "d MMM yyyy", { locale: ru })}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {nights(booking)} ноч.
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm font-light">{booking.guests}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs font-light capitalize ${getStatusColor(booking.status)}`}
                                    >
                                      {statusLabels[booking.status]}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <a
                                        href={`mailto:${booking.email}`}
                                        className="text-xs text-muted-foreground hover:text-primary font-light flex items-center gap-1"
                                      >
                                        <Mail className="h-3 w-3" />
                                        {booking.email}
                                      </a>
                                      <a
                                        href={`tel:${booking.phone}`}
                                        className="text-xs text-muted-foreground hover:text-primary font-light flex items-center gap-1"
                                      >
                                        <Phone className="h-3 w-3" />
                                        {booking.phone}
                                      </a>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {filteredBookings.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-sm text-muted-foreground font-light">Бронирований для этой локации нет</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-0">
              <BookingsTimeline canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="locations" className="mt-0">
              <LocationsManager canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="photos" className="mt-0">
              <SiteImagesManager canEdit={canEdit} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
