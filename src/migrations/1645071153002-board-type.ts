import {MigrationInterface, QueryRunner} from "typeorm";

export class boardType1645071153002 implements MigrationInterface {
    name = 'boardType1645071153002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`resource\` ADD \`board_type\` varchar(255) NOT NULL DEFAULT 'document'`);
        await queryRunner.query(`ALTER TABLE \`contact\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`last_logged_at\` \`last_logged_at\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`resource\` DROP FOREIGN KEY \`FK_77a300816e77fa9fdca6879c4d1\``);
        await queryRunner.query(`ALTER TABLE \`resource\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`resource\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`resource_file\` DROP FOREIGN KEY \`FK_782bcee591cfef5d44f2c412eed\``);
        await queryRunner.query(`ALTER TABLE \`resource_file\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`resource_file\` CHANGE \`resourceId\` \`resourceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`resource\` ADD CONSTRAINT \`FK_77a300816e77fa9fdca6879c4d1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`resource_file\` ADD CONSTRAINT \`FK_782bcee591cfef5d44f2c412eed\` FOREIGN KEY (\`resourceId\`) REFERENCES \`resource\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`resource_file\` DROP FOREIGN KEY \`FK_782bcee591cfef5d44f2c412eed\``);
        await queryRunner.query(`ALTER TABLE \`resource\` DROP FOREIGN KEY \`FK_77a300816e77fa9fdca6879c4d1\``);
        await queryRunner.query(`ALTER TABLE \`resource_file\` CHANGE \`resourceId\` \`resourceId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`resource_file\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`resource_file\` ADD CONSTRAINT \`FK_782bcee591cfef5d44f2c412eed\` FOREIGN KEY (\`resourceId\`) REFERENCES \`resource\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`resource\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`resource\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`resource\` ADD CONSTRAINT \`FK_77a300816e77fa9fdca6879c4d1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`last_logged_at\` \`last_logged_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`contact\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`resource\` DROP COLUMN \`board_type\``);
    }

}
