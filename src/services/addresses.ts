import { supabase } from "@/integrations/supabase/client";

export interface Address {
  id?: string;
  user_id?: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default?: boolean;
}

export const getUserAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data;
};

export const createAddress = async (address: Address & { user_id: string }) => {
  const { data, error } = await supabase
    .from("addresses")
    .insert([address])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAddress = async (id: string, address: Partial<Address>) => {
  const { data, error } = await supabase
    .from("addresses")
    .update(address)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAddress = async (id: string) => {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  // First, unset all default addresses for this user
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);

  // Then set the selected address as default
  const { data, error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
