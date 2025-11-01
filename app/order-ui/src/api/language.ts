import { IApiResponse, IUserInfo } from "@/types"
import { http } from "@/utils"

export async function updateLanguage(userSlug: string, language: string): Promise<IApiResponse<IUserInfo>> {
  const response = await http.patch<IApiResponse<IUserInfo>>(`/user/${userSlug}/language`, { language })
  return response.data
}