import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, RotateCcw, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LOCATIONS_BUCKET } from "@/hooks/useLocations";
import { useSiteImages, type SiteImage } from "@/hooks/useSiteImages";

const SiteImageCard = ({
  image,
  canEdit,
  onChanged,
}: {
  image: SiteImage;
  canEdit: boolean;
  onChanged: () => Promise<void>;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [alt, setAlt] = useState(image.alt);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `site/${image.key}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(LOCATIONS_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { error } = await supabase
        .from("site_images")
        .update({ storage_path: path, external_url: null })
        .eq("key", image.key);
      if (error) throw error;
      await onChanged();
      toast.success("Фото обновлено");
    } catch (e: any) {
      toast.error(`Не удалось загрузить фото: ${e.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("site_images")
        .update({ storage_path: null, external_url: null })
        .eq("key", image.key);
      if (error) throw error;
      await onChanged();
      toast.success("Вернули фото по умолчанию");
    } catch (e: any) {
      toast.error(`Не удалось сбросить: ${e.message ?? e}`);
    } finally {
      setBusy(false);
    }
  };

  const saveAlt = async () => {
    if (alt === image.alt) return;
    const { error } = await supabase.from("site_images").update({ alt }).eq("key", image.key);
    if (error) {
      toast.error(`Не удалось сохранить подпись: ${error.message}`);
      return;
    }
    await onChanged();
    toast.success("Подпись сохранена");
  };

  return (
    <Card className="overflow-hidden border border-border shadow-soft">
      <div className="h-40 bg-muted">
        {image.url ? (
          <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-xs text-muted-foreground font-light">Фото по умолчанию</p>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-sm font-normal mb-1">{image.label}</h3>
        <p className="text-xs text-muted-foreground font-light flex items-start gap-1.5 mb-4">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          {image.recommended}
        </p>

        <Label className="text-[11px] uppercase tracking-wider font-normal">Подпись (alt)</Label>
        <Input
          value={alt}
          disabled={!canEdit}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={saveAlt}
          className="mt-2 mb-4 text-sm font-light"
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canEdit || busy}
            onClick={() => inputRef.current?.click()}
            className="flex-1 text-[11px] uppercase tracking-wider font-normal"
          >
            <Upload className="mr-2 h-3 w-3" />
            {busy ? "Загрузка..." : "Заменить фото"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canEdit || busy || !image.storagePath}
            onClick={reset}
            title="Вернуть фото по умолчанию"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

const SiteImagesManager = ({ canEdit }: { canEdit: boolean }) => {
  const { data, isLoading } = useSiteImages();
  const queryClient = useQueryClient();
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["site-images"] });
  };

  const images = Object.values(data ?? {}).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <p className="text-xs text-muted-foreground font-light mb-6">
        {canEdit
          ? "Замените фото на главной и баннеры страниц. Рядом с каждым местом указано рекомендуемое разрешение."
          : "Просмотр: менять фото может только администратор"}
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground font-light">Загрузка...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <SiteImageCard
              key={image.key}
              image={image}
              canEdit={canEdit}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SiteImagesManager;
