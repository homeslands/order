import { useMutation } from "@tanstack/react-query"
import { updateLanguage } from "@/api"

export const useUpdateLanguage = () => {
    return useMutation({
      mutationFn: async ({ userSlug, language }: { userSlug: string; language: string }) => {
        return updateLanguage(userSlug, language)
      },
    })
  }