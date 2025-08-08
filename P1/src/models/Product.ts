import { IProduct } from '../interfaces/IProduct';

export class Product implements IProduct {
  constructor(
    public nombre: string,
    public cantidad: number,
    public precio: number
  ) {
    this.validar();
  }

  private validar(): void {
    if (!this.nombre || this.nombre.trim().length === 0) {
      throw new Error('El nombre del producto no puede estar vacío');
    }
    if (this.cantidad < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    if (this.precio < 0) {
      throw new Error('El precio no puede ser negativo');
    }
  }

  actualizarCantidad(nuevaCantidad: number): void {
    if (nuevaCantidad < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    this.cantidad = nuevaCantidad;
  }


  actualizarPrecio(nuevoPrecio: number): void {
    if (nuevoPrecio < 0) {
      throw new Error('El precio no puede ser negativo');
    }
    this.precio = nuevoPrecio;
  }


  toString(): string {
    return `${this.nombre} - Cantidad: ${this.cantidad} - Precio: $${this.precio.toFixed(2)}`;
  }
}