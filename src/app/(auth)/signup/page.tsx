import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage() {
  const dict = await getDictionary(await getLocale());
  return <AuthForm mode="signup" dict={dict} />;
}
