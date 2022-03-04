import {MigrationInterface, QueryRunner} from "typeorm";

export class resource1641814931211 implements MigrationInterface {
    name = 'resource1641814931211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`resource\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`modified_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`content\` longtext NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`resource_file\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`modified_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`origin_name\` varchar(255) NOT NULL, \`filename\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`size\` int NOT NULL, \`resourceId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`contact\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`last_logged_at\` \`last_logged_at\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`resource\` ADD CONSTRAINT \`FK_77a300816e77fa9fdca6879c4d1\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`resource_file\` ADD CONSTRAINT \`FK_782bcee591cfef5d44f2c412eed\` FOREIGN KEY (\`resourceId\`) REFERENCES \`resource\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`resource_file\` DROP FOREIGN KEY \`FK_782bcee591cfef5d44f2c412eed\``);
        await queryRunner.query(`ALTER TABLE \`resource\` DROP FOREIGN KEY \`FK_77a300816e77fa9fdca6879c4d1\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`last_logged_at\` \`last_logged_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`contact\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`resource_file\``);
        await queryRunner.query(`DROP TABLE \`resource\``);
    }

}
