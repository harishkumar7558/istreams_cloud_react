import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export function useImageAPI() { 
  const { userData } = useAuth();
  const { toast } = useToast();

  const baseApi = import.meta.env.VITE_API_BASE_URL;
  const BASE_URL = `${baseApi}/api/MaterialImage`;

  // Generic image fetcher
  const fetchImage = useCallback(
    async (fileName) => {
      try {
        const response = await axios.get(`${BASE_URL}/view?email=${encodeURIComponent(userData.userEmail)}&fileName=${fileName}`, {
          responseType: "blob",
        });
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch image ${fileName}`, error);
        return null;
      }
    },
    [userData.userEmail],
  );

  // Fetch product/sub-product image as URL
  const fetchImageUrl = useCallback(
    async (type, itemCode, subMaterialNo = null) => {
      const fileName = type === "product" ? `PRODUCT_IMAGE_${itemCode}` : `SUB_PRODUCT_IMAGE_${itemCode}_${subMaterialNo}`;

      const blob = await fetchImage(fileName);
      return blob ? URL.createObjectURL(blob) : null;
    },
    [fetchImage],
  );

  // Fetch image as File object with preview URL
  const fetchImageFile = useCallback(
    async (type, itemCode, subMaterialNo = null) => {
      const fileName = type === "product" ? `PRODUCT_IMAGE_${itemCode}` : `SUB_PRODUCT_IMAGE_${itemCode}_${subMaterialNo}`;

      const blob = await fetchImage(fileName);
      if (!blob) return null;

      const extension = blob.type.split("/")[1] || "png";
      const filename = type === "product" ? `PRODUCT_IMAGE_${itemCode}.${extension}` : `SUB_PRODUCT_IMAGE_${itemCode}_${subMaterialNo}.${extension}`;

      const file = new File([blob], filename, { type: blob.type });
      const previewUrl = URL.createObjectURL(file);

      return { file, previewUrl };
    },
    [fetchImage],
  );

  // Upload/Update image
  const saveImage = useCallback(
    async (type, itemCode, file, subMaterialNo = null, isNew = false) => {
      const fileName = type === "product" ? `PRODUCT_IMAGE_${itemCode}` : `SUB_PRODUCT_IMAGE_${itemCode}_${subMaterialNo}`;

      const payload = new FormData();
      payload.append("file", file);
      payload.append("email", userData.userEmail);
      payload.append("fileName", fileName);

      try {
        const config = { headers: { "Content-Type": "multipart/form-data" } };
        const url = isNew ? `${BASE_URL}/upload` : `${BASE_URL}/update?email=${userData.userEmail}&fileName=${fileName}`;

        const response = isNew ? await axios.post(url, payload, config) : await axios.put(url, payload, config);

        toast({ title: `Image ${isNew ? "uploaded" : "updated"} successfully!` });
        return response.data;
      } catch (error) {
        toast({
          variant: "destructive",
          title: `Error ${isNew ? "uploading" : "updating"} image`,
          description: error.response?.data?.message || error.message,
        });
        throw error;
      }
    },
    [userData.userEmail, toast],
  );

  // Delete image
  const deleteImage = useCallback(
    async (type, itemCode, subMaterialNo = null) => {
      const fileName = type === "product" ? `PRODUCT_IMAGE_${itemCode}` : `SUB_PRODUCT_IMAGE_${itemCode}_${subMaterialNo}`;

      try {
        const url = `${BASE_URL}/delete?email=${encodeURIComponent(userData.userEmail)}&fileName=${encodeURIComponent(fileName)}`;
        const response = await axios.delete(url);

        toast({ title: response.data.message || "Image deleted successfully" });
        return response.data;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error deleting image",
          description: error.response?.data?.message || error.message,
        });
        throw error;
      }
    },
    [userData.userEmail, toast],
  );

  return {
    fetchImageUrl,
    fetchImageFile,
    saveImage,
    deleteImage,
  };
}
