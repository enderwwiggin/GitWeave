import { currentUserId, currentUserRole } from '@/data/mockData';
import type { Permission } from '@/types';

export function usePermission() {
  const userId = currentUserId;
  const userRole = currentUserRole;
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
