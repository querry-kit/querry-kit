import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export enum TaskStatusDTO {
  Todo = 'TODO',
  Doing = 'DOING',
  Done = 'DONE',
}

export class UpdateTaskDTO {
  @ApiPropertyOptional({ example: 'Publish the accessibility review', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ enum: TaskStatusDTO })
  @IsOptional()
  @IsEnum(TaskStatusDTO)
  status?: TaskStatusDTO;

  @ApiPropertyOptional({ example: '7c70e340-2d39-43dd-a4c3-352fe4fb6476', nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}
