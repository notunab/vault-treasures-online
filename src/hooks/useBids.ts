import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { placeBid, getUserBids, getUserWonItems } from "@/services/bids";
import { toast } from "sonner";

export const usePlaceBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: placeBid,
    onSuccess: (data) => {
      if (data.ok) {
        toast.success("Bid placed successfully!");
        queryClient.invalidateQueries({ queryKey: ["auction-bids"] });
        queryClient.invalidateQueries({ queryKey: ["auction-item"] });
        queryClient.invalidateQueries({ queryKey: ["user-bids"] });
      } else {
        toast.error(data.error || "Failed to place bid");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to place bid");
    },
  });
};

export const useUserBids = (userId?: string) => {
  return useQuery({
    queryKey: ["user-bids", userId],
    queryFn: () => (userId ? getUserBids(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
};

export const useUserWonItems = (userId?: string) => {
  return useQuery({
    queryKey: ["user-won-items", userId],
    queryFn: () => (userId ? getUserWonItems(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
};
