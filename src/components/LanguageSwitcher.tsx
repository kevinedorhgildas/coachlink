"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (
          options: { pageLanguage: string; layout: number; autoDisplay: boolean },
          id: string
        ) => void;
        InlineLayout: { SIMPLE: number };
      };
    };
  }
}

export default function LanguageSwitcher() {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "fr",
          layout: window.google.translate.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      window.googleTranslateElementInit = undefined as unknown as () => void;
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      className="flex items-center [&_.goog-te-gadget-simple]:rounded-lg [&_.goog-te-gadget-simple]:border [&_.goog-te-gadget-simple]:border-gray-200 [&_.goog-te-gadget-simple]:bg-white [&_.goog-te-gadget-simple]:px-2 [&_.goog-te-gadget-simple]:py-1 [&_.goog-te-gadget-simple]:text-sm"
    />
  );
}
