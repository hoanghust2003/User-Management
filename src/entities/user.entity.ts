import { AfterLoad, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { UserGroup } from './user-group.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({select: false})
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true }) 
  profileImage: string;

  @AfterLoad()
  updateProfileImageURL() {
      if (this.profileImage) {
          const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;
          this.profileImage = `${baseUrl}/uploads/${this.profileImage}`;
      }
  }

  @OneToMany(() => UserGroup, (userGroup) => userGroup.user)
  userGroups: UserGroup[];
  
}
