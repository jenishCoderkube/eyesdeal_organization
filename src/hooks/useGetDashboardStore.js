// hooks/useRecallByStore.js
import { useQuery } from "@tanstack/react-query";
import { dashBoardService } from "../services/dashboardService";

export const useGetDashboardStore = () => {
  return useQuery({
    queryKey: ["dashboard"], // unique per store & page
    queryFn: () => dashBoardService.getDashboard(),
    keepPreviousData: false,
    refetchOnMount: "always",
  });
};
