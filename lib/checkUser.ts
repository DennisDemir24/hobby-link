import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const checkUser = async () => {
    const user = await currentUser();

    // Check for current logged in clerk user
    if (!user) {
        return null;
    }

    // Check if user is already in the database
    const loggedInUser = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
    });

    // If user is in the database, return the user
    if (loggedInUser) {
        return loggedInUser;
    }

    // If user is not in the database, create a new user
    const newUser = await db.user.create({
        data: {
            clerkUserId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
        },
    });   
    
    return newUser;
}