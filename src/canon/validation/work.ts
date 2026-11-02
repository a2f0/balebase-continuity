import type { Issue } from "../types";
import { type Context, inOrder, pastDate, present } from "./context";

// Projects, the audits run on them, and the issues those audits raised.

function checkProjects(ctx: Context): string[] {
  const { world } = ctx;
  return world.projects.flatMap((project) => {
    const client = world.counterparties.find(
      (party) => party.id === project.client,
    );
    return [
      ...present(
        client?.kind === "client"
          ? undefined
          : `project ${project.id} client ${project.client} is not a client`,
        pastDate(world, `project ${project.id} started`, project.startedOn),
      ),
      ...project.members
        .filter((member) => !ctx.members.has(member))
        .map((member) => `project ${project.id} lists non-member ${member}`),
    ];
  });
}

function checkAudits(ctx: Context): string[] {
  const { world } = ctx;
  return world.audits.flatMap((audit) => {
    const project = world.projects.find((item) => item.id === audit.project);
    if (!project) {
      return [`audit ${audit.id} project ${audit.project} does not exist`];
    }
    return present(
      project.forms.includes(audit.form)
        ? undefined
        : `audit ${audit.id} uses ${audit.form}, which ${project.id} has not turned on`,
      project.members.includes(audit.startedBy)
        ? undefined
        : `audit ${audit.id} was started by ${audit.startedBy}, who is not on ${project.id}`,
      inOrder(
        `audit ${audit.id} predates its project`,
        project.startedOn,
        audit.startedOn,
      ),
      pastDate(world, `audit ${audit.id} started`, audit.startedOn),
      audit.completedOn
        ? inOrder(
            `audit ${audit.id} completed before it started`,
            audit.startedOn,
            audit.completedOn,
          )
        : undefined,
      audit.completedOn
        ? pastDate(world, `audit ${audit.id} completed`, audit.completedOn)
        : undefined,
    );
  });
}

function checkAuditIssue(ctx: Context, issue: Issue): string[] {
  const { world } = ctx;
  const audit = world.audits.find((item) => item.id === issue.audit);
  if (!audit) {
    return [`issue ${issue.id} audit ${issue.audit} does not exist`];
  }
  const project = world.projects.find((item) => item.id === audit.project);
  const crew = new Set(project?.members ?? []);
  return present(
    inOrder(
      `issue ${issue.id} was raised before its audit`,
      audit.startedOn,
      issue.raisedOn,
    ),
    audit.completedOn
      ? inOrder(
          `issue ${issue.id} was raised after its audit completed`,
          issue.raisedOn,
          audit.completedOn,
        )
      : undefined,
    crew.has(issue.raisedBy)
      ? undefined
      : `issue ${issue.id} was raised by ${issue.raisedBy}, who is not on ${audit.project}`,
    issue.assignee === null || crew.has(issue.assignee)
      ? undefined
      : `issue ${issue.id} is assigned to ${issue.assignee}, who is not on ${audit.project}`,
  );
}

function checkIssue(ctx: Context, issue: Issue): string[] {
  const { world } = ctx;
  return [
    ...present(
      ctx.members.has(issue.raisedBy)
        ? undefined
        : `issue ${issue.id} was raised by non-member ${issue.raisedBy}`,
      issue.assignee === null || ctx.members.has(issue.assignee)
        ? undefined
        : `issue ${issue.id} is assigned to non-member ${issue.assignee}`,
      pastDate(world, `issue ${issue.id} raised`, issue.raisedOn),
      issue.resolvedOn
        ? inOrder(
            `issue ${issue.id} resolved before it was raised`,
            issue.raisedOn,
            issue.resolvedOn,
          )
        : undefined,
      issue.resolvedOn
        ? pastDate(world, `issue ${issue.id} resolved`, issue.resolvedOn)
        : undefined,
    ),
    ...(issue.audit ? checkAuditIssue(ctx, issue) : []),
  ];
}

export function checkWork(ctx: Context): string[] {
  return [
    ...checkProjects(ctx),
    ...checkAudits(ctx),
    ...ctx.world.issues.flatMap((issue) => checkIssue(ctx, issue)),
  ];
}
