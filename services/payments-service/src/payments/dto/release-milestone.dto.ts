import { IsUUID, IsNotEmpty } from 'class-validator';

export class ReleaseMilestoneDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @IsUUID()
  @IsNotEmpty()
  milestoneId: string;
}
