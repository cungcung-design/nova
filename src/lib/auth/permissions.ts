export type Role =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "MEMBER"
  | "VIEWER";

export type Permission =
  | "users.read"
  | "users.write"
  | "users.delete"
  | "billing.read"
  | "billing.write"
  | "orders.read"
  | "orders.write"
  | "customers.read"
  | "customers.write"
  | "products.read"
  | "products.write"
  | "audit.read";

const permissions: Record<Role, Permission[]> = {
  OWNER: [
    "users.read",
    "users.write",
    "users.delete",
    "billing.read",
    "billing.write",
    "orders.read",
    "orders.write",
    "customers.read",
    "customers.write",
    "products.read",
    "products.write",
    "audit.read",
  ],
  ADMIN: [
    "users.read",
    "users.write",
    "users.delete",
    "billing.read",
    "billing.write",
    "orders.read",
    "orders.write",
    "customers.read",
    "customers.write",
    "products.read",
    "products.write",
    "audit.read",
  ],
  MANAGER: [
    "users.read",
    "orders.read",
    "orders.write",
    "customers.read",
    "customers.write",
    "products.read",
    "products.write",
  ],
  MEMBER: [
    "orders.read",
    "orders.write",
    "customers.read",
    "customers.write",
    "products.read",
  ],
  VIEWER: [
    "orders.read",
    "customers.read",
    "products.read",
  ],
};

export function hasPermission(role: Role, permission: Permission) {
  return permissions[role].includes(permission);
}
