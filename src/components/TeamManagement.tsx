
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeCollaboration } from '@/hooks/useRealTimeCollaboration';
import { useInputValidation, TeamInviteSchema } from '@/hooks/useInputValidation';
import { Users, UserPlus, Settings, Crown, Edit, Eye, Trash2, MessageSquare } from 'lucide-react';

interface TeamManagementProps {
  projectId: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ projectId }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  
  const {
    collaborators,
    recentEvents,
    permissions,
    shareProject,
    removeCollaborator,
    sendChatMessage
  } = useRealTimeCollaboration(projectId);
  
  const { validateAndToast } = useInputValidation();

  const handleInvite = async () => {
    const validData = validateAndToast(TeamInviteSchema, {
      email: inviteEmail,
      role: inviteRole,
      projectId
    });

    if (validData) {
      await shareProject(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
      setIsInviteDialogOpen(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'editor': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Team Management
        </h2>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Viewer - Can view and comment
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editor - Can edit and manage content
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Admin - Full access and management
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleInvite} className="w-full">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Collaborators ({collaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback>
                          {collaborator.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium">{collaborator.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {collaborator.isOnline ? (
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Online
                            </span>
                          ) : (
                            `Last seen ${new Date(collaborator.lastSeen).toLocaleString()}`
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {collaborator.currentView && (
                        <Badge variant="outline" className="text-xs">
                          {collaborator.currentView}
                        </Badge>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {collaborators.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active collaborators</p>
                    <p className="text-sm">Invite team members to start collaborating</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {event.type === 'user_join' && <UserPlus className="h-4 w-4 text-green-600" />}
                      {event.type === 'user_leave' && <UserPlus className="h-4 w-4 text-red-600 rotate-180" />}
                      {event.type === 'chat_message' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                      {event.type === 'document_edit' && <Edit className="h-4 w-4 text-purple-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm">
                        {event.type === 'user_join' && `${event.data.displayName} joined the session`}
                        {event.type === 'user_leave' && `User left the session`}
                        {event.type === 'chat_message' && `Message: ${event.data.message}`}
                        {event.type === 'document_edit' && `Document was edited`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {permission.userId.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium">{permission.userId}</div>
                        <div className="text-sm text-muted-foreground">
                          Granted {new Date(permission.grantedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(permission.role)}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(permission.role)}
                          {permission.role}
                        </div>
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaborator(permission.userId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {permissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No permissions configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamManagement;
