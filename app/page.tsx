import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Services } from "@/components/sections/Services";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { IdealFor } from "@/components/sections/IdealFor";
import { Credentials } from "@/components/sections/Credentials";
import { ProjectsLaunched } from "@/components/sections/ProjectsLaunched";
import { Ownership } from "@/components/sections/Ownership";
import { Faq } from "@/components/sections/Faq";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Services />
        <HowItWorks />
        <IdealFor />
        <Credentials />
        <ProjectsLaunched />
        <Ownership />
        <Faq />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
