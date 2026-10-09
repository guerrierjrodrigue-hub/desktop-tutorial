import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return {
    title: dict["meta.forgotPassword"],
  };
}

export default async function ForgotPasswordPage() {
  const dict = await getDictionary(await getLocale());
  return <ForgotPasswordForm dict={dict} />;
}
