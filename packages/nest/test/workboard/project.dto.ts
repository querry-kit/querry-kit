import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

type MemberModel = { id: string; name: string; role: string };
type LabelModel = { id: string; name: string; color: string };
type TaskModel = {
  id: string;
  title: string;
  status: string;
  assignee?: MemberModel | null;
  labels?: LabelModel[];
};
type WorkspaceModel = { id: string; name: string; members?: MemberModel[] };
export type ProjectModel = {
  id: string;
  name: string;
  updatedAt: Date;
  workspace?: WorkspaceModel;
  tasks?: TaskModel[];
};

export class MemberDTO {
  @Expose()
  @ApiProperty({ type: String })
  id!: string;

  @Expose()
  @ApiProperty({ type: String })
  name!: string;

  @Expose()
  @ApiProperty({ enum: ['OWNER', 'EDITOR', 'VIEWER'] })
  role!: string;

  static fromModel(model: MemberModel): MemberDTO {
    return Object.assign(new MemberDTO(), model);
  }
}

export class LabelDTO {
  @Expose()
  @ApiProperty({ type: String })
  id!: string;

  @Expose()
  @ApiProperty({ type: String })
  name!: string;

  @Expose()
  @ApiProperty({ type: String })
  color!: string;

  static fromModel(model: LabelModel): LabelDTO {
    return Object.assign(new LabelDTO(), model);
  }
}

export class TaskDTO {
  @Expose()
  @ApiProperty({ type: String })
  id!: string;

  @Expose()
  @ApiProperty({ type: String })
  title!: string;

  @Expose()
  @ApiProperty({ enum: ['TODO', 'DOING', 'DONE'] })
  status!: string;

  @Expose()
  @ApiProperty({ type: () => MemberDTO, required: false })
  assignee?: MemberDTO;

  @Expose()
  @ApiProperty({ type: () => [LabelDTO], required: false })
  labels?: LabelDTO[];

  static fromModel(model: TaskModel): TaskDTO {
    return Object.assign(new TaskDTO(), {
      ...model,
      assignee: model.assignee ? MemberDTO.fromModel(model.assignee) : undefined,
      labels: model.labels?.map(LabelDTO.fromModel),
    });
  }
}

export class WorkspaceDTO {
  @Expose()
  @ApiProperty({ type: String })
  id!: string;

  @Expose()
  @ApiProperty({ type: String })
  name!: string;

  @Expose()
  @ApiProperty({ type: () => [MemberDTO], required: false })
  members?: MemberDTO[];

  static fromModel(model: WorkspaceModel): WorkspaceDTO {
    return Object.assign(new WorkspaceDTO(), {
      ...model,
      members: model.members?.map(MemberDTO.fromModel),
    });
  }
}

export class ProjectDTO {
  @Expose()
  @ApiProperty({ type: String })
  id!: string;

  @Expose()
  @ApiProperty({ type: String })
  name!: string;

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @Expose()
  @ApiProperty({ type: () => WorkspaceDTO, required: false })
  workspace?: WorkspaceDTO;

  @Expose()
  @ApiProperty({ type: () => [TaskDTO], required: false })
  tasks?: TaskDTO[];

  static fromModel(model: ProjectModel): ProjectDTO {
    return Object.assign(new ProjectDTO(), {
      ...model,
      updatedAt: model.updatedAt.toISOString(),
      workspace: model.workspace ? WorkspaceDTO.fromModel(model.workspace) : undefined,
      tasks: model.tasks?.map(TaskDTO.fromModel),
    });
  }
}
