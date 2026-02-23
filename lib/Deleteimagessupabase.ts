import { supabase } from "./supabase";

export const deleteMultipleImages = async (imagesArray: string[]): Promise<void> => {
  console.log(imagesArray)
  if (!imagesArray || imagesArray.length === 0) return;

  // Public URL → storage relative path
  const paths: string[] = imagesArray.map((url) => {
    // example:
    // https://xyz.supabase.co/storage/v1/object/public/user/uploads/abc.jpg
    return url.split("/user/")[1]; // uploads/abc.jpg
  });

  const { error } = await supabase.storage
    .from("user")
    .remove(paths);

  if (error) {
    console.log("Delete Error:", error.message);
  } else {
    console.log("All Images Deleted Successfully");
  }
};


export const deleteAvatar = async (imageUrl: string): Promise<void> => {
  try {
    // full URL se file path nikalna
    const filePath = imageUrl.split("/user/")[1];

    if (!filePath) {
      console.log("Invalid image URL");
      return;
    }

    const { error } = await supabase.storage
      .from("user")
      .remove([filePath]); // remove hamesha array leta hai

    if (error) {
      console.log("Delete Error:", error.message);
    } else {
      console.log("Image Deleted Successfully");
    }
  } catch (err) {
    console.log("Unexpected Error:", err);
  }
};
