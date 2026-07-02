import { cookies } from "next/headers";

interface Member {
  id: string | null;
  memberId: string;
  username: string | null;
  fullName: string | null;
  role: string;
  parentMemberId: string | null;
  isChild: boolean;
}

async function getCurrentFamily(token: string) {
  const familiesRes = await fetch("http://localhost:4000/api/families", {
    headers: { Cookie: `token=${token}` },
    cache: "no-store",
  });

  const families = await familiesRes.json();
  if (!families.length) return null;

  const family = families[0];

  const membersRes = await fetch(
    `http://localhost:4000/api/families/${family.id}/members`,
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
};

function MemberNode({ member, members }: { member: Member; members: Member[] }) {
  const children = members.filter((m) => m.parentMemberId === member.memberId);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center gap-1">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow ring-2 ${
            roleColor[member.role] || "ring-gray-300"
          }`}
        >
          {(member.fullName || member.username).slice(0, 2).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-slate-700">
          {member.fullName || member.username}
        </span>
        <span className="text-xs text-slate-500">{member.role}</span>
      </div>

      {children.length > 0 && (
        <>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex gap-10">
            {children.map((child) => (
              <MemberNode key={child.memberId} member={child} members={members} />
            ))}
          </div>
        </>
      )}
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

  const roots = family.members.filter((m: Member) => !m.parentMemberId);

  return (
    <div>
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Family Tree
      </h1>
      <p className="mt-1 text-sm text-slate-600">{family.name}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-10">
        {roots.map((root: Member) => (
          <MemberNode key={root.memberId} member={root} members={family.members} />
        ))}
      </div>
    </div>
  );
}