"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  // 🔐 ログインチェック（未ログインなら /login へ）
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  // 認証確認中は何も表示しない（または Loading）
  if (checkingAuth) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  // 📤 画像アップロード処理
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
    </div>
  );
}
