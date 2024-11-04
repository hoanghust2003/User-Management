import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { GroupPermission } from './group_permission.entity';
import { UserGroup } from './user_group.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description:string;

  @OneToMany(() => GroupPermission, (groupPermission) => groupPermission.group)
  groupPermissions: GroupPermission[];

  @OneToMany(() => UserGroup, (userGroup) => userGroup.group)
  userGroups: UserGroup[];
}
