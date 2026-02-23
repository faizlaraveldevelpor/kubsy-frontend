import { supabase } from "./supabase";

/* ===============================
   SINGLE IMAGE UPLOAD
================================ */
export const uploadSingleImage = async (uri: string) => {
  try {
    if (!uri) throw new Error("URI missing");

    const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const filePath = `uploads/${fileName}`;

    // 🔥 FormData (RN compatible)
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: fileName,
      type: `image/${ext === "jpg" ? "jpeg" : ext}`,
    } as any);

    const { error } = await supabase.storage
      .from("user") // 🔴 bucket name
      .upload(filePath, formData, {
        contentType: `image/${ext}`,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("user")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.log("Upload Error:", err);
    return null;
  }
};

/* ===============================
   MULTIPLE IMAGES UPLOAD
================================ */
export const uploadMultipleImages = async (uris: string[]) => {
  if (!uris || uris.length === 0) return [];

  const results = await Promise.all(
    uris.map((uri) => uploadSingleImage(uri))
  );

  return results.filter(Boolean) as string[];
};
