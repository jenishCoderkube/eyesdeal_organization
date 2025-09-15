// hooks/useRecallByStore.js
import { useQuery } from "@tanstack/react-query";
import { packageService } from "../services/packageService";

export const useGetpackageProductStore = (page, limit, packageId) => {
  return useQuery({
    queryKey: ["packageproducts", page, limit, packageId], // unique per store & page
    queryFn: () => packageService.getPackageById(page, limit, packageId),

    keepPreviousData: false, // keep previous page visible while fetching new page
    staleTime: 0, // data becomes stale immediately
    cacheTime: 0,
  });
};
