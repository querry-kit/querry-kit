import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateProjectDTO {
  @ApiProperty({ example: 'Mobile redesign', maxLength: 160 })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: '7c70e340-2d39-43dd-a4c3-352fe4fb6476' })
  @IsUUID()
  workspaceId!: string;
}
