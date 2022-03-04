export class ListResourceDto {
  orderByField: string;
  orderByDirection: 'ASC' | 'DESC';
  searchField?: string;
  searchKeyword?: string;
}
