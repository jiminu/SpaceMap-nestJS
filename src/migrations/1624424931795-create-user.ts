import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUser1624424931795 implements MigrationInterface {
  name = 'createUser1624424931795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `created_at` timestamp NOT NULL, `modified_at` timestamp NOT NULL, `user_type` varchar(255) NOT NULL, `username` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `last_logged_at` timestamp NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `user`');
  }
}
