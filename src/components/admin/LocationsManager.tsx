import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Upload, X, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useLocations, LOCATIONS_BUCKET, resolveImageUrls } from "@/hooks/useLocations";
import {
  amenityIconLabels,
  formatRub,
  getAmenityIcon,
  type Amenity,
  type Location,
} from "@/data/locations";

interface FormState {
  id: string;
  name: string;
  place: string;
  description: string;
  price_rub: number;
  rating: number;
  featured: boolean;
  imagePath: string | null;
  imagePaths: string[];
  features: string;
  details: string;
  amenities: Amenity[];
  sortOrder: number;
}

const emptyForm: FormState = {
  id: "",
  name: "",
  place: "",
  description: "",
  price_rub: 0,
  rating: 5,
  featured: false,
  imagePath: null,
  imagePaths: [],
  features: "",
  details: "",
  amenities: [],
  sortOrder: 0,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || `loc-${Date.now()}`;

const LocationsManager = ({ canEdit }: { canEdit: boolean }) => {
  const { data: locations, isLoading } = useLocations();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const allPaths = useMemo(
    () => [form.imagePath, ...form.imagePaths].filter(Boolean) as string[],
    [form.imagePath, form.imagePaths]
  );

  useEffect(() => {
    if (!open || allPaths.length === 0) return;
    const missing = allPaths.filter((p) => !previews[p]);
    if (missing.length === 0) return;
    resolveImageUrls(missing).then((map) => setPreviews((prev) => ({ ...prev, ...map })));
  }, [open, allPaths, previews]);

  const openCreate = () => {
    setForm({ ...emptyForm, sortOrder: (locations?.length ?? 0) + 1 });
    setIsNew(true);
    setOpen(true);
  };

  const openEdit = (loc: Location) => {
    setForm({
      id: loc.id,
      name: loc.name,
      place: loc.location,
      description: loc.description,
      price_rub: loc.price,
      rating: loc.rating,
      featured: loc.featured,
      imagePath: loc.imagePath,
      imagePaths: loc.imagePaths,
      features: loc.features.join("\n"),
      details: loc.details.join("\n"),
      amenities: loc.amenities,
      sortOrder: loc.sortOrder,
    });
    setIsNew(false);
    setOpen(true);
  };

  const uploadFiles = async (files: FileList, target: "cover" | "gallery") => {
    if (!canEdit) return;
    setUploading(true);
    try {
      const folder = form.id || slugify(form.name);
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${folder}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(LOCATIONS_BUCKET).upload(path, file, {
          contentType: file.type,
        });
        if (error) throw error;
        paths.push(path);
      }
      const map = await resolveImageUrls(paths);
      setPreviews((prev) => ({ ...prev, ...map }));
      if (target === "cover") {
        setForm((prev) => ({ ...prev, imagePath: paths[0] }));
      } else {
        setForm((prev) => ({ ...prev, imagePaths: [...prev.imagePaths, ...paths] }));
      }
      toast.success("Фото загружены");
    } catch (e: any) {
      toast.error(`Не удалось загрузить фото: ${e.message ?? e}`);
    } finally {
      setUploading(false);
    }
  };

  const moveGalleryImage = (index: number, delta: number) => {
    setForm((prev) => {
      const next = [...prev.imagePaths];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, imagePaths: next };
    });
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Укажите название локации");
      return;
    }
    setSaving(true);
    try {
      const id = isNew ? form.id.trim() || slugify(form.name) : form.id;
      const payload: any = {
        id,
        name: form.name.trim(),
        place: form.place.trim(),
        description: form.description.trim(),
        price_rub: Number(form.price_rub) || 0,
        rating: Number(form.rating) || 0,
        featured: form.featured,
        image_url: form.imagePath,
        images: form.imagePaths,
        features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
        details: form.details.split("\n").map((s) => s.trim()).filter(Boolean),
        amenities: form.amenities.filter((a) => a.label.trim()),
        sort_order: Number(form.sortOrder) || 0,
      };
      const { error } = isNew
        ? await supabase.from("locations").insert(payload)
        : await supabase.from("locations").update(payload).eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success(isNew ? "Локация добавлена" : "Изменения сохранены");
      setOpen(false);
    } catch (e: any) {
      toast.error(`Не удалось сохранить: ${e.message ?? e}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Локация удалена");
    } catch (e: any) {
      toast.error(`Не удалось удалить: ${e.message ?? e}`);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-muted-foreground font-light">
          {canEdit
            ? "Меняйте цены, фото и описания — изменения сразу появятся на сайте"
            : "Просмотр: изменения доступны только администратору"}
        </p>
        <Button
          size="sm"
          disabled={!canEdit}
          onClick={openCreate}
          className="rounded-full text-[11px] uppercase tracking-wider font-normal"
        >
          <Plus className="mr-2 h-3 w-3" />
          Добавить локацию
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground font-light">Загрузка...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(locations ?? []).map((loc) => (
            <Card key={loc.id} className="overflow-hidden border border-border shadow-soft">
              <div className="h-36 bg-muted">
                {loc.image && (
                  <img src={loc.image} alt={loc.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-normal">{loc.name}</h3>
                  {loc.featured && (
                    <Badge variant="outline" className="text-[10px] font-light border-primary/30 text-primary">
                      На главной
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-light mb-3">{loc.location}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-light">{formatRub(loc.price)}</span>
                    <span className="text-xs text-muted-foreground font-light"> / ночь</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-light">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    {loc.rating}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canEdit}
                    onClick={() => openEdit(loc)}
                    className="flex-1 text-[11px] uppercase tracking-wider font-normal"
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!canEdit}
                    onClick={() => setDeleteId(loc.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-light">
              {isNew ? "Новая локация" : "Редактирование локации"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Название</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 text-sm font-light"
                />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Место</Label>
                <Input
                  value={form.place}
                  onChange={(e) => setForm({ ...form, place: e.target.value })}
                  className="mt-2 text-sm font-light"
                />
              </div>
            </div>

            <div>
              <Label className="text-[11px] uppercase tracking-wider font-normal">Описание</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 text-sm font-light"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Цена, ₽ / ночь</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.price_rub}
                  onChange={(e) => setForm({ ...form, price_rub: Number(e.target.value) })}
                  className="mt-2 text-sm font-light"
                />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Рейтинг</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="mt-2 text-sm font-light"
                />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">Порядок</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="mt-2 text-sm font-light"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-4">
              <div>
                <p className="text-sm font-normal">Показывать на главной</p>
                <p className="text-xs text-muted-foreground font-light">В блоке «Избранные места»</p>
              </div>
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
            </div>

            {/* Cover */}
            <div>
              <Label className="text-[11px] uppercase tracking-wider font-normal">Обложка</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="w-32 h-20 rounded-md bg-muted overflow-hidden">
                  {form.imagePath && previews[form.imagePath] && (
                    <img src={previews[form.imagePath]} alt="Обложка" className="w-full h-full object-cover" />
                  )}
                </div>
                <label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && uploadFiles(e.target.files, "cover")}
                  />
                  <Button asChild variant="outline" size="sm" disabled={uploading} className="text-[11px] uppercase tracking-wider font-normal">
                    <span>
                      <Upload className="mr-2 h-3 w-3" />
                      Загрузить
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <Label className="text-[11px] uppercase tracking-wider font-normal">Галерея</Label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {form.imagePaths.map((path, index) => (
                  <div key={path} className="relative rounded-md overflow-hidden bg-muted h-24 group">
                    {previews[path] && (
                      <img src={previews[path]} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, imagePaths: form.imagePaths.filter((p) => p !== path) })
                      }
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveGalleryImage(index, -1)}
                        className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGalleryImage(index, 1)}
                        className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <label className="h-24 rounded-md border border-dashed border-border flex items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && uploadFiles(e.target.files, "gallery")}
                  />
                  <span className="text-xs text-muted-foreground font-light flex items-center gap-2">
                    <Plus className="h-3 w-3" />
                    Добавить
                  </span>
                </label>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">
                  Особенности (по одной в строке)
                </Label>
                <Textarea
                  rows={4}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  className="mt-2 text-sm font-light"
                />
              </div>
              <div>
                <Label className="text-[11px] uppercase tracking-wider font-normal">
                  Что включено (по одной в строке)
                </Label>
                <Textarea
                  rows={4}
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className="mt-2 text-sm font-light"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[11px] uppercase tracking-wider font-normal">Удобства</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setForm({
                      ...form,
                      amenities: [...form.amenities, { icon: "Tent", label: "", description: "" }],
                    })
                  }
                  className="text-[11px] uppercase tracking-wider font-normal"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  Добавить
                </Button>
              </div>
              <div className="space-y-3 mt-2">
                {form.amenities.map((amenity, index) => {
                  const Icon = getAmenityIcon(amenity.icon);
                  return (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 items-start">
                      <Select
                        value={amenity.icon}
                        onValueChange={(v) => {
                          const next = [...form.amenities];
                          next[index] = { ...next[index], icon: v };
                          setForm({ ...form, amenities: next });
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-[150px] text-sm font-light">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3 w-3 text-primary" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(amenityIconLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Название"
                        value={amenity.label}
                        onChange={(e) => {
                          const next = [...form.amenities];
                          next[index] = { ...next[index], label: e.target.value };
                          setForm({ ...form, amenities: next });
                        }}
                        className="text-sm font-light sm:w-[180px]"
                      />
                      <Input
                        placeholder="Описание"
                        value={amenity.description}
                        onChange={(e) => {
                          const next = [...form.amenities];
                          next[index] = { ...next[index], description: e.target.value };
                          setForm({ ...form, amenities: next });
                        }}
                        className="text-sm font-light flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setForm({
                            ...form,
                            amenities: form.amenities.filter((_, i) => i !== index),
                          })
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="text-[11px] uppercase tracking-wider font-normal">
              Отмена
            </Button>
            <Button size="sm" onClick={save} disabled={saving || !canEdit} className="text-[11px] uppercase tracking-wider font-normal">
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-light">Удалить локацию?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-light">
              Карточка исчезнет с сайта. Действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[11px] uppercase tracking-wider font-normal">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && remove(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[11px] uppercase tracking-wider font-normal"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LocationsManager;
