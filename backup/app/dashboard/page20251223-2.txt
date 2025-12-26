"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ImageItem = {
  name: string;
  url: string;
};

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 画像一覧取得
  const fetchImages = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      setLoading(false);
      return;
    }

    // 自分のフォルダ配下を取得
    const { data, error } = await supabase.storage
      .from("images")
      .list("uploads", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("List error:", error);
      setLoading(false);
      return;
    }

    // 署名付きURL生成
    const signedImages: ImageItem[] = [];

    for (const file of data ?? []) {
      const { data: signed, error: signedError } =
        await supabase.storage
          .from("images")
          .createSignedUrl(`uploads/${file.name}`, 60 * 60);

      if (!signedError && signed) {
        signedImages.push({
          name: file.name,
          url: signed.signedUrl,
        });
      }
    }

    setImages(signedImages);
    setLoading(false);
  };

  // 🔹 初回ロード
  useEffect(() => {
    fetchImages();
  }, []);

  // 🔹 アップロード
  const handleUpload = async () => {
    if (!file) {
      setMessage("ファイルを選択してください");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      setMessage(`アップロード失敗: ${error.message}`);
      return;
    }

    setMessage("アップロード成功！");
    setFile(null);

    // 🔥 アップロード後に一覧再取得
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

      <br />
      <br />

      <button onClick={handleUpload}>アップロード</button>

      <p>{message}</p>

      <hr style={{ margin: "24px 0" }} />

      <h2>アップロード済み画像</h2>

      {loading && <p>読み込み中...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 16,
        }}
      >
        {images.map((img) => (
          <div key={img.name}>
            <img
              src={img.url}
              alt={img.name}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
