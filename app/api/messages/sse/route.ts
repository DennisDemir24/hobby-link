import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// Map to store active connections
const connections = new Map<string, WritableStreamDefaultWriter<Uint8Array>>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  
  // Authenticate the user
  const session = await auth();
  const userId = session?.userId;
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Verify the user is a participant in this conversation
  if (conversationId) {
    const isParticipant = await db.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });
    
    if (!isParticipant) {
      return new Response('Forbidden', { status: 403 });
    }
  }
  
  // Create a new response with the appropriate headers for SSE
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  
  // Store the connection
  const key = `${userId}:${conversationId || 'all'}`;
  connections.set(key, writer);
  
  // Send initial connection message
  const encoder = new TextEncoder();
  writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to SSE' })}\n\n`));
  
  // Handle connection close
  request.signal.addEventListener('abort', () => {
    connections.delete(key);
    writer.close();
  });
  
  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper function to send events to connected clients
export async function sendEventToClients(
  type: 'message' | 'conversation' | 'read',
  data: Record<string, unknown>,
  conversationId?: string,
  excludeUserId?: string
) {
  const encoder = new TextEncoder();
  const payload = encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`);
  
  // If conversationId is provided, send to all participants of that conversation
  if (conversationId) {
    const participants = await db.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: {
          not: excludeUserId
        }
      },
      select: {
        userId: true
      }
    });
    
    for (const participant of participants) {
      const key = `${participant.userId}:${conversationId}`;
      const writer = connections.get(key);
      if (writer) {
        try {
          await writer.write(payload);
        } catch (error) {
          console.error(`Error sending event to ${key}:`, error);
          connections.delete(key);
        }
      }
      
      // Also send to the 'all' connection for this user
      const allKey = `${participant.userId}:all`;
      const allWriter = connections.get(allKey);
      if (allWriter) {
        try {
          await allWriter.write(payload);
        } catch (error) {
          console.error(`Error sending event to ${allKey}:`, error);
          connections.delete(allKey);
        }
      }
    }
  } else {
    // Broadcast to all connections
    for (const [key, writer] of connections.entries()) {
      if (excludeUserId && key.startsWith(`${excludeUserId}:`)) {
        continue;
      }
      
      try {
        await writer.write(payload);
      } catch (error) {
        console.error(`Error sending event to ${key}:`, error);
        connections.delete(key);
      }
    }
  }
} 