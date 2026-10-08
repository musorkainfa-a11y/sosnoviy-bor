import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { CalendarDays, Users, MapPin, ArrowRight, ArrowLeft, CheckCircle, User, Phone, Mail } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

const Booking = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { data: locations } = useLocations();
  
  // Form step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  
  // Step 1 fields - changed to date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined
  });
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  
  // Step 2 fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleStep1Continue = () => {
    if (!dateRange?.from || !dateRange?.to || !location || !guests) {
      toast.error("Пожалуйста, заполните все поля, включая даты заезда и выезда");
      return;
    }
    setDirection(1);
    setStep(2);
  };

  const handleStep2Back = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = () => {
    if (!name || !phone || !email) {
      toast.error("Пожалуйста, заполните контактные данные");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Введите корректный email");
      return;
    }
    
    setDirection(1);
    setStep(3);
  };

  const handleReset = () => {
    setDirection(-1);
    setStep(1);
    setDateRange({ from: new Date(), to: undefined });
    setLocation("");
    setGuests("");
    setName("");
    setPhone("");
    setEmail("");
  };

  const getLocationLabel = (value: string) => {
    const loc = (locations ?? []).find(l => l.id === value);
    return loc?.name || value;
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "";
    if (!dateRange?.to) return format(dateRange.from, "d MMM yyyy", { locale: ru });
    return `${format(dateRange.from, "d MMM", { locale: ru })} — ${format(dateRange.to, "d MMM yyyy", { locale: ru })}`;
  };

  return (
    <section id="booking" className="py-32 lg:py-40 bg-accent/20" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4 block">
            Бронирование
          </span>
          <h2 className="text-2xl md:text-3xl font-light mb-4 text-foreground tracking-tight">
            Забронируйте свой побег с города
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto font-light">
            Выберите даты — а природа сделает остальное
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8 lg:p-10 shadow-soft border border-border bg-card overflow-hidden">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-primary/50" : "w-4 bg-border"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="location" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <MapPin className="h-3 w-3" />
                          Локация
                        </Label>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger id="location" className="rounded-md text-sm font-light">
                            <SelectValue placeholder="Выберите локацию" />
                          </SelectTrigger>
                          <SelectContent>
                            {(locations ?? []).map((loc) => (
                              <SelectItem key={loc.id} value={loc.id}>
                                {loc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="guests" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                          <Users className="h-3 w-3" />
                          Гостей
                        </Label>
                        <Select value={guests} onValueChange={setGuests}>
                          <SelectTrigger id="guests" className="rounded-md text-sm font-light">
                            <SelectValue placeholder="Выберите количество гостей" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 гость</SelectItem>
                            <SelectItem value="2">2 гостя</SelectItem>
                            <SelectItem value="3">3 гостя</SelectItem>
                            <SelectItem value="4">4 гостя</SelectItem>
                            <SelectItem value="5">5+ гостей</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4">
                        <Button
                          size="default"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                          onClick={handleStep1Continue}
                        >
                          Далее
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <CalendarDays className="h-3 w-3" />
                        Заезд и выезд
                      </Label>
                      <Calendar
                        mode="range"
                        locale={ru}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        className="rounded-md border-border shadow-soft text-sm pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                      {dateRange?.from && dateRange?.to && (
                        <p className="text-xs text-muted-foreground font-light mt-2 text-center">
                          {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} ноч. выбрано
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="space-y-6 max-w-md mx-auto">
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <User className="h-3 w-3" />
                        Имя и фамилия
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Иван Иванов"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <Phone className="h-3 w-3" />
                        Телефон
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+7 900 000-00-00"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-md text-sm font-light"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-1.5 mb-3 text-card-foreground text-[11px] uppercase tracking-wider font-normal">
                        <Mail className="h-3 w-3" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ivan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-md text-sm font-light"
                      />
                    </div>


                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        size="default"
                        className="flex-1 rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                        onClick={handleStep2Back}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Назад
                      </Button>
                      <Button
                        size="default"
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal"
                        onClick={handleSubmit}
                      >
                        Отправить заявку
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="text-center py-8 space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-light text-foreground">Бронирование подтверждено</h3>
                      <p className="text-sm text-muted-foreground font-light">
                        Спасибо, {name}! Ваша заявка отправлена.
                      </p>
                    </div>

                    <div className="bg-accent/30 rounded-md p-4 max-w-sm mx-auto text-left space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Детали бронирования</p>
                      <div className="text-sm font-light text-foreground space-y-1">
                        <p><span className="text-muted-foreground">Локация:</span> {getLocationLabel(location)}</p>
                        <p><span className="text-muted-foreground">Даты:</span> {formatDateRange()}</p>
                        <p><span className="text-muted-foreground">Гостей:</span> {guests}</p>
                        <p><span className="text-muted-foreground">Email:</span> {email}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-light">
                      Письмо с подтверждением придёт на {email}
                    </p>

                    <Button
                      variant="outline"
                      size="default"
                      className="rounded-md smooth-hover text-[11px] uppercase tracking-wider font-normal mt-4"
                      onClick={handleReset}
                    >
                      Забронировать ещё
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Booking;
