type Props = {
  workspace: {
    id: string;
    name: string;
  };

  memberCount: number;
};

export function TeamHeader({ workspace, memberCount }: Props) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">
        Workspace
      </p>

      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Team
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          {workspace.name}
        </span>

        <span>•</span>

        <span>
          {memberCount}{" "}
          {memberCount === 1
            ? "member"
            : "members"}
        </span>
      </div>
    </div>
  );
}
