import React, { useState, useRef } from "react";
import type { UserProfile } from "../types";
import { X } from "lucide-react"; // Add lucide-react X icon

// Optionally, import your API service here
// import { changePassword } from "../api/auth";

// Example universe of interests (could be fetched from config later)
const ALL_INTERESTS = [
  "Technology",
  "Music",
  "Sports",
  "AI",
  "Web Development",
  "Seminars",
  "Workshops",
  "Cultural",
  "Gaming",
];

const MOCK_USER: UserProfile = {
  _id: "1234567890abcdef",
  firstName: "Jenny",
  lastName: "S",
  email: "jenny@gmail.com",
  university: "Tech University",
  avatar: "https://i.pravatar.cc/150?img=5",
  bio: "Passionate about tech and education. Loves hackathons and coding events.",
  interests: [
    "Technology",
    "Workshops",
    "Seminars",
    "AI",
    "Web Development",
    "Sports",
  ],
  preferences: {
    emailUpdates: true,
    pushNotifications: false,
    reminderTime: 30,
  },
};

type TabKey = "profile" | "preferences" | "security";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "preferences", label: "Preferences" },
  { key: "security", label: "Security" },
];

// Small Camera/Upload SVG
function CameraIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <circle cx={10} cy={10} r={10} fill="#222" opacity="0.7" />
      <path
        d="M7.83 5.5L9 4h2l1.17 1.5H14A1.5 1.5 0 0 1 15.5 7v5.5A1.5 1.5 0 0 1 14 14H6a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 6 5.5h1.83ZM10 12.5A2 2 0 1 0 10 8.5a2 2 0 0 0 0 4Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields state (clone user for changes)
  const [editProfile, setEditProfile] = useState(() => ({
    firstName: user.firstName,
    lastName: user.lastName,
    university: user.university,
    bio: user.bio || "",
    interests: [...user.interests],
    avatar: user.avatar,
  }));

  // --- Interests Section Editable State ---
  const [newInterest, setNewInterest] = useState(""); // for the add input

  // Add interest (checks, then adds to local editProfile.interests)
  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (!trimmed) return;
    // Case-insensitive prevent duplicates
    const exists = editProfile.interests.some(
      (i) => i.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return;
    setEditProfile((prev) => ({
      ...prev,
      interests: [...prev.interests, trimmed],
    }));
    setNewInterest("");
  };

  // Remove an interest from editProfile.interests
  const handleRemoveInterest = (tag: string) => {
    setEditProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== tag),
    }));
  };

  // Allow Enter key to add interest
  const handleInterestInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest();
    }
  };

  // Preferences editable state
  const [prefState, setPrefState] = useState(() => ({
    emailUpdates: user.preferences.emailUpdates,
    pushNotifications: user.preferences.pushNotifications,
    reminderTime: user.preferences.reminderTime,
  }));
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Security tab state
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [securityErrors, setSecurityErrors] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Avatar upload handling
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setEditProfile((prev) => {
      const selected = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return {
        ...prev,
        interests: selected,
      };
    });
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  // Placeholder avatar upload logic
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, use FileReader to preview locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfile((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      // TODO: integrate uploadAvatar API here
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Would call an API, then update the live user object
    setTimeout(() => {
      setUser((u) => ({
        ...u,
        firstName: editProfile.firstName,
        lastName: editProfile.lastName,
        university: editProfile.university,
        bio: editProfile.bio,
        interests: [...editProfile.interests],
        avatar: editProfile.avatar,
      }));
      setSaving(false);
    }, 800);
  };

  // Preferences handlers
  const handlePrefToggle = (key: "emailUpdates" | "pushNotifications") => {
    setPrefState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleReminderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrefState((prev) => ({
      ...prev,
      reminderTime: Number(e.target.value) as 15 | 30 | 60,
    }));
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    // Would call an API, then update the user preferences in user object
    setTimeout(() => {
      setUser((u) => ({
        ...u,
        preferences: {
          emailUpdates: prefState.emailUpdates,
          pushNotifications: prefState.pushNotifications,
          reminderTime: prefState.reminderTime,
        },
      }));
      setSavingPrefs(false);
    }, 800);
  };

  // Security password fields and handlers
  const handleSecurityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordState((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSecurityErrors(null);
    setSecuritySuccess(null);
  };

  // --- Robust API submit handler for password change ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrors(null);
    setSecuritySuccess(null);
    const { currentPassword, newPassword, confirmNewPassword } = passwordState;

    // Validation: Ensure all fields present
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setSecurityErrors("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setSecurityErrors("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setSecurityErrors("New passwords do not match.");
      return;
    }

    setUpdatingPassword(true);

    try {
      // Try to use your real API here!
      // await changePassword({ currentPassword, newPassword });

      // Simulate success (remove next line and uncomment above when API available)
      throw new Error("Demo mode - no API");

      // On success, reset fields & show generic notification
      // setSecuritySuccess("Password updated successfully.");
      // setPasswordState({
      //   currentPassword: "",
      //   newPassword: "",
      //   confirmNewPassword: "",
      // });
      // setTimeout(() => setSecuritySuccess(null), 2000); // Optionally auto-clear success message
    } catch (error) {
      // Fallback: Demo mode or API failed
      // eslint-disable-next-line no-console
      console.error("[Password Update] Error:", error);

      setTimeout(() => {
        setUpdatingPassword(false);
        setSecuritySuccess("Password updated! (Demo Mode)");
        setPasswordState({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        // Optionally: auto-clear message after 2s
        // setTimeout(() => setSecuritySuccess(null), 2000);
        // You could use a toast here instead: window.alert("Password updated! (Demo Mode)");
      }, 1000);
      return;
    }
    // This will not be reached in demo mode
    setUpdatingPassword(false);
    setSecuritySuccess("Password updated successfully.");
    setPasswordState({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    // Optionally auto-clear message:
    // setTimeout(() => setSecuritySuccess(null), 2000);
  };

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">
        Account Settings
      </h1>

      {/* Tabs */}
      <nav className="flex space-x-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-150 ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-primary"
            }`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow p-8 min-h-[16rem]">
        {/* Profile Card Header: Avatar + Name + Email */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative w-20 h-20">
            <img
              src={editProfile.avatar}
              alt="User avatar"
              className="w-20 h-20 rounded-full shadow object-cover"
            />
            {/* Camera overlay */}
            <button
              type="button"
              aria-label="Edit avatar"
              className="absolute right-1 bottom-1 bg-primary rounded-full p-1 shadow-md border-2 border-white hover:bg-primary/90 transition"
              onClick={handleAvatarClick}
              tabIndex={0}
            >
              <CameraIcon />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <span className="text-gray-600 text-sm">{user.email}</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={editProfile.firstName}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={editProfile.lastName}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                University
              </label>
              <input
                type="text"
                name="university"
                value={editProfile.university}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Bio <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                name="bio"
                value={editProfile.bio}
                onChange={handleInputChange}
                className="w-full resize-none border rounded-lg px-3 py-2 min-h-[64px]"
                maxLength={300}
                rows={3}
                placeholder="Tell us something about yourself"
              />
            </div>
            {/* Interests selector */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Interests
              </label>
              {/* Tag list of current interests - fully editable */}
              <div className="flex flex-wrap gap-2 mb-2">
                {editProfile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="bg-indigo-100 text-indigo-700 flex items-center gap-1 pr-1 rounded-full text-sm py-1 pl-3"
                  >
                    <span className="truncate">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(tag)}
                      className="ml-0.5 hover:bg-indigo-200 rounded-full transition p-0.5"
                      aria-label={`Remove ${tag}`}
                      tabIndex={0}
                    >
                      <X size={16} className="text-indigo-700" />
                    </button>
                  </span>
                ))}
              </div>
              {/* Input area for new interest */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={handleInterestInputKeyDown}
                  placeholder="Add new interest..."
                  className="border rounded-md px-3 py-1 text-sm"
                  maxLength={48}
                />
                <button
                  type="button"
                  className="border text-indigo-700 border-indigo-300 hover:bg-indigo-50 rounded-md px-3 py-1 text-sm transition"
                  onClick={handleAddInterest}
                >
                  Add
                </button>
              </div>
              {/* OPTIONAL: Legacy universe toggles (retain to allow easy picking) */}
              <div className="flex flex-wrap gap-1 mt-3">
                {ALL_INTERESTS.filter(
                  (interest) =>
                    // Only show if not already selected (case-insensitive)
                    !editProfile.interests.some(
                      (t) => t.toLowerCase() === interest.toLowerCase()
                    )
                ).map((interest) => (
                  <button
                    type="button"
                    key={interest}
                    className="px-2 py-1 rounded-full border border-indigo-200 bg-white text-indigo-600 text-sm hover:bg-indigo-50 transition"
                    onClick={() => {
                      setEditProfile((prev) => ({
                        ...prev,
                        interests: [...prev.interests, interest],
                      }));
                    }}
                    tabIndex={0}
                  >
                    + {interest}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "preferences" && (
          <form className="space-y-6 max-w-md mx-auto py-2" onSubmit={handleSavePreferences}>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Notifications
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={prefState.emailUpdates}
                className={`relative inline-flex items-center h-7 rounded-full w-12 transition ${
                  prefState.emailUpdates ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => handlePrefToggle("emailUpdates")}
                tabIndex={0}
              >
                <span
                  className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition ${
                    prefState.emailUpdates ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="ml-3 text-gray-600 text-sm">
                Receive important updates via email
              </span>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Push Notifications
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={prefState.pushNotifications}
                className={`relative inline-flex items-center h-7 rounded-full w-12 transition ${
                  prefState.pushNotifications ? "bg-primary" : "bg-gray-300"
                }`}
                onClick={() => handlePrefToggle("pushNotifications")}
                tabIndex={0}
              >
                <span
                  className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition ${
                    prefState.pushNotifications ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="ml-3 text-gray-600 text-sm">
                Alerts on your device
              </span>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Reminder Time
              </label>
              <select
                value={prefState.reminderTime}
                onChange={handleReminderChange}
                className="border rounded-lg px-3 py-2 w-40"
              >
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow disabled:opacity-60"
                disabled={savingPrefs}
              >
                {savingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "security" && (
          <form
            className="space-y-6 max-w-md mx-auto py-4"
            onSubmit={handleUpdatePassword}
            autoComplete="off"
          >
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordState.currentPassword}
                onChange={handleSecurityInputChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                autoComplete="current-password"
                minLength={1}
                disabled={updatingPassword}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordState.newPassword}
                onChange={handleSecurityInputChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={updatingPassword}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters.
              </p>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordState.confirmNewPassword}
                onChange={handleSecurityInputChange}
                className="w-full border rounded-lg px-3 py-2"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={updatingPassword}
              />
            </div>
            {securityErrors && (
              <div className="text-red-600 text-sm text-center">{securityErrors}</div>
            )}
            {securitySuccess && (
              <div className="text-green-600 text-sm text-center">{securitySuccess}</div>
            )}
            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-primary text-white font-semibold shadow disabled:opacity-60 flex items-center justify-center gap-2"
                disabled={updatingPassword}
              >
                {updatingPassword && (
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 mr-2 text-white animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                )}
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
