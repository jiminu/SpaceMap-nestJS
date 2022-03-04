import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeUserDate1624440047951 implements MigrationInterface {
  name = 'changeUserDate1624440047951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `created_at`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
    );
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `modified_at`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `modified_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `modified_at`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `modified_at` timestamp(0) NOT NULL',
    );
    await queryRunner.query('ALTER TABLE `user` DROP COLUMN `created_at`');
    await queryRunner.query(
      'ALTER TABLE `user` ADD `created_at` timestamp(0) NOT NULL',
    );
  }
}
