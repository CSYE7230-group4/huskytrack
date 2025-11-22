export default function Profile() {
  return (
    <div className="px-6 py-10 max-w-3xl mx-auto space-y-10">

      {/* Page Heading */}
      <h1 className="text-3xl font-semibold text-gray-900">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-6 space-y-6 border">

        {/* Avatar + Basic Info */}
        <div className="flex items-center gap-4">
          <img
            src="https://i.pravatar.cc/150?img=5"
            className="w-20 h-20 rounded-full shadow"
            alt="User avatar"
          />

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Jenny S</h2>
            <p className="text-gray-600 text-sm">jenny@gmail.com</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              placeholder="Jenny S"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full mt-1 rounded-md border-gray-300 shadow-sm"
              placeholder="jenny@gmail.com"
              disabled
            />
          </div>

          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Save Changes (coming soon)
          </button>
        </div>

      </div>

      {/* Logout */}
      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
        Log out (coming soon)
      </button>
    </div>
  );
}
