import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Group } from './group.entity';
import { Permissions } from './permissions.enum';

@Entity('group_permission')
export class GroupPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.groupPermissions, { onDelete: 'CASCADE' })
  group: Group;

  @Column({
    type: 'varchar',
  })
  permission: string;

  // @Column({ type: 'boolean', default: true })
  // is_active: boolean;
}