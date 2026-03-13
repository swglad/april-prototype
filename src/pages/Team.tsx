import Layout from "@/components/Layout";
import { User } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Kat P.",
    role: "Co-Founder & CEO",
    bio: "Kat brings deep expertise in financial markets, risk management, and data-driven decision-making from her career as a VP in Equity Trading at J.P. Morgan. At APRil, she leads overall strategy and product vision — translating complex financial mechanics into tools that give everyday users the clarity they deserve. If APRil has a north star, Kat is holding it.",
  },
  {
    name: "Scott G.",
    role: "Co-Founder & Chief Product Officer",
    bio: "Scott spent his career as a Senior Investment Strategist at BlackRock developing and commercializing data-driven investment solutions. At APRil, he owns the product roadmap and ensures the debt prioritization engine is both economically rigorous and genuinely intuitive. He's the reason APRil's math is sound and its design makes sense.",
  },
  {
    name: "Helen A.",
    role: "Co-Founder & Head of Consumer Financial Strategy",
    bio: "As SVP at Bessemer Trust, Helen has spent her career providing personalized financial planning and wealth management to high-net-worth families — including deep advisory work on debt, investment allocation, and long-term planning. At APRil, she shapes how the product speaks to users: with empathy, precision, and zero judgment.",
  },
  {
    name: "David K.",
    role: "Co-Founder & CTO",
    bio: "David is a serial fintech entrepreneur who has built a regional B2B marketplace, a payment platform, and a utility billing app from the ground up. He leads APRil's technical architecture and infrastructure — bringing the hard-won instincts of a founder who has scaled digital platforms before. When something needs to be built, David builds it.",
  },
  {
    name: "Daniel T.",
    role: "Co-Founder & Head of Engineering",
    bio: "Daniel is a finance and technology professional specializing in data analytics, system design, and AI integration in financial services. At APRil, he translates the debt optimization logic into a scalable, reliable digital system — bridging the gap between financial theory and working code. He is the reason the engine runs.",
  },
];

const Team = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-foreground text-center sm:text-5xl">
          The team behind APRil.
        </h1>
        <p className="mt-4 text-center text-lg text-muted-foreground font-body max-w-2xl mx-auto">
          Five finance and technology professionals who built APRil because they believe debt clarity is a form of care.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              {/* Circular photo placeholder - mauve bg with person icon */}
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={`${member.name} photo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-primary" />
                )}
              </div>

              {/* Name - Playfair Display */}
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {member.name}
              </h3>

              {/* Role - small forest green caps */}
              <p className="text-sm font-body text-secondary font-medium mt-0.5 uppercase tracking-wide">
                {member.role}
              </p>

              {/* Bio - Inter body text */}
              <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Team;
