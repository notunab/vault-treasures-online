import { supabase } from "@/integrations/supabase/client";

export interface PlaceBidParams {
  itemId: string;
  bidderId: string;
  amount: number;
}

export interface PlaceBidResult {
  ok: boolean;
  new_high?: number;
  error?: string;
}

export const placeBid = async ({
  itemId,
  bidderId,
  amount,
}: PlaceBidParams): Promise<PlaceBidResult> => {
  try {
    const { data, error } = await supabase.rpc("place_bid", {
      p_item_id: itemId,
      p_bidder_id: bidderId,
      p_amount: amount,
    });

    if (error) throw error;

    return (data as any) || { ok: false, error: "Unknown error" };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message || "Failed to place bid",
    };
  }
};

export const getUserBids = async (userId: string) => {
  const { data, error } = await supabase
    .from("bids")
    .select(`
      *,
      item:item_id(
        id,
        name,
        image_url,
        auction_status,
        end_time,
        highest_bid,
        highest_bidder
      )
    `)
    .eq("bidder_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserWonItems = async (userId: string) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("winner_user_id", userId)
    .eq("auction_status", "ended");

  if (error) throw error;
  return data;
};
