import { IProduct } from '../interfaces/IProduct';
import { IRepository } from '../interfaces/IRepository';
import { Product } from '../models/Product';

/**
 * Servicio de gestión de inventario
 * Principio: Single Responsibility - Gestiona las operaciones del inventario
 * Principio: Dependency Inversion - Depende de abstracciones (interfaces)
 */
export class InventoryService {
  constructor(private repository: IRepository<IProduct>) {}

  /**
   * Agrega un nuevo producto al inventario
   */
  agregarProducto(nombre: string, cantidad: number, precio: number): void {
    try {
      const producto = new Product(nombre, cantidad, precio);
      this.repository.agregar(producto);
      console.log(`✓ Producto '${nombre}' agregado exitosamente`);
    } catch (error) {
      throw new Error(`Error al agregar producto: ${(error as Error).message}`);
    }
  }

  /**
   * Elimina un producto por nombre
   */
  eliminarProducto(nombre: string): boolean {
    const eliminado = this.repository.eliminar(
      p => p.nombre.toLowerCase() === nombre.toLowerCase()
    );
    
    if (eliminado) {
      console.log(`✓ Producto '${nombre}' eliminado exitosamente`);
    } else {
      console.log(`✗ No se encontró el producto '${nombre}'`);
    }
    
    return eliminado;
  }

  /**
   * Busca un producto por nombre
   */
  buscarPorNombre(nombre: string): IProduct | undefined {
    return this.repository.buscar(
      p => p.nombre.toLowerCase() === nombre.toLowerCase()
    );
  }

  /**
   * Lista todos los productos
   */
  listarProductos(): IProduct[] {
    return this.repository.obtenerTodos();
  }

  /**
   * Ordena productos por precio
   */
  ordenarPorPrecio(ascendente: boolean = true): IProduct[] {
    const productos = [...this.repository.obtenerTodos()];
    return productos.sort((a, b) => {
      const comparacion = a.precio - b.precio;
      return ascendente ? comparacion : -comparacion;
    });
  }

  /**
   * Ordena productos por cantidad
   */
  ordenarPorCantidad(ascendente: boolean = true): IProduct[] {
    const productos = [...this.repository.obtenerTodos()];
    return productos.sort((a, b) => {
      const comparacion = a.cantidad - b.cantidad;
      return ascendente ? comparacion : -comparacion;
    });
  }

  /**
   * Muestra los productos en consola
   */
  mostrarProductos(productos?: IProduct[]): void {
    const lista = productos || this.listarProductos();
    
    if (lista.length === 0) {
      console.log('No hay productos en el inventario');
      return;
    }

    console.log('\n=== INVENTARIO DE PRODUCTOS ===');
    console.log('─'.repeat(50));
    lista.forEach((producto, indice) => {
      console.log(`${indice + 1}. ${producto.nombre}`);
      console.log(`   Cantidad: ${producto.cantidad} unidades`);
      console.log(`   Precio: $${producto.precio.toFixed(2)}`);
      console.log('─'.repeat(50));
    });
    console.log(`Total de productos: ${lista.length}`);
  }

  /**
   * Actualiza la cantidad de un producto
   */
  actualizarCantidad(nombre: string, nuevaCantidad: number): boolean {
    const producto = this.buscarPorNombre(nombre);
    if (producto && producto instanceof Product) {
      producto.actualizarCantidad(nuevaCantidad);
      console.log(`✓ Cantidad actualizada para '${nombre}'`);
      return true;
    }
    console.log(`✗ No se encontró el producto '${nombre}'`);
    return false;
  }

  /**
   * Actualiza el precio de un producto
   */
  actualizarPrecio(nombre: string, nuevoPrecio: number): boolean {
    const producto = this.buscarPorNombre(nombre);
    if (producto && producto instanceof Product) {
      producto.actualizarPrecio(nuevoPrecio);
      console.log(`✓ Precio actualizado para '${nombre}'`);
      return true;
    }
    console.log(`✗ No se encontró el producto '${nombre}'`);
    return false;
  }
}