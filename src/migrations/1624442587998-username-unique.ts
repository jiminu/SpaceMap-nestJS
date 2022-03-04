import { MigrationInterface, QueryRunner } from 'typeorm';

export class usernameUnique1624442587998 implements MigrationInterface {
  name = 'usernameUnique1624442587998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` ADD UNIQUE INDEX `IDX_78a916df40e02a9deb1c4b75ed` (`username`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` DROP INDEX `IDX_78a916df40e02a9deb1c4b75ed`',
    );
  }
}
