"use client";

import { useState, useRef } from "react";
import { DiscoverKind, RandomItem, PriceLevelConfig } from "@/types/discover";
import { saveRandomItemAdminAction, uploadDiscoverImageAdminAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  X,
  Coins,
  ImageIcon,
  MapPin,
  Upload,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  buildPriceFilterOptions,
  formatGoogleMapsUrl,
} from "@/features/randomizer/components/discover-helpers";

interface DiscoverItemModalProps {
  item: RandomItem | null;
  priceConfigs?: PriceLevelConfig[];
  onClose: () => void;
  onSuccess: (savedItem: RandomItem, isNew: boolean) => void;
}

// Nén và tối ưu kích thước ảnh trước khi gửi lên server (giúp tải nhanh và tránh vượt giới hạn payload)
async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  if (file.size < 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
            type: "image/webp",
          });
          resolve(compressed);
        },
        "image/webp",
        0.82
      );
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function DiscoverItemModal({ item, priceConfigs, onClose, onSuccess }: DiscoverItemModalProps) {
  const [kind, setKind] = useState<DiscoverKind>(item?.kind || "food");
  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");
  const [tip, setTip] = useState(item?.tip || "");
  const [priceLevel, setPriceLevel] = useState<string>(
    item?.price_level ? String(item.price_level) : "2"
  );
  const [imageUrl, setImageUrl] = useState<string>(item?.image_url || "");
  const [mapUrl, setMapUrl] = useState<string>(item?.map_url || "");
  const [isActive, setIsActive] = useState<boolean>(item ? item.is_active : true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priceOptions = buildPriceFilterOptions(priceConfigs).filter((p) => p.value !== "all");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsUploadingImage(true);
    setErrorMsg("");

    try {
      const fileToUpload = await compressImageIfNeeded(rawFile);
      const fd = new FormData();
      fd.append("file", fileToUpload);

      const res = await uploadDiscoverImageAdminAction(fd);
      if (res.success && res.data?.url) {
        setImageUrl(res.data.url);
      } else {
        setErrorMsg(res.message || "Tải ảnh thất bại, bạn có thể dán link ảnh.");
      }
    } catch {
      setErrorMsg("Không thể chuẩn bị file ảnh để tải lên.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề gợi ý.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const fd = new FormData();
    if (item?.id) fd.append("id", item.id);
    fd.append("kind", kind);
    fd.append("title", title.trim());
    if (description.trim()) fd.append("description", description.trim());
    if (tip.trim()) fd.append("tip", tip.trim());
    if (priceLevel) fd.append("price_level", priceLevel);
    if (imageUrl.trim()) fd.append("image_url", imageUrl.trim());
    if (mapUrl.trim()) fd.append("map_url", mapUrl.trim());
    fd.append("is_active", String(isActive));

    const res = await saveRandomItemAdminAction(fd);
    setIsSubmitting(false);

    if (res.success) {
      const saved: RandomItem = {
        id: item?.id || "saved-" + Date.now(),
        external_key: item?.external_key || null,
        kind,
        title: title.trim(),
        description: description.trim() || null,
        tip: tip.trim() || null,
        price_level: priceLevel ? Number(priceLevel) : null,
        image_url: imageUrl.trim() || null,
        map_url: mapUrl.trim() || null,
        is_active: isActive,
        created_at: item?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onSuccess(saved, !item);
    } else {
      setErrorMsg(res.message || "Lỗi lưu dữ liệu.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-xl border border-[#F2EAE5]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#201A1D]">
            {item ? "Chỉnh sửa gợi ý" : "Thêm gợi ý hẹn hò mới"}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
            <X className="w-4 h-4 text-stone-600" />
          </button>
        </div>

        {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#201A1D]">Loại gợi ý</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "food", label: "🍜 Đồ ăn" },
                { id: "drink", label: "🍹 Đồ uống" },
                { id: "place", label: "📍 Địa điểm" },
                { id: "activity", label: "✨ Trải nghiệm" },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setKind(c.id as DiscoverKind)}
                  className={`p-2 rounded-xl border text-center font-semibold ${
                    kind === c.id ? "border-[#7C4DFF] bg-[#FFF2EB] text-[#7C4DFF]" : "border-[#F2EAE5] bg-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#201A1D]">Tiêu đề gợi ý</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Phở Bát Đàn, Cà phê Đinh..."
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#7C4DFF]"
            />
          </div>

          {/* TRƯỜNG ẢNH TRỰC QUAN */}
          <div className="space-y-2 p-3 rounded-2xl bg-[#FFFBF9] border border-[#F2EAE5]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#201A1D] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#7C4DFF]" />
                Hình ảnh gợi ý (URL hoặc Tải lên)
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-stone-400 hover:text-red-500 text-[11px] flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Xóa ảnh
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Dán link ảnh (https://...)"
                className="flex-1 p-2 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#7C4DFF] text-xs"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="rounded-xl shrink-0 h-[34px] px-3 gap-1.5 text-xs border-[#F2EAE5]"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7C4DFF]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#7C4DFF]" />
                )}
                <span>{isUploadingImage ? "Đang tải..." : "Tải ảnh"}</span>
              </Button>
            </div>

            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden border border-[#F2EAE5] bg-stone-100 max-h-40 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Ảnh trực quan"
                  className="w-full h-36 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60' viewBox='0 0 100 60'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3EẢnh lỗi link%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}
          </div>

          {/* TRƯỜNG ĐỊA CHỈ URL GOOGLE MAP */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#F6FBF8] border border-[#E2F0E8]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#1B9B68] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#1B9B68]" />
                Địa chỉ URL Google Map
              </label>
              {mapUrl && (
                <a
                  href={formatGoogleMapsUrl(mapUrl) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1B9B68] hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Mở thử bản đồ
                </a>
              )}
            </div>
            <input
              type="text"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="VD: https://maps.app.goo.gl/... hoặc địa chỉ..."
              className="w-full p-2 bg-white border border-[#D5EADF] rounded-xl focus:border-[#1B9B68] text-xs"
            />
            <p className="text-[10px] text-stone-500">
              Khi người dùng quay trúng món/địa điểm này, nút &quot;Xem trên Google Maps&quot; sẽ hiện ra để mở đúng link.
            </p>
          </div>


          <div className="space-y-1">
            <label className="font-bold text-[#201A1D] flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#B88812]" /> Chọn mức chi tiêu tương ứng
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priceOptions.map((opt) => {
                const lvl = opt.value as number;
                return (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setPriceLevel(String(lvl))}
                    className={`p-2 rounded-xl border text-left ${
                      priceLevel === String(lvl)
                        ? "border-[#7C4DFF] bg-[#FFF2EB] text-[#7C4DFF]"
                        : "border-[#F2EAE5] bg-white"
                    }`}
                  >
                    <div className="font-bold">Mức {lvl}: {opt.label}</div>
                    <div className="text-[10px] opacity-75">{opt.rangeText}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#201A1D]">Mô tả</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả không gian, đặc trưng..."
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#7C4DFF]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#201A1D]">Mẹo hẹn hò đôi (Tip)</label>
            <input
              type="text"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="VD: Nên ghé lúc 17h ngắm hoàng hôn"
              className="w-full p-2.5 bg-white border border-[#F2EAE5] rounded-xl focus:border-[#7C4DFF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded accent-[#7C4DFF] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isActive" className="font-medium text-stone-700 cursor-pointer">
              Kích hoạt gợi ý này cho vòng quay
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#F2EAE5]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl h-9">
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#7C4DFF] text-white font-bold h-9 px-5">
              {isSubmitting ? "Đang lưu..." : item ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
