import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";

interface Member {
  id: string | null;
  memberId: string;
  username: string | null;
  fullName: string | null;
  role: string;
  parentMemberIds: string[];
  isChild: boolean;
  isAncestor: boolean;
  dateOfDeath: string | null;
}

async function getCurrentFamily(token: string) {
  const familiesRes = await fetch(`${API_URL}/api/families`, {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });
  const families = await familiesRes.json();
  if (!families.length) return null;
  const family = families[0];
  const membersRes = await fetch(
    `${API_URL}/api/families/${family.id}/members`,
    { headers: { Cookie: `token=${token}` }, cache: "no-store" }
  );
  const members: Member[] = await membersRes.json();
  return { ...family, members };
}

const roleColor: Record<string, string> = {
  ADMIN: "ring-navy-600",
  PARENT: "ring-navy-600",
  MEMBER: "ring-green-600",
  CHILD: "ring-amber-400",
  ANCESTOR: "ring-slate-400",
};

function PersonBox({ member }: { member: Member }) {
  return (
    
      <a href={`/dashboard/member/${member.memberId}`}
      className="flex flex-col items-center gap-1 hover:opacity-80"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow ring-2 ${
          roleColor[member.role] || "ring-gray-300"
        }`}
      >
        {(member.fullName || member.username || "??").slice(0, 2).toUpperCase()}
      </div>
      <span className="text-sm font-medium text-slate-700">
        {member.fullName || member.username}
      </span>
      <span className="text-xs text-slate-500">
        {member.role}
        {member.dateOfDeath && ` \u2022 d. ${new Date(member.dateOfDeath).getFullYear()}`}
      </span>
    </a>
  );
}

interface Couple {
  parentIds: string[];
  children: Member[];
}

function buildCouples(members: Member[]) {
  const couples = new Map<string, Couple>();
  for (const m of members) {
    if (m.parentMemberIds && m.parentMemberIds.length > 0) {
      const key = [...m.parentMemberIds].sort().join("|");
      if (!couples.has(key)) {
        couples.set(key, { parentIds: [...m.parentMemberIds].sort(), children: [] });
      }
      couples.get(key)!.children.push(m);
    }
  }
  return couples;
}

function CoupleNode({
  coupleKey,
  couples,
  byMemberId,
  visited,
}: {
  coupleKey: string;
  couples: Map<string, Couple>;
  byMemberId: Map<string, Member>;
  visited: Set<string>;
}) {
  if (visited.has(coupleKey)) return null;
  visited.add(coupleKey);

  const couple = couples.get(coupleKey);
  if (!couple) return null;

  const parents = couple.parentIds
    .map((pid) => byMemberId.get(pid))
    .filter((m): m is Member => !!m);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3">
        {parents.map((p, i) => (
          <div key={p.memberId} className="flex items-center gap-3">
            <PersonBox member={p} />
            {i < parents.length - 1 && <div className="h-0.5 w-6 bg-slate-400" />}
          </div>
        ))}
      </div>

      {couple.children.length > 0 && (
        <>
          <div className="h-6 w-0.5 bg-slate-400" />
          <div className="flex flex-wrap justify-center gap-10">
            {couple.children.map((child) => (
              <PersonSubtree
                key={child.memberId}
                member={child}
                couples={couples}
                byMemberId={byMemberId}
                visited={visited}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PersonSubtree({
  member,
  couples,
  byMemberId,
  visited,
}: {
  member: Member;
  couples: Map<string, Couple>;
  byMemberId: Map<string, Member>;
  visited: Set<string>;
}) {
  const ownCoupleKeys = [...couples.keys()].filter((key) =>
    couples.get(key)!.parentIds.includes(member.memberId)
  );

  if (ownCoupleKeys.length === 0) {
    return <PersonBox member={member} />;
  }

  return (
    <div className="flex flex-wrap justify-center gap-10">
      {ownCoupleKeys.map((key) => (
        <CoupleNode
          key={key}
          coupleKey={key}
          couples={couples}
          byMemberId={byMemberId}
          visited={visited}
        />
      ))}
    </div>
  );
}

export default async function FamilyTree() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const family = token ? await getCurrentFamily(token.value) : null;

  if (!family) {
    return (
      <div>
        <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
          Family Tree
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You&apos;re not part of a family yet.{" "}
          <a href="/dashboard/manage-family" className="underline">
            Create one
          </a>
          .
        </p>
      </div>
    );
  }

  const members: Member[] = family.members;
  const byMemberId = new Map(members.map((m) => [m.memberId, m]));
  const couples = buildCouples(members);

  const isChildOfSomeone = new Set(
    members.filter((m) => m.parentMemberIds?.length > 0).map((m) => m.memberId)
  );

  const topLevelCoupleKeys = [...couples.keys()].filter((key) =>
    couples.get(key)!.parentIds.every((pid) => !isChildOfSomeone.has(pid))
  );

  const standaloneMembers = members.filter((m) => {
    const hasParents = m.parentMemberIds && m.parentMemberIds.length > 0;
    const isParentInCouple = [...couples.values()].some((c) =>
      c.parentIds.includes(m.memberId)
    );
    return !hasParents && !isParentInCouple;
  });

  const visited = new Set<string>();

  return (
    <div>
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Family Tree
      </h1>
      <p className="mt-1 text-sm text-slate-600">{family.name}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-10">
        {topLevelCoupleKeys.map((key) => (
          <CoupleNode
            key={key}
            coupleKey={key}
            couples={couples}
            byMemberId={byMemberId}
            visited={visited}
          />
        ))}
        {standaloneMembers.map((m) => (
          <PersonBox key={m.memberId} member={m} />
        ))}
      </div>
    </div>
  );
}