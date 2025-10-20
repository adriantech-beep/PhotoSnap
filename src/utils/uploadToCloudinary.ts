export const uploadToCloudinary = async (file: File | Blob) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "PhotoSnap-Upload"); // from Cloudinary settings

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dni2zk7ht/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  return data; // contains public_id, secure_url, etc.
};
