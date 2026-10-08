import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logoAsset from "@/assets/logo-sosnovy-bor.png.asset.json";
const Footer = () => {
  return <footer className="bg-foreground text-background py-20 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-10 lg:gap-12">
          {/* Brand Row */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoAsset.url} alt="Сосновый бор" className="h-10 w-auto brightness-0 invert" />
            </div>
            <p className="text-background/70 text-xs font-light leading-relaxed max-w-xs">
              Создаём настоящую связь с природой через лес и море.
            </p>
          </div>

          {/* Pages Row - Two Columns on Mobile */}
          <div>
            <h4 className="text-sm font-medium mb-4">Страницы</h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              <li>
                <Link to="/" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Наши номера
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Контакты
                </Link>
              </li>
              <li>
                <a href="/#booking" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Бронирование
                </a>
              </li>
              <li>
                <Link to="/admin" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Админ-панель
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Row */}
          <div>
            <h4 className="text-sm font-medium mb-4">Свяжитесь с нами</h4>
            <div className="flex flex-col gap-2 mb-8">
              <a href="tel:+79181348484" className="text-background/70 hover:text-background smooth-hover text-xs font-light flex items-center gap-2">
                <Mail className="h-3 w-3" />
                + 7 918 134 84 84
              </a>
              <p className="text-background/70 text-xs font-light">
                Пн – Пт: 9:00 – 20:00
              </p>
            </div>

            <h4 className="text-sm font-medium mb-4">Мы в соцсетях</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="text-background/70 hover:text-background smooth-hover">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-background/70 hover:text-background smooth-hover">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-background/70 hover:text-background smooth-hover">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 mt-12 text-center text-background/50 text-xs font-light">
          <p>&copy; 2026 Сосновый бор. Все права защищены.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;