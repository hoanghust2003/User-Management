import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user_role.enum';
import { UserGroup } from './user_group.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true }) 
  profileImage: string;

  @OneToMany(() => UserGroup, (userGroup) => userGroup.user)
  userGroups: UserGroup[];
}
