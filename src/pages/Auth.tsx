import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import logoAsset from "@/assets/logo-sosnovy-bor.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/admin");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Ошибка проверки",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({
            title: "Не удалось войти",
            description: error.message === "Invalid login credentials" 
              ? "Неверный email или пароль. Попробуйте снова." 
              : error.message,
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Аккаунт уже существует",
              description: "Этот email уже зарегистрирован. Войдите в аккаунт.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Не удалось зарегистрироваться",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Проверьте почту",
            description: "Мы отправили ссылку для подтверждения. Подтвердите email, чтобы продолжить.",
          });
        }
      }
    } catch {
      toast({
        title: "Ошибка",
        description: "Что-то пошло не так. Попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={logoAsset.url} alt="Сосновый бор" className="h-12 w-auto brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-light text-background mb-2 tracking-tight">
            {isLogin ? "Вход для администратора" : "Создать аккаунт"}
          </h1>
          <p className="text-xs text-background/60 font-light">
            {isLogin
              ? "Войдите, чтобы управлять объектами"
              : "Зарегистрируйтесь для доступа к админке"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[11px] uppercase tracking-wider font-normal text-background/70">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sosnovy-bor.ru"
              className="bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[11px] uppercase tracking-wider font-normal text-background/70">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-background/10 border-background/20 text-background placeholder:text-background/30 focus-visible:ring-primary"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal"
          >
            {loading ? "Подождите..." : isLogin ? "Войти" : "Создать аккаунт"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-background/50 hover:text-background/80 font-light transition-colors"
          >
            {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-background/40 hover:text-background/60 font-light transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Вернуться на сайт
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
