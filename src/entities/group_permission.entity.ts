import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Group } from './group.entity';

@Entity('group_permission')
export class GroupPermission {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => Group, (group) => group.groupPermissions, { onDelete: 'CASCADE' })
  group: Group;

  @Column()
  permission: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}