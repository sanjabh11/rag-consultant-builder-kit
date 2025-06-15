
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Settings, Shield, Eye, Edit } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActivity: string;
}

interface Project {
  id: string;
  name: string;
  domain: string;
  members: TeamMember[];
}

const ROLE_PERMISSIONS = {
  owner: ['read', 'write', 'admin', 'billing'],
  admin: ['read', 'write', 'admin'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

const TeamCollaboration: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('viewer');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectMembers();
  }, [projectId]);

  const fetchProjectMembers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-project-members', {
        body: { projectId },
      });
      if (error) throw error;
      setProject(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: {
          projectId,
          email: inviteEmail,
          role: inviteRole,
        },
      });
      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteEmail('');
      setIsInviteOpen(false);
      fetchProjectMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      const { error } = await supabase.functions.invoke('update-member-role', {
        body: {
          projectId,
          memberId,
          role: newRole,
        },
      });
      if (error) throw error;

      toast({
        title: "Role Updated",
        description: "Member role updated successfully",
      });

      fetchProjectMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase.functions.invoke('remove-team-member', {
        body: { projectId, memberId },
      });
      if (error) throw error;

      toast({
        title: "Member Removed",
        description: "Team member removed successfully",
      });

      fetchProjectMembers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner':
        return <Shield className="h-4 w-4" />;
      case 'admin':
        return <Settings className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'editor': return 'outline';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div>Loading team members...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const currentUserMember = project.members.find(m => m.email === user?.email);
  const canManageTeam = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({project.members.length})
            </CardTitle>
            {canManageTeam && (
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
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
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <Select value={inviteRole} onValueChange={(value: TeamMember['role']) => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer - Read only access</SelectItem>
                          <SelectItem value="editor">Editor - Can edit content</SelectItem>
                          <SelectItem value="admin">Admin - Full project access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={inviteMember} className="w-full">
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name || member.email}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role) as any} className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>

                  {canManageTeam && member.role !== 'owner' && member.id !== user?.id && (
                    <div className="flex gap-1">
                      <Select
                        value={member.role}
                        onValueChange={(value: TeamMember['role']) => updateMemberRole(member.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeMember(member.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
              <div key={role} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getRoleIcon(role as TeamMember['role'])}
                  <span className="font-medium capitalize">{role}</span>
                </div>
                <ul className="text-sm space-y-1">
                  {permissions.map((permission) => (
                    <li key={permission} className="text-muted-foreground">
                      • {permission.charAt(0).toUpperCase() + permission.slice(1)} access
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamCollaboration;
