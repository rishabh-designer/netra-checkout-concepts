import type { Metadata } from "next";
import {
  Anek_Latin,
  Anek_Devanagari,
  Anek_Bangla,
  Anek_Gujarati,
  Anek_Gurmukhi,
  Anek_Kannada,
  Anek_Malayalam,
  Anek_Odia,
  Anek_Tamil,
  Anek_Telugu,
  Instrument_Serif,
} from "next/font/google";
import "@/styles/globals.css";
import { QuoteFlowProvider } from "@/lib/quote-flow";

/*
 * Typography mandate: only Anek (every script it ships) and Instrument Serif
 * may render text anywhere in this app. The full multiscript Anek chain is
 * loaded so any supported script falls through to its Anek variant. Only Latin
 * (and Instrument Serif) are preloaded; the other scripts are fetched on demand
 * via unicode-range, so they don't cost ~1MB on every page load.
 */
const anekLatin = Anek_Latin({ subsets: ["latin"], variable: "--font-anek-latin" });
const anekDevanagari = Anek_Devanagari({ subsets: ["devanagari"], preload: false, variable: "--font-anek-devanagari" });
const anekBangla = Anek_Bangla({ subsets: ["bengali"], preload: false, variable: "--font-anek-bangla" });
const anekGujarati = Anek_Gujarati({ subsets: ["gujarati"], preload: false, variable: "--font-anek-gujarati" });
const anekGurmukhi = Anek_Gurmukhi({ subsets: ["gurmukhi"], preload: false, variable: "--font-anek-gurmukhi" });
const anekKannada = Anek_Kannada({ subsets: ["kannada"], preload: false, variable: "--font-anek-kannada" });
const anekMalayalam = Anek_Malayalam({ subsets: ["malayalam"], preload: false, variable: "--font-anek-malayalam" });
const anekOdia = Anek_Odia({ subsets: ["oriya"], preload: false, variable: "--font-anek-odia" });
const anekTamil = Anek_Tamil({ subsets: ["tamil"], preload: false, variable: "--font-anek-tamil" });
const anekTelugu = Anek_Telugu({ subsets: ["telugu"], preload: false, variable: "--font-anek-telugu" });
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const fontVariables = [
  anekLatin,
  anekDevanagari,
  anekBangla,
  anekGujarati,
  anekGurmukhi,
  anekKannada,
  anekMalayalam,
  anekOdia,
  anekTamil,
  anekTelugu,
  instrumentSerif,
]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: "Director’s & Officer’s Insurance | BimaKavach",
  description: "Protects executives when business decisions lead to lawsuits",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <QuoteFlowProvider>{children}</QuoteFlowProvider>
      </body>
    </html>
  );
}
