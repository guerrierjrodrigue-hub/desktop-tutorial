import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict["auth.signIn"] };
}

export default async function LoginPage() {
  const dict = await getDictionary(await getLocale());
  return <AuthForm mode="login" dict={dict} />;
}
