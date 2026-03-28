import { z } from "zod";

export const appListReqSchema = z.object({
  appName: z.string().trim().min(1, "appName can not be blank").max(20, "appName length must be less than or equal to 20"),
  areaCode: z.string().trim().min(1, "areaCode can not be blank")
});

export const appInfoReqSchema = z.object({
  appId: z.string().trim().min(1, "appId can not be blank")
});
