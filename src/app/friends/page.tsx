'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Sidebar, useSidebarMargin } from '@/components/layout/Sidebar';
import { Card, Badge, Button, Input, Avatar } from '@/components/ui/Elements';
import { getAvatarUrl, cn } from '@/lib/utils';
import { 
  Users, UserPlus, Search, Check, X, Flame, 
  Trophy, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Friend {
  id: string;
  username: string;
  displayName: string | null;
  avatarStyle: string;
  avatarSeed: string;
  level: number;
  streak: number;
  isOnline: boolean;
  friendshipId: string;
}

interface FriendRequest {
  id: string;
  sender?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarStyle: string;
    avatarSeed: string;
    level: number;
  };
  receiver?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarStyle: string;
    avatarSeed: string;
    level: number;
  };
}

export default function FriendsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const sidebarMargin = useSidebarMargin();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends);
        setReceivedRequests(data.receivedRequests);
        setSentRequests(data.sentRequests);
      }
    } catch {
      // Friends will remain empty
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchUsername.trim()) return;
    
    setIsSending(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: searchUsername }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      toast.success('Friend request sent!');
      setSearchUsername('');
      fetchFriends();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setIsSending(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch('/api/friends', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action }),
      });
      
      if (res.ok) {
        toast.success(action === 'accept' ? 'Friend added!' : 'Request declined');
        fetchFriends();
      }
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      
      <main className={`min-h-screen transition-all duration-300 ${sidebarMargin}`}>
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-cyber font-bold mb-2">Friends</h1>
            <p className="text-gray-400">Connect and compete with friends</p>
          </motion.div>

          {/* Add Friend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <h3 className="font-cyber text-lg mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-neon-cyan" />
                Add Friend
              </h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter username"
                    icon={<Search className="w-5 h-5" />}
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendFriendRequest()}
                  />
                </div>
                <Button onClick={sendFriendRequest} isLoading={isSending}>
                  Send Request
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Pending Requests */}
          {receivedRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-cyber font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Pending Requests ({receivedRequests.length})
              </h2>
              <div className="space-y-3">
                {receivedRequests.map((request) => (
                  <Card key={request.id} className="flex items-center gap-4">
                    <Avatar
                      src={getAvatarUrl(request.sender!.avatarStyle, request.sender!.avatarSeed)}
                      alt={request.sender!.username}
                      size="md"
                      level={request.sender!.level}
                    />
                    <div className="flex-1">
                      <h3 className="font-cyber">
                        {request.sender!.displayName || request.sender!.username}
                      </h3>
                      <p className="text-sm text-gray-400">@{request.sender!.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRequest(request.id, 'accept')}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRequest(request.id, 'decline')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Friends List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-cyber font-bold mb-4">
              Your Friends ({friends.length})
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="spinner" />
              </div>
            ) : friends.length === 0 ? (
              <Card className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-cyber text-gray-400 mb-2">No friends yet</h3>
                <p className="text-gray-500">Add friends to compete and learn together!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      hover 
                      className={cn(
                        'flex items-center gap-4',
                        friend.isOnline && 'ring-1 ring-green-500/30'
                      )}
                    >
                      <Avatar
                        src={getAvatarUrl(friend.avatarStyle, friend.avatarSeed)}
                        alt={friend.username}
                        size="lg"
                        level={friend.level}
                        isOnline={friend.isOnline}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-cyber truncate">
                          {friend.displayName || friend.username}
                        </h3>
                        <p className="text-sm text-gray-400">@{friend.username}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-gray-500">Lvl {friend.level}</span>
                          {friend.streak > 0 && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <Flame className="w-3 h-3" />
                              {friend.streak}
                            </span>
                          )}
                          {friend.isOnline && (
                            <Badge variant="success" size="sm">Online</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" size="sm">
                          <Trophy className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <h2 className="text-lg font-cyber text-gray-400 mb-4">
                Sent Requests ({sentRequests.length})
              </h2>
              <div className="space-y-2">
                {sentRequests.map((request) => (
                  <Card key={request.id} className="flex items-center gap-4 opacity-60">
                    <Avatar
                      src={getAvatarUrl(request.receiver!.avatarStyle, request.receiver!.avatarSeed)}
                      alt={request.receiver!.username}
                      size="sm"
                    />
                    <div className="flex-1">
                      <span className="text-sm">
                        {request.receiver!.displayName || request.receiver!.username}
                      </span>
                    </div>
                    <Badge variant="default" size="sm">Pending</Badge>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
