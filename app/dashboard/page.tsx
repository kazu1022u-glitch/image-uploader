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
  const [loading, setLoading] = useState(false);

  // 画像一覧取得
  const fetchImages = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("ユーザー取得失敗", userError);
      return;
    }

    const { data, error } = await supabase.storage
      .from("images")
      .list(user.id, { sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      console.error("一覧取得失敗", error);
      return;
    }

    const signedUrls: ImageItem[] = [];

    for (const item of data ?? []) {
      const { data: signed } = await supabase.storage
        .from("images")
        .createSignedUrl(`${user.id}/${item.name}`, 60 * 5);

      if (signed?.signedUrl) {
        signedUrls.push({
          name: item.name,
          url: signed.signedUrl,
        });
      }
    }

    setImages(signedUrls);
  };

  // 初回読み込み
  useEffect(() => {
    fetchImages();
  }, []);

  // アップロード処理
  const handleUpload = async () => {
    if (!file) {
      setMessage("ファイルを選択してください");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("ログインしてください");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    setLoading(true);

    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    setLoading(false);

    if (error) {
      console.error("Upload error:", error);
      setMessage(`アップロード失敗: ${error.message}`);
      return;
    }

    setMessage("アップロード成功！");
    setFile(null);
    fetchImages();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>ダッシュボード</h1>

      <h2>画像アップロード</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "アップロード中..." : "アップロード"}
      </button>

      <p>{message}</p>

      <hr />

      <h2>あなたの画像一覧</h2>

      {images.length === 0 && <p>画像はまだありません</p>}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {images.map((img) => (
          <img
            key={img.name}
            src={img.url}
            alt="uploaded"
            style={{
              width: 200,
              height: "auto",
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
        ))}
      </div>
    </div>
  );
}
