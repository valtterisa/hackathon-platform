import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  account,
  hackathonMemberships,
  hackathonPageBlocks,
  hackathons,
  prizes,
  profiles,
  scheduleItems,
  sponsors,
  tracks,
  user,
} from "./schema";

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

async function main() {
  const email = "demo@hackhost.local";
  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  let userId = existing?.id;
  if (!userId) {
    userId = id("user");
    await db.insert(user).values({
      id: userId,
      name: "Demo Organizer",
      email,
      emailVerified: true,
      isPlatformAdmin: true,
    });
    const passwordHash = await hashPassword("demo-password-123");
    await db.insert(account).values({
      id: id("acc"),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    });
    await db.insert(profiles).values({
      userId,
      nickname: "Demo",
      bio: "Building Hackhost",
      skills: ["TypeScript", "Product"],
      lookingForTeam: false,
    });
  }

  const slug = "nordic-builders";
  const existingHack = await db.query.hackathons.findFirst({
    where: eq(hackathons.slug, slug),
  });
  if (existingHack) {
    console.log("Seed already applied.");
    return;
  }

  const hackathonId = id("hack");
  const starts = new Date();
  starts.setDate(starts.getDate() + 14);
  const ends = new Date(starts);
  ends.setDate(ends.getDate() + 1);

  await db.insert(hackathons).values({
    id: hackathonId,
    slug,
    title: "Nordic Builders Hackathon",
    tagline: "48 hours to ship something people actually use.",
    description:
      "Join builders across the Nordics for a weekend of focused shipping, mentors, and prizes. Open to students and professionals.",
    coverUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80",
    mode: "hybrid",
    location: "Helsinki + Online",
    startsAt: starts,
    endsAt: ends,
    status: "published",
    joinMode: "open",
    capacity: 200,
    codeOfConduct: "Be excellent to each other. No harassment.",
    createdBy: userId,
  });

  await db.insert(hackathonMemberships).values({
    id: id("mem"),
    hackathonId,
    userId,
    role: "organizer",
    status: "active",
  });

  await db.insert(hackathonPageBlocks).values([
    {
      id: id("blk"),
      hackathonId,
      type: "highlights",
      sortOrder: 0,
      content: {
        items: [
          "Mentors from local startups",
          "Open APIs and datasets",
          "Cash + cloud credits",
        ],
      },
    },
    {
      id: id("blk"),
      hackathonId,
      type: "faq",
      sortOrder: 1,
      content: {
        items: [
          {
            q: "Who can join?",
            a: "Anyone 16+ who wants to build. Teams of 1–5.",
          },
          {
            q: "Is it free?",
            a: "Yes. Food and venue covered for in-person attendees.",
          },
        ],
      },
    },
  ]);

  await db.insert(sponsors).values([
    {
      id: id("spn"),
      hackathonId,
      name: "Northwind Cloud",
      tier: "gold",
      url: "https://example.com",
      sortOrder: 0,
    },
    {
      id: id("spn"),
      hackathonId,
      name: "Baltic Ventures",
      tier: "silver",
      sortOrder: 1,
    },
  ]);

  await db.insert(prizes).values([
    {
      id: id("prz"),
      hackathonId,
      title: "Grand Prize",
      description: "Best overall project",
      value: "€3,000",
      sortOrder: 0,
    },
    {
      id: id("prz"),
      hackathonId,
      title: "People's Choice",
      value: "€1,000",
      sortOrder: 1,
    },
  ]);

  await db.insert(tracks).values([
    {
      id: id("trk"),
      hackathonId,
      name: "Climate",
      description: "Tools for a greener north",
      sortOrder: 0,
    },
    {
      id: id("trk"),
      hackathonId,
      name: "Developer Tools",
      description: "Make builders faster",
      sortOrder: 1,
    },
  ]);

  const day1 = new Date(starts);
  day1.setHours(10, 0, 0, 0);
  await db.insert(scheduleItems).values([
    {
      id: id("sch"),
      hackathonId,
      title: "Registration & breakfast",
      startsAt: day1,
      location: "Main hall",
      sortOrder: 0,
    },
    {
      id: id("sch"),
      hackathonId,
      title: "Kickoff",
      startsAt: new Date(day1.getTime() + 60 * 60 * 1000),
      location: "Stage",
      sortOrder: 1,
    },
    {
      id: id("sch"),
      hackathonId,
      title: "Hacking begins",
      startsAt: new Date(day1.getTime() + 2 * 60 * 60 * 1000),
      sortOrder: 2,
    },
  ]);

  console.log("Seeded demo@hackhost.local / demo-password-123");
  console.log(`Event: /e/${slug}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
