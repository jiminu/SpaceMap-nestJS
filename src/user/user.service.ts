import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { QueryService } from '@nestjs-query/core';
import { UserEntity } from '../entities/user.entity';

import * as bcrypt from 'bcrypt';
import { cozyLog } from '../helpers/debug';
import { MailerService } from '@nestjs-modules/mailer';
import * as randomstring from 'randomstring';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { SearchDto } from '../helpers/dto/search.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@QueryService(UserEntity)
export class UserService extends TypeOrmQueryService<UserEntity> {
  constructor (
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly mailerService: MailerService,
  ) {
    super(userRepository, { useSoftDelete: true });
  }

  async paginate (
    options: IPaginationOptions,
    searchDto: SearchDto,
  ): Promise<Pagination<UserEntity>> {
    const builder = await this.userRepository
                              .createQueryBuilder('user')
                              .where({ user_type: 'MEMBER' })
                              .orderBy(searchDto.orderByField, searchDto.orderByDirection);

    return paginate<UserEntity>(builder, options);
  }

  findAll (): Promise<UserEntity[]> {
    return this.userRepository.find();
  }

  findOneById (id: number): Promise<UserEntity> {
    return this.userRepository.findOne(id);
  }

  findOne (username: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { username } });
  }

  findOneByEmail (email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { email } });
  }

  async softDelete (id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async restore (id: number): Promise<void> {
    await this.userRepository.restore(id);
  }

  async addUser (createUserDto: CreateUserDto) {
    const hashPassword = await bcrypt.hash(
      createUserDto.password,
      await bcrypt.genSalt(),
    );
    const isMatch = await bcrypt.compare(
      createUserDto.passwordConfirm,
      hashPassword,
    );

    if (isMatch) {
      const user = new UserEntity();
      user.user_type = 'MEMBER';
      user.firstname = createUserDto.firstname;
      user.lastname = createUserDto.lastname;
      user.affiliation = createUserDto.affiliation;
      user.username = createUserDto.username;
      user.email = createUserDto.email;
      user.password = hashPassword;
      return await user.save();
    } else {
      return null;
    }
  }

  async updateUser (updateUserDto: UpdateUserDto) {
    let isMatch = false;
    let hashPassword = '';

    if (updateUserDto.password) {
      hashPassword = await bcrypt.hash(
        updateUserDto.password,
        await bcrypt.genSalt(),
      );
      isMatch = await bcrypt.compare(
        updateUserDto.passwordConfirm,
        hashPassword,
      );
    } else {
      isMatch = true;
    }

    if (isMatch) {
      const user = await this.findOne(updateUserDto.username);
      user.firstname = updateUserDto.firstname;
      user.lastname = updateUserDto.lastname;
      user.affiliation = updateUserDto.affiliation;
      if (hashPassword) {
        user.password = hashPassword;
      }
      return await user.save();
    } else {
      return null;
    }
  }

  async updatePassword (user: UserEntity, changePasswordDto: ChangePasswordDto) {
    if (await bcrypt.compare(changePasswordDto.oldPassword, user.password)) {
      const hashPassword = await bcrypt.hash(changePasswordDto.oldPassword, await bcrypt.genSalt());
      if (await bcrypt.compare(changePasswordDto.newPasswordConfirm, hashPassword)) {
        user.password = hashPassword;
      }
    }

    return await user.save();
  }

  async remove (id: number) {
    return await this.userRepository.softDelete(id);
  }

  async sendUsernameToEmail (
    email: string,
    firstname: string,
    lastname: string,
  ) {
    try {
      const user = await this.findOneByEmail(email);
      if (user.firstname === firstname && user.lastname === lastname) {
        await this.mailerService.sendMail({
          to: user.email,
          subject: '[Space Map] This is your username.',
          text: 'Username: ' + user.username,
        });
      }
    } catch (error) {
      cozyLog(error);
    }
  }

  async sendPasswordToEmail (
    username: string,
    email: string,
    firstname: string,
    lastname: string,
  ) {
    try {
      const user = await this.findOne(username);
      if (
        user.email === email &&
        user.firstname === firstname &&
        user.lastname === lastname
      ) {
        const password = randomstring.generate(7);
        user.password = await bcrypt.hash(password, await bcrypt.genSalt());
        await user.save();

        await this.mailerService.sendMail({
          to: user.email,
          subject: '[Space Map] This is your new password.',
          text: 'Password: ' + password,
        });
      }
    } catch (error) {
      cozyLog(error);
    }
  }
}
