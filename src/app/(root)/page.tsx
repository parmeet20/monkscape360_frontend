"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  BookOpen,
  Headphones,
  Calendar,
  Compass,
  Layers,
  LandPlot,
} from "lucide-react";
import Carousel from "@/components/ui/carousel";
import Link from "next/link";

export default function Home() {
  const { theme } = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; // Prevents hydration mismatch

  const isDark = theme === "dark";

  const slideData = [
    {
      title: "Rumtek Monastery",
      button: "Explore Component",
      src: "https://imgs.search.brave.com/XkJ_rWDdXE0ChtIcBoAg79OIJqwFVve2vo3v9ffBnUo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/b2RkZXNzZW1hbmlh/LmluL3dwLWNvbnRl/bnQvdXBsb2Fkcy8y/MDIzLzA4L1RTVUtM/QUtIQU5HLU1PTkFT/VEVSWS0xMDI0eDY4/MS5qcGc",
    },
    {
      title: "Hemis Monastery",
      button: "Explore Component",
      src: "https://imgs.search.brave.com/NFQxVYn0VA0JsklJDH59QuHrCrXOps24ZCBJLiInfJQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9vZ2Fw/aXMub3VyZ3Vlc3Qu/aW4vc3RvcmFnZS91/cGxvYWRzL2NrZWRp/dG9yLWltYWdlcy9P/TnlBUHhNUnBTc1NK/dHNqOUw1Sy53ZWJw",
    },
    {
      title: "Key Monastery",
      button: "Explore Component",
      src: "https://imgs.search.brave.com/-84fo4-KuYq3KclJy39IWGg5cUZO8q1zYy2bc6ibq00/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Z29kaWdpdC5jb20v/Y29udGVudC9kYW0v/Z29kaWdpdC9kaXJl/Y3Rwb3J0YWwvZW4v/cnVtdGVrLW1vbmFz/dGVyeS5qcGc",
    },
    {
      title: "Key Monastery",
      button: "Explore Component",
      src: "https://imgs.search.brave.com/--Caf3PNu0Eg29hZwdsQf83brcmzW2xnWhe8FaOdxQQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudG9paW1nLmNv/bS90aHVtYi8xMDg1/MDMxMTQvUnVtdGVr/LU1vbmFzdGVyeS1H/YW5ndG9rLmpwZz93/aWR0aD02MzYmaGVp/Z2h0PTM1OCZyZXNp/emU9NA",
    }
  ];

  const features = [
    {
      title: "Virtual Tours",
      desc: "Immersive 360° panoramic monastery views with guided walkthroughs.",
      icon: Compass,
    },
    {
      title: "Interactive Map",
      desc: "Geo-tagged monastery locations with routes & nearby attractions.",
      icon: MapPin,
    },
    {
      title: "Digital Archives",
      desc: "Explore scanned manuscripts, murals, and rare historical documents.",
      icon: BookOpen,
    },
    {
      title: "Smart Audio Guide",
      desc: "Location-based multi-language audio guides with offline mode.",
      icon: Headphones,
    },
    {
      title: "Cultural Calendar",
      desc: "Stay updated with festivals, events & rituals in real-time.",
      icon: Calendar,
    },
    {
      title: "AI-powered Search",
      desc: "Quickly discover monasteries, traditions & cultural insights.",
      icon: Layers,
    },
  ];

  return (
    <main
      className={`min-h-screen transition-colors duration-700 ${isDark
        ? "bg-gradient-to-br text-white"
        : "bg-gradient-to-br from-orange-100 via-orange-50 to-orange text-gray-900"
        }`}
    >
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center text-center px-6">
        <div className="h-[40rem] w-full rounded-md relative flex flex-col items-center justify-center antialiased">
          <div className="max-w-2xl mx-auto p-4">

            <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent from-neutral-300 to-neutral-900 bg-gradient-to-b dark:from-neutral-200 dark:to-neutral-600  text-center font-sans font-bold">
              Explore the Beauty of Sikkim
            </h1>
            <p></p>
            <p className="text-neutral-500 max-w-lg mx-auto my-2 text-lg text-center relative z-10">
              Discover serene monasteries, breathtaking landscapes, and rich culture.
              Plan your perfect adventure with immersive tours and smart guides.
            </p>
            <button
              className="relative inline-flex h-12 mt-2 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 focus:ring-purple-400"
            >
              {/* Animated border layer */}
              <span
                className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]"
                aria-hidden="true"
              />

              {/* Inner content */}
              <span
                className="inline-flex h-full space-x-2 w-full items-center justify-center rounded-full bg-white text-gray-900 dark:bg-slate-950 dark:text-white px-3  text-sm font-semibold backdrop-blur-2xl transition-colors"
              >
                <LandPlot />
                <Link href={'/monastery'}>Explore Monasteries</Link>
              </span>
            </button>

          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-300 bg-clip-text text-transparent">
          Scenic Views of Sikkim
        </h2>
        <div className="relative overflow-hidden w-full h-full py-20">
          <Carousel slides={slideData} />
        </div>

      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-14 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-300 bg-clip-text text-transparent">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className={`p-8 rounded-3xl shadow-xl border ${isDark
                  ? "bg-white/10 border-white/20"
                  : "bg-white border-gray-200"
                  } flex flex-col items-center text-center`}
              >
                <Icon className="text-orange-400 w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className={`text-gray-700 dark:text-gray-300`}>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Impact Section */}
      <section
        className={`py-20 px-6 ${isDark
          ? "bg-gradient-to-r from-pink-900/40 via-yellow-900/30 to-pink-900/40"
          : "bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100"
          }`}
      >
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-300 bg-clip-text text-transparent">
            Our Impact
          </h2>
          <p className={`text-lg max-w-3xl mx-auto text-gray-700 dark:text-gray-300`}>
            Digitally preserving the monasteries and culture of Sikkim enriches tourism, empowers local communities,
            and brings global attention to this beautiful region’s heritage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              "🌍 Boosts tourism & accessibility",
              "🏛️ Preserves endangered cultural assets",
              "🙌 Empowers local communities",
              "📚 Supports education & global research",
            ].map((point, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 border ${isDark
                  ? "bg-white/10 border-white/20"
                  : "bg-white border-gray-200"
                  } shadow-lg`}
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80"
          alt="Sikkim monastery sunset"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          loading="lazy"
        />
        <div
          className={`relative max-w-3xl mx-auto bg-white/70 dark:bg-black/70 backdrop-blur-lg rounded-3xl p-12 shadow-xl border ${isDark ? "border-white/30" : "border-gray-200"
            }`}
        >
          <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-orange-300">
            Join Us in Preserving Sikkim’s Heritage
          </h2>
          <p className="mb-8 text-gray-800 dark:text-gray-300 text-lg">
            Be part of a community dedicated to celebrating and protecting the unique culture of Sikkim.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full px-8 py-4 font-semibold shadow-lg">
              Get Started
            </Button>
            <Button
              variant="outline"
              className={`rounded-full px-8 py-4 font-semibold ${isDark ? "border-white/40 text-white" : "border-gray-400 text-gray-800"
                }`}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
