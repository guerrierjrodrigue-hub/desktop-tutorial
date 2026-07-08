import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const dict = await getDictionary(await getLocale());
  return <AuthForm mode="login" dict={dict} />;
}
