import { deleteAccount } from "../api/api";

export default function DeleteAccount() {
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      const result = await deleteAccount();
      alert(result.msg || "Account deleted successfully!");
      window.location.href = "/"; // redirect after delete
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      <div className="p-8 bg-gray-900/80 rounded-2xl shadow-2xl text-center">
        <h2 className="text-2xl font-semibold mb-4">Delete Account</h2>
        <p className="mb-6 text-gray-400">
          This action cannot be undone. Your data will be permanently removed.
        </p>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}
