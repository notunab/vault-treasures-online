import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  Address,
} from "@/services/addresses";
import { toast } from "sonner";

export const useUserAddresses = (userId?: string) => {
  return useQuery({
    queryKey: ["user-addresses", userId],
    queryFn: () => (userId ? getUserAddresses(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      toast.success("Address added successfully");
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add address");
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<Address> }) =>
      updateAddress(id, address),
    onSuccess: () => {
      toast.success("Address updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update address");
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success("Address deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete address");
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, addressId }: { userId: string; addressId: string }) =>
      setDefaultAddress(userId, addressId),
    onSuccess: () => {
      toast.success("Default address updated");
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to set default address");
    },
  });
};
