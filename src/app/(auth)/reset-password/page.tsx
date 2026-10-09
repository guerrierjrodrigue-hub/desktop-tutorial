import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.resetPassword"],
  };
}

export default async function ResetPasswordPage() {
  const dict = await getDictionary(await getLocale());
  return <ResetPasswordForm dict={dict} />;
}
