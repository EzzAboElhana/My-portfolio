import { MotionConfig } from "motion/react";
import SmoothScroll from "@/components/site/SmoothScroll";
import FlowField from "@/components/site/FlowField";
import Hero from "@/components/site/Hero";
import Ticker from "@/components/site/Ticker";
import Work from "@/components/site/Work";
import About from "@/components/site/About";
import Experience from "@/components/site/Experience";
import Skills from "@/components/site/Skills";
import Contact from "@/components/site/Contact";
import SectionDivider from "@/components/site/SectionDivider";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <FlowField />
      <main className="flex-1">
        <Hero />
        <Ticker />
        <Work />
        <SectionDivider index="02" label="About" />
        <About />
        <SectionDivider index="03" label="Experience" />
        <Experience />
        <SectionDivider index="04" label="Toolkit" />
        <Skills />
        <SectionDivider index="05" label="Contact" />
        <Contact />
      </main>
    </MotionConfig>
  );
}
