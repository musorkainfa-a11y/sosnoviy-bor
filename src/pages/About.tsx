import { motion, useScroll, useTransform } from "framer-motion";
import { Leaf, Heart, Compass, Mountain, Users, TreePine } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSiteImage } from "@/hooks/useSiteImages";
import bannerFallback from "@/assets/detail-lake-2.jpg";

const values = [
  {
    icon: Leaf,
    title: "Экологичность",
    description: "Мы бережно относимся к природе: не вредим ей, а дополняют её."
  },
  {
    icon: Heart,
    title: "Связь",
    description: "Создаём связь между людьми и природой через осмысленный отдых на природе."
  },
  {
    icon: Compass,
    title: "Простота",
    description: "Отказываемся от лишней сложности, чтобы заново открыть радость простых вещей."
  },
  {
    icon: Mountain,
    title: "Подлинность",
    description: "Даём настоящий опыт природы — без искусственности и постановочности."
  },
  {
    icon: Users,
    title: "Сообщество",
    description: "Объединяем людей, которые одинаково трепетно относятся к природе. Присоединяйся в наши группы"
  },
  {
    icon: TreePine,
    title: "Осознанность",
    description: "Помогаем быть здесь и сейчас благодаря успокаивающей силе природы."
  }
];

const About = () => {
  const banner = useSiteImage("banner-about", bannerFallback);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      
      {/* Hero Image with Parallax */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <motion.img
          src={banner.src}
          alt={banner.alt || "Спокойное озеро в окружении природы"}
          style={{ y }}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <main>
        {/* Our Story Section */}
        <section className="py-24 lg:py-32 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">О нас</span>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight mt-2 mb-8">Наша история</h1>
              
              <div className="space-y-6 text-muted-foreground font-light leading-relaxed">
                 <p>
                    Добро пожаловать на базу отдыха «Сосновый Бор» — ваш уютный уголок в живописном урочище Широкая Балка, где густой хвойный лес встречается с чистым морем. Мы создали это пространство для тех, кто устал от городского шума, каменных джунглей и бесконечных уведомлений. Всего 7–10 минут неспешной прогулки по тенистым аллеям — и вы уже на просторном галечном пляже, наслаждаетесь морским бризом и ласковым солнцем. 


                    Мы искренне верим, что настоящий отдых на природе не должен лишать привычного комфорта. На нашей закрытой зеленой территории вас ждут современные домики и совершенно новые Эко-апартаменты с личными кухнями, которые идеально вписаны в лесной ландшафт. В «Сосновом Бору» время течет иначе: здесь хочется отложить смартфон, дышать полной грудью, слушать пение птиц и проводить теплые вечера в компании близких. Поменяйте городскую суету на лес и море, а мы позаботимся о том, чтобы ваш отпуск стал по-настоящему безупречным! 
                 </p>
                 <p>
                   Мы создаём места, где можно отойти от шума и заново почувствовать, что значит быть здесь и сейчас. Наше место — не побег от жизни, а возвращение к ней в самой её сути и красоте.
                 </p>
                 <p>
                   Сосновый бор возвращает вас к ритмам, которыми человечество жило тысячелетиями.
                 </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Off-Grid Matters Section */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Зачем это нужно</span>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight mt-2 mb-8">Почему отдых важен</h2>
              
              <div className="space-y-6 text-muted-foreground font-light leading-relaxed">
                <p>
                  Средний человек проводит перед экранами более семи часов в день. Наша нервная система,
                  сформировавшаяся за миллионы лет в природной среде, находится под непрерывной атакой
                  искусственных стимулов. Результат — тревожность, выгорание и всепроникающее чувство
                  разобщённости.
                </p>
                <p>
                   Отдых даёт нечто важное — возможность перезагрузки. Когда мы выходим из цифрового мира и городской рутины, происходят удивительные вещи: снижается уровень гормонов стресса, улучшается сон, возвращается креативность. Мы снова слышим собственные мысли.
                </p>
                <p>
                  Но дело не только в том, от чего мы отказываемся, а в том, что открываем заново. Треск костра.
                  Вес тишины. Медленное течение времени, не разрезанное на уведомления и дедлайны. Это не роскошь,
                  а необходимость, без которой современная жизнь убедила нас обходиться.
                </p>
                <p>
                   Мы верим: вернуться к природе — не значит убежать от реальности. Это значит вернуться в неё. И в этом возвращении мы находим не просто отдых, а обновление.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 lg:py-32 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Во что мы верим</span>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight mt-2">Наши ценности</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-8 border border-border rounded-lg bg-card shadow-soft hover:shadow-md transition-shadow duration-300"
                >
                  <value.icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="text-lg font-light tracking-tight mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;