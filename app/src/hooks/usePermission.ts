import { useAuth } from '@/hooks/useAuth';
import { currentUserId as fallbackUserId, currentUserRole as fallbackRole } from '@/data/mockData';
import type { Permission } from '@/types';

export function usePermission() {
  const { user } = useAuth();
  const userId = user?.id ?? fallbackUserId;
  const userRole = user?.userRole ?? fallbackRole;
  const isAdmin = userRole === 'admin';

  function getTaskPermission(assigneeId: string, editors: string[]): Permission {
    const canEdit = isAdmin || editors.includes(userId);
    const canTransfer = isAdmin || assigneeId === userId;

    return {
      canEdit,
      canDelete: isAdmin,
      canTransfer,
      canDownloadCode: isAdmin,
      canUploadCode: isAdmin || editors.includes(userId),
      canManageMembers: isAdmin,
      canViewAll: isAdmin,
    };
  }

  function getCodePermission(): Permission {
    return {
      canEdit: isAdmin,
      canDelete: isAdmin,
      canTransfer: isAdmin,
      canDownloadCode: isAdmin,
      canUploadCode: true,
      canManageMembers: isAdmin,
      canViewAll: isAdmin,
    };
  }

  return { userId, userRole, isAdmin, getTaskPermission, getCodePermission };
}