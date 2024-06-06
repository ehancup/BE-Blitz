import { HttpStatus } from '@nestjs/common';

export interface ResponseSuccess {
  statusCode?: HttpStatus;
  status: string;
  message: string;
  data?: any;
}

export interface ResponsePagination extends ResponseSuccess {
  pagination: {
    totalPage?: number;
    total: number;
    page: number;
    pageSize: number;
  };
}
