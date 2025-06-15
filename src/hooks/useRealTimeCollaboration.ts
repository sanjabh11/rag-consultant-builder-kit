
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CollaborationUser {
  id: string;
  displayName: string;
  avatar?: string;
  lastSeen: string;
  isOnline: boolean;
  cursor?: { x: number; y: number };
  currentView?: string;
}

interface CollaborationEvent {
  id: string;
  type: 'document_edit' | 'cursor_move' | 'chat_message' | 'user_join' | 'user_leave';
  userId: string;
  timestamp: string;
  data: any;
}

interface SharePermission {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  grantedAt: string;
  grantedBy: string;
}

export const useRealTimeCollaboration = (projectId: string) => {
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [recentEvents, setRecentEvents] = useState<CollaborationEvent[]>([]);
  const [permissions, setPermissions] = useState<SharePermission[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Simulated real-time collaboration using localStorage and polling
  useEffect(() => {
    if (!projectId || !user) return;

    const channelKey = `collaboration_${projectId}`;
    setIsConnected(true);

    // Join the collaboration session
    joinSession();

    // Set up periodic sync
    const syncInterval = setInterval(() => {
      syncCollaborationData();
    }, 2000);

    // Set up storage event listener for cross-tab communication
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === channelKey) {
        syncCollaborationData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup on unmount
    return () => {
      leaveSession();
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      setIsConnected(false);
    };
  }, [projectId, user]);

  const joinSession = useCallback(() => {
    if (!user) return;

    const sessionData = getSessionData();
    const userSession: CollaborationUser = {
      id: user.id,
      displayName: user.user_metadata?.display_name || user.email || 'Anonymous',
      avatar: user.user_metadata?.avatar_url,
      lastSeen: new Date().toISOString(),
      isOnline: true,
      currentView: window.location.pathname
    };

    const updatedCollaborators = sessionData.collaborators.filter(c => c.id !== user.id);
    updatedCollaborators.push(userSession);

    const event: CollaborationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user_join',
      userId: user.id,
      timestamp: new Date().toISOString(),
      data: { displayName: userSession.displayName }
    };

    saveSessionData({
      ...sessionData,
      collaborators: updatedCollaborators,
      events: [event, ...sessionData.events.slice(0, 49)]
    });

    toast({
      title: "Collaboration started",
      description: "You've joined the collaboration session",
    });
  }, [user, toast]);

  const leaveSession = useCallback(() => {
    if (!user) return;

    const sessionData = getSessionData();
    const updatedCollaborators = sessionData.collaborators.filter(c => c.id !== user.id);

    const event: CollaborationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user_leave',
      userId: user.id,
      timestamp: new Date().toISOString(),
      data: {}
    };

    saveSessionData({
      ...sessionData,
      collaborators: updatedCollaborators,
      events: [event, ...sessionData.events.slice(0, 49)]
    });
  }, [user]);

  const syncCollaborationData = useCallback(() => {
    const sessionData = getSessionData();
    
    // Remove users who haven't been seen in 30 seconds
    const activeCollaborators = sessionData.collaborators.filter(
      c => new Date(c.lastSeen) > new Date(Date.now() - 30000)
    );

    setCollaborators(activeCollaborators);
    setRecentEvents(sessionData.events.slice(0, 20));
    setPermissions(sessionData.permissions || []);
  }, []);

  const getSessionData = () => {
    const data = localStorage.getItem(`collaboration_${projectId}`);
    return data ? JSON.parse(data) : {
      collaborators: [],
      events: [],
      permissions: []
    };
  };

  const saveSessionData = (data: any) => {
    localStorage.setItem(`collaboration_${projectId}`, JSON.stringify(data));
  };

  const updateCursor = useCallback((x: number, y: number) => {
    if (!user) return;

    const sessionData = getSessionData();
    const updatedCollaborators = sessionData.collaborators.map((c: CollaborationUser) =>
      c.id === user.id ? { ...c, cursor: { x, y }, lastSeen: new Date().toISOString() } : c
    );

    saveSessionData({
      ...sessionData,
      collaborators: updatedCollaborators
    });
  }, [user]);

  const sendChatMessage = useCallback((message: string) => {
    if (!user) return;

    const event: CollaborationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'chat_message',
      userId: user.id,
      timestamp: new Date().toISOString(),
      data: { message }
    };

    const sessionData = getSessionData();
    saveSessionData({
      ...sessionData,
      events: [event, ...sessionData.events.slice(0, 49)]
    });

    toast({
      title: "Message sent",
      description: "Your message has been shared with collaborators",
    });
  }, [user, toast]);

  const shareProject = useCallback(async (email: string, role: 'viewer' | 'editor' | 'admin') => {
    if (!user) return;

    // In a real implementation, this would send an email invitation
    const permission: SharePermission = {
      userId: `user_${email}`, // This would be the actual user ID
      role,
      grantedAt: new Date().toISOString(),
      grantedBy: user.id
    };

    const sessionData = getSessionData();
    const updatedPermissions = [...(sessionData.permissions || []), permission];

    saveSessionData({
      ...sessionData,
      permissions: updatedPermissions
    });

    toast({
      title: "Invitation sent",
      description: `Invited ${email} as ${role}`,
    });
  }, [user, toast]);

  const removeCollaborator = useCallback((userId: string) => {
    const sessionData = getSessionData();
    const updatedPermissions = sessionData.permissions.filter(
      (p: SharePermission) => p.userId !== userId
    );

    saveSessionData({
      ...sessionData,
      permissions: updatedPermissions
    });

    toast({
      title: "Collaborator removed",
      description: "User access has been revoked",
    });
  }, [toast]);

  const updateHeartbeat = useCallback(() => {
    if (!user) return;

    const sessionData = getSessionData();
    const updatedCollaborators = sessionData.collaborators.map((c: CollaborationUser) =>
      c.id === user.id ? { ...c, lastSeen: new Date().toISOString() } : c
    );

    saveSessionData({
      ...sessionData,
      collaborators: updatedCollaborators
    });
  }, [user]);

  // Update heartbeat every 10 seconds
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(updateHeartbeat, 10000);
    return () => clearInterval(heartbeatInterval);
  }, [isConnected, updateHeartbeat]);

  return {
    collaborators,
    recentEvents,
    permissions,
    isConnected,
    updateCursor,
    sendChatMessage,
    shareProject,
    removeCollaborator
  };
};
