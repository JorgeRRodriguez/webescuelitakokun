import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kokun · Plataforma escolar",
  description: "Daycare & Preschool — papás, docentes y administración",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-fondo-pagina text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
