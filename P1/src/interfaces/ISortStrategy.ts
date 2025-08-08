import { IProduct } from './IProduct';


export interface ISortStrategy {
  ordenar(productos: IProduct[]): IProduct[];
}