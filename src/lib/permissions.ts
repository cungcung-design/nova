import { UserRole } from "@prisma/client";

export const permissions = {
  workspace: {
    view: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.MEMBER,
      UserRole.VIEWER,
    ],

    update: [
      UserRole.OWNER,
      UserRole.ADMIN,
    ],

    delete: [
      UserRole.OWNER,
    ],
  },

  customers: {
    view: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.MEMBER,
      UserRole.VIEWER,
    ],

    create: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.MEMBER,
    ],

    update: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
    ],

    delete: [
      UserRole.OWNER,
      UserRole.ADMIN,
    ],
  },

  products: {
    view: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.MEMBER,
      UserRole.VIEWER,
    ],

    create: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
    ],

    update: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
    ],

    delete: [
      UserRole.OWNER,
      UserRole.ADMIN,
    ],
  },

  orders: {
    view: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.MEMBER,
      UserRole.VIEWER,
    ],

    create: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.MEMBER,
    ],

    update: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
    ],

    delete: [
      UserRole.OWNER,
      UserRole.ADMIN,
    ],
  },

  team: {
    view: [
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MANAGER,
    ],

    invite: [
      UserRole.OWNER,
      UserRole.ADMIN,
    ],

    updateRole: [
      UserRole.OWNER,
      UserRole.ADMIN,
    ],

    remove: [
      UserRole.OWNER,
    ],
  },

  billing: {
    view: [
      UserRole.OWNER,
      UserRole.ADMIN,
    ],

    manage: [
      UserRole.OWNER,
    ],
  },
} as const;

export function hasPermission(
  role: UserRole,
  allowedRoles: readonly UserRole[],
) {
  return allowedRoles.includes(role);
}
