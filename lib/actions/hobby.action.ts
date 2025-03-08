"use server";

import { db } from "@/lib/db";

export async function getHobbies() {
  try {
    const hobbies = await db.hobby.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return hobbies;
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    throw error;
  }
} 