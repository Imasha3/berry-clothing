import { allPermissions } from "@/data/mockUsers";

export interface MockPermissionEntry {
  id: string;
  key: string;
  module: string;
  description: string;
}

export const mockPermissions: MockPermissionEntry[] = allPermissions.map((permission) => {
  const [module, action] = permission.split(".");

  return {
    id: permission,
    key: permission,
    module,
    description: `${module.replace("_", " ")} ${action} permission`
  };
});
