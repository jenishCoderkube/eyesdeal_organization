// hooks/useRecallByStore.js
import { useQuery } from "@tanstack/react-query";
import { recallService } from "../services/recallService";

export const useRecallByStore = (storeId, page, limit) => {
  return useQuery({
    queryKey: ["recalls", storeId, page, limit], // unique per store & page
    queryFn: () => recallService.getRecallByStore(storeId, page, limit),
    enabled: !!storeId, // only fetch if storeId exists
    keepPreviousData: false, // keep previous page visible while fetching new page
    staleTime: 0, // data becomes stale immediately
    cacheTime: 0,
  });
};
