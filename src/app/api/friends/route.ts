import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    return decoded.userId;
  } catch {
    return null;
  }
}

// Get friends and friend requests
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarStyle: true,
            avatarSeed: true,
            level: true,
            streak: true,
            lastActiveAt: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarStyle: true,
            avatarSeed: true,
            level: true,
            streak: true,
            lastActiveAt: true,
          },
        },
      },
    });

    const friends = friendships.map((f) => {
      const friend = f.user1Id === userId ? f.user2 : f.user1;
      const now = new Date();
      const lastActive = new Date(friend.lastActiveAt);
      const isOnline = (now.getTime() - lastActive.getTime()) < 5 * 60 * 1000; // 5 minutes

      return {
        ...friend,
        isOnline,
        friendshipId: f.id,
      };
    });

    // Get pending requests
    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarStyle: true,
            avatarSeed: true,
            level: true,
          },
        },
      },
    });

    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'PENDING',
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarStyle: true,
            avatarSeed: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json({
      friends,
      receivedRequests,
      sentRequests,
    });
  } catch (error) {
    console.error('Friends error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send friend request
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json(
        { error: "You can't friend yourself" },
        { status: 400 }
      );
    }

    // Check existing friendship or request
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUser.id },
          { user1Id: targetUser.id, user2Id: userId },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Already friends' },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: userId },
        ],
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Request already pending' },
        { status: 400 }
      );
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: targetUser.id,
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarStyle: true,
            avatarSeed: true,
            level: true,
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'FRIEND_REQUEST',
        title: 'New Friend Request',
        message: `${(await prisma.user.findUnique({ where: { id: userId } }))?.username} wants to be your friend!`,
        data: JSON.stringify({ requestId: friendRequest.id }),
      },
    });

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error('Friend request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Accept/decline friend request
export async function PATCH(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, action } = await request.json();

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest || friendRequest.receiverId !== userId) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      // Create friendship
      await prisma.friendship.create({
        data: {
          user1Id: friendRequest.senderId,
          user2Id: friendRequest.receiverId,
        },
      });

      // Update request status
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      // Notify sender
      await prisma.notification.create({
        data: {
          userId: friendRequest.senderId,
          type: 'FRIEND_REQUEST',
          title: 'Friend Request Accepted',
          message: `${(await prisma.user.findUnique({ where: { id: userId } }))?.username} accepted your friend request!`,
        },
      });

      return NextResponse.json({ success: true, action: 'accepted' });
    } else {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'DECLINED' },
      });

      return NextResponse.json({ success: true, action: 'declined' });
    }
  } catch (error) {
    console.error('Friend action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
