import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["auth.signUp"] };
}

export default async function SignupPage() {
  const dict = await getDictionary(await getLocale());
  return <AuthForm mode="signup" dict={dict} />;
}
