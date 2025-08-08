import { IProduct } from '../interfaces/IProduct';
import { IRepository } from '../interfaces/IRepository';
import { Product } from '../models/Product';

/**
 * Repositorio en memoria para productos
 * Principio: Single Responsibility - Solo maneja el almacenamiento de productos
 */
export class ProductRepository implements IRepository<IProduct> {
  private productos: IProduct[] = [];

  /**
   * Agrega un producto al repositorio
   */
  agregar(producto: IProduct): void {
    const productoExistente = this.buscar(p => p.nombre.toLowerCase() === producto.nombre.toLowerCase());
    if (productoExistente) {
      throw new Error(`Ya existe un producto con el nombre: ${producto.nombre}`);
    }
    this.productos.push(new Product(producto.nombre, producto.cantidad, producto.precio));
  }

  /**
   * Elimina un producto basado en un criterio
   */
  eliminar(criterio: (producto: IProduct) => boolean): boolean {
    const indice = this.productos.findIndex(criterio);
    if (indice !== -1) {
      this.productos.splice(indice, 1);
      return true;
    }
    return false;
  }

  /**
   * Busca un producto basado en un criterio
   */
  buscar(criterio: (producto: IProduct) => boolean): IProduct | undefined {
    return this.productos.find(criterio);
  }

  /**
   * Obtiene todos los productos
   */
  obtenerTodos(): IProduct[] {
    return [...this.productos];
  }

  /**
   * Limpia el repositorio
   */
  limpiar(): void {
    this.productos = [];
  }
}