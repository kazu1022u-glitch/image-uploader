"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  name: string;
  url: string;
};

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [message, setMessage] = useState("");

  // 画像一覧取得
  const fetchImages = async () => {
    const { data, error } = await supabase.storage
      .from("images")
      .list("uploads", { sortBy: { column: "created_at", order: "desc" } });

    if (error || !data) return;

    const signedUrls = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from("images")
          .createSignedUrl(`uploads/${file.name}`, 60 * 60);

        return {
          name: file.name,
          url: urlData?.signedUrl ?? "",
        };
      })
    );

    setImages(signedUrls);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // アップロード
  const handleUpload = async () => {
    if (!file) return;

    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(`uploads/${fileName}`, file);

    if (error) {
      setMessage(`アップロード失敗: ${error.message}`);
      return;
    }

    setMessage("アップロード成功！");
    setFile(null);
    fetchImages();
  };

  // 🔥 削除処理
  const handleDelete = async (name: string) => {
    const ok = confirm("この画像を削除しますか？");
    if (!ok) return;

    const { error } = await supabase.storage
      .from("images")
      .remove([`uploads/${name}`]);

    if (error) {
      alert("削除失敗: " + error.message);
      return;
    }

    fetchImages();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>画像アップロード</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload}>アップロード</button>

      <p>{message}</p>

      <hr />

      <h2>画像一覧</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {images.map((img) => (
          <div key={img.name}>
            <img
              src={img.url}
              alt=""
              width={200}
              style={{ display: "block" }}
            />
            <button
              style={{ marginTop: 8, width: "100%" }}
              onClick={() => handleDelete(img.name)}
            >
              削除
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
