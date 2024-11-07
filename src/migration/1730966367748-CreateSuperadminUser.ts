import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';

export class CreateSuperadminUser1730966367748 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash('superadmin_password', 10); // Replace with actual password

        await queryRunner.query(`
            INSERT INTO user (username, password, role)
            VALUES ('Superadmin', '${hashedPassword}', 'superadmin');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM user WHERE username = 'Superadmin';
        `);
    }
}
