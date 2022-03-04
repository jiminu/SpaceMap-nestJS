export class SearchDto {
  boardType?: string;
  orderByField?: string;
  orderByDirection?: 'ASC' | 'DESC';
  searchField?: string;
  searchKeyword?: string;
}
