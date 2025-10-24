// /src/utils/removeBgFromServer.ts
export const removeBgFromServer = async (imageUrl: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/remove-background`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      }
    );

    if (!res.ok) throw new Error("Failed to remove background");

    const data = await res.json();

    // Our local server returns data.cleanedImage (a base64 data URL)
    return data.cleanedImage;
  } catch (error) {
    console.error("❌ Error removing background:", error);
    throw error;
  }
};
