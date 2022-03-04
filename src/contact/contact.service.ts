import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { QueryService } from '@nestjs-query/core';
import { ContactEntity } from '../entities/contact.entity';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { ListResourceDto } from '../resource/dto/list-resource.dto';
import { SearchDto } from '../helpers/dto/search.dto';

@QueryService(ContactEntity)
export class ContactService extends TypeOrmQueryService<ContactEntity> {
  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: Repository<ContactEntity>,
  ) {
    super(contactRepository, { useSoftDelete: true });
  }

  create(createContactDto: CreateContactDto) {
    const contact = new ContactEntity();
    contact.name = createContactDto.name;
    contact.email = createContactDto.email;
    contact.subject = createContactDto.subject;
    contact.message = createContactDto.message;
    return contact.save();
  }

  async paginate(
    options: IPaginationOptions,
    searchDto: SearchDto,
  ): Promise<Pagination<ContactEntity>> {
    const builder = await this.contactRepository
      .createQueryBuilder('contact')
      .orderBy(searchDto.orderByField, searchDto.orderByDirection);

    return paginate<ContactEntity>(builder, options);
  }

  findAll() {
    return this.contactRepository.findAndCount();
  }

  async findOne(id: number) {
    return this.contactRepository.findOne(id);
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    const contact = await this.findOne(id);
    contact.name = updateContactDto.name;
    contact.email = updateContactDto.email;
    contact.subject = updateContactDto.subject;
    contact.message = updateContactDto.message;
    return await contact.save();
  }

  async remove(id: number) {
    await this.contactRepository.softDelete(id);
  }
}
