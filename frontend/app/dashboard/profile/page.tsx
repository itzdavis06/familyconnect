import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import EditProfileDetails from "@/components/EditProfileDetails";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) return null;

  const res = await fetch(`${API_URL}/api/me`, {
    headers: { Cookie: `token=${token.value}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function Profile() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold text-navy-900">
        Profile
      </h1>
      <div className="mt-6 max-w-md rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <ProfilePhotoUpload
            initialPhotoUrl={user.photoUrl}
            initials={user.username.slice(0, 2).toUpperCase()}
          />
          <div>
            <h2 className="font-[var(--font-manrope)] font-bold text-navy-900">
              {user.fullName || user.username}
            </h2>
            <p className="text-sm text-slate-500">@{user.username}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-between text-sm">
          <dt className="text-slate-500">Member since</dt>
          <dd className="font-medium text-slate-800">{formatDate(user.createdAt)}</dd>
        </div>

        <EditProfileDetails initialUser={user} />
      </div>
    </div>
  );
}





