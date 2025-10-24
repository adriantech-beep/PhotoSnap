// /src/utils/removeBgLocal.ts
import { removeBackground } from "@imgly/background-removal";

/**
 * Removes background directly in the browser using @imgly/background-removal.
 * @param file - a File or Blob object (e.g. from camera or file input)
 * @returns A Blob containing the transparent PNG
 */
export const removeBgLocal = async (file: File | Blob): Promise<Blob> => {
  try {
    console.log("🧠 Removing background locally using Imgly...");
    const result = await removeBackground(file);
    return result; // returns a Blob (transparent PNG)
  } catch (err) {
    console.error("❌ Local background removal failed:", err);
    throw err;
  }
};
