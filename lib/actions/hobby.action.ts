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

export async function createHobby(
  name: string,
  description: string | null,
  tags: string[],
  emoji?: string,
  difficulty?: string,
  timeCommitment?: string,
  costRange?: string,
  location?: string
) {
  try {
    // Create the hobby with only the required fields
    const hobby = await db.hobby.create({
      data: {
        name,
        description,
        tags,
      }
    });
    
    // If we have optional fields, update the hobby
    if (emoji || difficulty || timeCommitment || costRange || location) {
      const updateData: {
        emoji?: string;
        difficulty?: string;
        timeCommitment?: string;
        costRange?: string;
        location?: string;
      } = {};
      
      if (emoji) updateData.emoji = emoji;
      if (difficulty) updateData.difficulty = difficulty;
      if (timeCommitment) updateData.timeCommitment = timeCommitment;
      if (costRange) updateData.costRange = costRange;
      if (location) updateData.location = location;
      
      // Update the hobby with optional fields
      await db.hobby.update({
        where: { id: hobby.id },
        data: updateData
      });
      
      // Fetch the updated hobby
      return await db.hobby.findUnique({
        where: { id: hobby.id }
      });
    }
    
    return hobby;
  } catch (error) {
    console.error("Error creating hobby:", error);
    throw error;
  }
} 