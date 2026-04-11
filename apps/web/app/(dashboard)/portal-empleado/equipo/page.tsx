'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  UsersRound,
  UserPlus,
  Shield,
  Clock,
  Loader2,
  Mail,
  MoreVertical,
  UserMinus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  OWNER: { label: 'Propietario', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  MANAGER: { label: 'Gerente', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  STAFF: { label: 'Staff', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  VIEWER: { label: 'Solo lectura', color: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300' },
};

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  image: string | null;
  employeeRole: string;
  isActive: boolean;
  userId: string | null;
  user: { lastLoginAt: string | null } | null;
  createdAt: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  employee: { id: string; name: string };
}

export default function EquipoPage() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwner = session?.user?.role === 'OWNER' || session?.user?.employeeRole === 'OWNER';

  // Invite dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmployeeId, setInviteEmployeeId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('STAFF');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Revoke dialog
  const [revokeTarget, setRevokeTarget] = useState<TeamMember | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Role change dialog
  const [roleChangeTarget, setRoleChangeTarget] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState('');
  const [changingRole, setChangingRole] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken);
      const [teamData, invitationsData] = await Promise.all([
        api.employeePortal.getTeam(),
        api.employeePortal.getPendingInvitations(),
      ]);
      setTeam(teamData);
      setInvitations(invitationsData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async () => {
    if (!session?.accessToken) return;
    setInviting(true);
    setInviteError('');
    try {
      const api = createApiClient(session.accessToken);
      await api.employeePortal.inviteEmployee({
        employeeId: inviteEmployeeId,
        email: inviteEmail,
        role: inviteRole,
      });
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteEmployeeId('');
      fetchData();
    } catch (error: any) {
      setInviteError(error?.message || 'Error al enviar invitación');
      handleApiError(error);
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async () => {
    if (!session?.accessToken || !revokeTarget) return;
    setRevoking(true);
    try {
      const api = createApiClient(session.accessToken);
      await api.employeePortal.revokeAccess(revokeTarget.id);
      setRevokeTarget(null);
      fetchData();
    } catch (error) {
      handleApiError(error);
    } finally {
      setRevoking(false);
    }
  };

  const handleRoleChange = async () => {
    if (!session?.accessToken || !roleChangeTarget || !newRole) return;
    setChangingRole(true);
    try {
      const api = createApiClient(session.accessToken);
      await api.employeePortal.changeRole(roleChangeTarget.id, newRole);
      setRoleChangeTarget(null);
      fetchData();
    } catch (error) {
      handleApiError(error);
    } finally {
      setChangingRole(false);
    }
  };

  // Employees without user account (can be invited)
  const uninvitedEmployees = team.filter(m => !m.userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Equipo</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona el acceso de tu equipo al portal</p>
        </div>
        {uninvitedEmployees.length > 0 && (
          <Button size="sm" onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar
          </Button>
        )}
      </div>

      {/* Team Members */}
      <div className="space-y-2">
        {team.map((member) => {
          const roleCfg = ROLE_CONFIG[member.employeeRole] || ROLE_CONFIG.STAFF;
          const hasAccount = !!member.userId;

          return (
            <Card key={member.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold',
                    hasAccount ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <Badge className={cn('text-[10px] h-5', roleCfg.color)}>
                        {roleCfg.label}
                      </Badge>
                      {!hasAccount && (
                        <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">
                          Sin acceso
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {member.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {member.email}
                        </span>
                      )}
                      {hasAccount && member.user?.lastLoginAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Último acceso: {new Date(member.user.lastLoginAt).toLocaleDateString('es-AR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {hasAccount && member.employeeRole !== 'OWNER' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && (
                        <DropdownMenuItem onClick={() => {
                          setRoleChangeTarget(member);
                          setNewRole(member.employeeRole);
                        }}>
                          <Shield className="h-4 w-4 mr-2" />
                          Cambiar rol
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setRevokeTarget(member)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Revocar acceso
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">
            Invitaciones pendientes ({invitations.length})
          </h2>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <Card key={inv.id} className="border-dashed">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.email} · {ROLE_CONFIG[inv.role]?.label || inv.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expira {new Date(inv.expiresAt).toLocaleDateString('es-AR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar empleado al portal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Empleado</Label>
              <select
                className="w-full h-9 px-3 border rounded-md bg-background text-sm"
                value={inviteEmployeeId}
                onChange={(e) => setInviteEmployeeId(e.target.value)}
              >
                <option value="">Seleccionar empleado...</option>
                {uninvitedEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="empleado@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Rol</Label>
              <select
                className="w-full h-9 px-3 border rounded-md bg-background text-sm"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Gerente</option>
                <option value="VIEWER">Solo lectura</option>
                {isOwner && <option value="OWNER">Propietario</option>}
              </select>
            </div>
            {inviteError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {inviteError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleInvite}
              disabled={inviting || !inviteEmployeeId || !inviteEmail}
            >
              {inviting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <AlertDialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar acceso de {revokeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desvinculará su cuenta del portal. No podrá acceder hasta que sea invitado nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-red-600 hover:bg-red-700"
              disabled={revoking}
            >
              {revoking ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Revocar acceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <Dialog open={!!roleChangeTarget} onOpenChange={() => setRoleChangeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar rol de {roleChangeTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
              <label
                key={role}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  newRole === role ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={newRole === role}
                  onChange={() => setNewRole(role)}
                  className="sr-only"
                />
                <Badge className={cn('text-xs', cfg.color)}>{cfg.label}</Badge>
                <div className={cn(
                  'ml-auto h-4 w-4 rounded-full border-2',
                  newRole === role ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                )} />
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeTarget(null)}>Cancelar</Button>
            <Button onClick={handleRoleChange} disabled={changingRole || newRole === roleChangeTarget?.employeeRole}>
              {changingRole ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
