import Layout from "@/components/Layout";
import { theme } from "@/theme/config";
import { Linkedin } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  linkedin?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Jordan Lee",
    role: "Founder & Lead Designer",
    bio: "Jordan spent a decade in fintech design before realizing most tools serve the lender, not the borrower. They started APRil to flip that script. Their mission is making financial data feel human.",
    linkedin: "#",
  },
  {
    name: "Sam Patel",
    role: "Lead Engineer",
    bio: "Sam builds systems that make complex math feel simple. Previously at a major payments company, now obsessed with making interest rates legible. They believe clarity is a feature, not a luxury.",
    linkedin: "#",
  },
  {
    name: "Maya Chen",
    role: "Financial Educator",
    bio: "Maya taught personal finance at the community college level for six years. She ensures every word in APRil is clear, accurate, and jargon-free. Her goal: no one should feel lost reading their own numbers.",
    linkedin: "#",
  },
  {
    name: "Alex Rivera",
    role: "Product Manager",
    bio: "Alex coordinates the roadmap and listens to users. Their background in behavioral economics shapes how APRil guides decisions without being pushy. They believe the best product is the one people actually use.",
    linkedin: "#",
  },
  {
    name: "Taylor Brooks",
    role: "Data & Privacy Lead",
    bio: "Taylor makes sure your data stays yours. With a background in security engineering, they architected APRil's privacy-first approach from day one. Trust is earned, and Taylor takes that seriously.",
    linkedin: "#",
  },
];

const Team = () => {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-foreground text-center sm:text-5xl">
          The team behind {theme.brand.name}
        </h1>
        <p className="mt-4 text-center text-lg text-muted-foreground font-body max-w-2xl mx-auto">
          A small, dedicated group building tools for financial clarity.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-xl border border-border bg-card p-6 text-center"
              style={{ borderRadius: theme.radius.card }}
            >
              {/* Circular photo placeholder */}
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={`${member.name} photo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-heading text-2xl font-bold text-primary">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>

              {/* Name */}
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {member.name}
              </h3>

              {/* Role */}
              <p className="text-sm font-body text-primary font-medium mt-0.5">
                {member.role}
              </p>

              {/* Bio (3 sentences) */}
              <p className="mt-3 text-sm text-muted-foreground font-body leading-relaxed">
                {member.bio}
              </p>

              {/* LinkedIn */}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-body text-secondary hover:text-secondary/80 transition-colors"
                  aria-label={`${member.name} LinkedIn profile`}
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Team;
