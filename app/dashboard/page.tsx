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

  // ログインユーザー取得
  const getUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("ユーザー取得失敗", error);
      return null;
    }
    return user;
  };

  // 画像一覧取得（自分の user.id 配下のみ）
  const fetchImages = async () => {
    const user = await getUser();
    if (!user) return;

    const { data, error } = await supabase.storage
      .from("images")
      .list(user.id, { sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      console.error("一覧取得失敗", error);
      return;
    }

    const signedImages: ImageItem[] = [];

    for (const item of data ?? []) {
      const { data: signed } = await supabase.storage
        .from("images")
        .createSignedUrl(`${user.id}/${item.name}`, 60 * 5);

      if (signed?.signedUrl) {
        signedImages.push({
          name: item.name,
          url: signed.signedUrl,
        });
      }
    }

    setImages(signedImages);
  };

  // 初回ロード
  useEffect(() => {
    fetchImages();
  }, []);

  // アップロード
  const handleUpload = async () => {
    if (!file) {
      setMessage("ファイルを選択してください");
      return;
    }

    const user = await getUser();
    if (!user) {
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

  // 削除
  const handleDelete = async (imageName: string) => {
    const user = await getUser();
    if (!user) return;

    const ok = confirm("この画像を削除しますか？");
    if (!ok) return;

    const { error } = await supabase.storage
      .from("images")
      .remove([`${user.id}/${imageName}`]);

    if (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました");
      return;
    }

    fetchImages();
  };

  return (
     <div
    className="min-h-screen bg-cover bg-center"
    style={{
      backgroundImage: "url('/dashboard-bg.png')",
    }}
  >
      <h1>ダッシュボード
          いい立ち飲み屋があったら教えてください。

      </h1>

      {/* アップロード */}
      <section>
        <h2>画像アップロード</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <br />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="
            mt-2 inline-flex items-center justify-center
            rounded-md bg-blue-600 px-4 py-2
            text-sm font-semibold text-white
            hover:bg-blue-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition
          "
        >
          {loading ? "アップロード中..." : "アップロード"}
        </button>
        <p>{message}</p>
      </section>

      <hr />

      {/* 一覧＋削除 */}
      <section>
        <h2>あなたの画像一覧</h2>

        {images.length === 0 && <p>画像はまだありません</p>}

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {images.map((img) => (
            <div
              key={img.name}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 8,
                width: 220,
              }}
            >
              <img
                src={img.url}
                alt="uploaded"
                style={{ width: "100%", borderRadius: 4 }}
              />
              <button
                style={{
                  marginTop: 8,
                  width: "100%",
                  background: "#e54848",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "6px 0",
                  cursor: "pointer",
                }}
                onClick={() => handleDelete(img.name)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
