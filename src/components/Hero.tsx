import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TreePine } from "lucide-react";
import heroImage from "@/assets/hero-camping.jpg";
import forestImage from "@/assets/spot-forest.jpg";
import lakeImage from "@/assets/spot-lake.jpg";
import meadowImage from "@/assets/spot-meadow.jpg";
import { useSiteImage } from "@/hooks/useSiteImages";

const slideDefaults = [
  { key: "hero-1", image: heroImage, alt: "Автономный кемпинг на природе" },
  { key: "hero-2", image: forestImage, alt: "Лесная стоянка" },
  { key: "hero-3", image: lakeImage, alt: "Убежище у озера" },
  { key: "hero-4", image: meadowImage, alt: "Кемпинг на лугу" },
];

const SLIDE_DURATION = 5000;

const Hero = () => {
  const slide1 = useSiteImage("hero-1", slideDefaults[0].image);
  const slide2 = useSiteImage("hero-2", slideDefaults[1].image);
  const slide3 = useSiteImage("hero-3", slideDefaults[2].image);
  const slide4 = useSiteImage("hero-4", slideDefaults[3].image);
  const slides = [slide1, slide2, slide3, slide4].map((s, i) => ({
    image: s.src,
    alt: s.alt || slideDefaults[i].alt,
  }));
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (100 / (SLIDE_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [nextSlide]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Image Ticker */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Bottom-Left Text Content */}
      <div className="absolute bottom-20 left-6 md:left-12 lg:left-16 z-10 text-white">
        {/* Tree Icon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4"
        >
          <TreePine className="w-6 h-6 text-white stroke-[1.5]" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight max-w-md text-left flex flex-col"
        >
          <span>Отключись,</span>
          <span>чтобы вернуться</span>
        </motion.h1>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-6 flex items-center gap-3 bg-white text-foreground px-6 py-3 rounded-full text-sm tracking-wide hover:bg-white/90 transition-colors"
        >
          Забронировать
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress Bars */}
      <div className="absolute bottom-8 left-6 md:left-12 lg:left-16 right-6 md:right-12 lg:right-16 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="flex-1 h-[2px] bg-white/30 overflow-hidden cursor-pointer"
            aria-label={`Перейти к слайду ${index + 1}`}
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index === currentSlide ? `${progress}%` : index < currentSlide ? "100%" : "0%",
              }}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
