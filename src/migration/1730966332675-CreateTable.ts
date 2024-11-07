import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1730966332675 implements MigrationInterface {
    name = 'CreateTable1730966332675'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('user', 'admin', 'superadmin') NOT NULL DEFAULT 'user', \`profileImage\` varchar(255) NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`permission\` enum ('view_list_users', 'update_other_user_image', 'view_other_user', 'update_other_user', 'delete_other_user', 'change_other_user_password', 'view_list_groups', 'create_group', 'view_group', 'update_group', 'delete_group', 'add_member_to_group', 'remove_member_from_group', 'add_permissions_to_group', 'remove_permissions_from_group', 'register') NOT NULL, \`groupId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_8a45300fd825918f3b40195fbd\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_group\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NULL, \`groupId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`group_permission\` ADD CONSTRAINT \`FK_fcdab8fc34786128955f90572cb\` FOREIGN KEY (\`groupId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_group\` ADD CONSTRAINT \`FK_3d6b372788ab01be58853003c93\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_group\` ADD CONSTRAINT \`FK_31e541c93fdc0bb63cfde6549b7\` FOREIGN KEY (\`groupId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_group\` DROP FOREIGN KEY \`FK_31e541c93fdc0bb63cfde6549b7\``);
        await queryRunner.query(`ALTER TABLE \`user_group\` DROP FOREIGN KEY \`FK_3d6b372788ab01be58853003c93\``);
        await queryRunner.query(`ALTER TABLE \`group_permission\` DROP FOREIGN KEY \`FK_fcdab8fc34786128955f90572cb\``);
        await queryRunner.query(`DROP TABLE \`user_group\``);
        await queryRunner.query(`DROP INDEX \`IDX_8a45300fd825918f3b40195fbd\` ON \`group\``);
        await queryRunner.query(`DROP TABLE \`group\``);
        await queryRunner.query(`DROP TABLE \`group_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
