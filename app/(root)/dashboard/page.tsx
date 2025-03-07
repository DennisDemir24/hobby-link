import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Ensure user exists in database and get user data
  const user = await checkUser();
  
  
  if (!user) {
    // If no user is found, redirect to sign-in
    redirect("/sign-in");
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
  Welcome, {user.name !== 'null null' && user.name ? user.name : user.email.split("@")[0]}!
</h2>
        <p>This is your personal dashboard where you can manage your account and activities.</p>
        {/* Add dashboard content here */}
      </div>
    </div>
  );
}