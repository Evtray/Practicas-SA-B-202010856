import * as readlineSync from 'readline-sync';
import { InventoryService } from '../services/InventoryService';

/**
 * Manejador del menú de la aplicación
 * Principio: Single Responsibility - Solo maneja la interacción con el usuario
 */
export class MenuHandler {
  constructor(private inventoryService: InventoryService) {}

  /**
   * Muestra el menú principal
   */
  mostrarMenuPrincipal(): void {
    console.clear();
    console.log('╔════════════════════════════════════════╗');
    console.log('║     SISTEMA DE GESTIÓN DE INVENTARIO   ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n1. Agregar producto');
    console.log('2. Eliminar producto');
    console.log('3. Mostrar lista de productos');
    console.log('4. Buscar producto por nombre');
    console.log('5. Ordenar productos');
    console.log('6. Cargar datos de ejemplo');
    console.log('0. Salir');
    console.log('─'.repeat(44));
  }

  /**
   * Ejecuta el menú principal
   */
  ejecutar(): void {
    let continuar = true;

    while (continuar) {
      this.mostrarMenuPrincipal();
      const opcion = readlineSync.question('\nSeleccione una opción: ');

      try {
        switch (opcion) {
          case '1':
            this.agregarProducto();
            break;
          case '2':
            this.eliminarProducto();
            break;
          case '3':
            this.mostrarProductos();
            break;
          case '4':
            this.buscarProducto();
            break;
          case '5':
            this.ordenarProductos();
            break;
          case '6':
            this.cargarDatosEjemplo();
            break;
          case '0':
            continuar = false;
            console.log('\n¡Hasta luego!');
            break;
          default:
            console.log('\n✗ Opción no válida');
        }
      } catch (error) {
        console.log(`\n✗ Error: ${(error as Error).message}`);
      }

      if (continuar && opcion !== '0') {
        readlineSync.question('\nPresione Enter para continuar...');
      }
    }
  }

  /**
   * Agrega un nuevo producto
   */
  private agregarProducto(): void {
    console.log('\n=== AGREGAR PRODUCTO ===');
    const nombre = readlineSync.question('Nombre del producto: ');
    const cantidad = readlineSync.questionInt('Cantidad: ');
    const precio = readlineSync.questionFloat('Precio: $');

    this.inventoryService.agregarProducto(nombre, cantidad, precio);
  }

  /**
   * Elimina un producto
   */
  private eliminarProducto(): void {
    console.log('\n=== ELIMINAR PRODUCTO ===');
    const nombre = readlineSync.question('Nombre del producto a eliminar: ');
    this.inventoryService.eliminarProducto(nombre);
  }

  /**
   * Muestra todos los productos
   */
  private mostrarProductos(): void {
    console.log('\n');
    this.inventoryService.mostrarProductos();
  }

  /**
   * Busca un producto por nombre
   */
  private buscarProducto(): void {
    console.log('\n=== BUSCAR PRODUCTO ===');
    const nombre = readlineSync.question('Nombre del producto a buscar: ');
    const producto = this.inventoryService.buscarPorNombre(nombre);

    if (producto) {
      console.log('\nProducto encontrado:');
      console.log('─'.repeat(50));
      console.log(`Nombre: ${producto.nombre}`);
      console.log(`Cantidad: ${producto.cantidad} unidades`);
      console.log(`Precio: $${producto.precio.toFixed(2)}`);
      console.log('─'.repeat(50));
    } else {
      console.log(`\n✗ No se encontró el producto '${nombre}'`);
    }
  }

  /**
   * Ordena los productos
   */
  private ordenarProductos(): void {
    console.log('\n=== ORDENAR PRODUCTOS ===');
    console.log('1. Por precio (menor a mayor)');
    console.log('2. Por precio (mayor a menor)');
    console.log('3. Por cantidad (menor a mayor)');
    console.log('4. Por cantidad (mayor a menor)');

    const opcion = readlineSync.question('\nSeleccione criterio de ordenamiento: ');
    let productos;

    switch (opcion) {
      case '1':
        productos = this.inventoryService.ordenarPorPrecio(true);
        break;
      case '2':
        productos = this.inventoryService.ordenarPorPrecio(false);
        break;
      case '3':
        productos = this.inventoryService.ordenarPorCantidad(true);
        break;
      case '4':
        productos = this.inventoryService.ordenarPorCantidad(false);
        break;
      default:
        console.log('\n✗ Opción no válida');
        return;
    }

    console.log('\n=== PRODUCTOS ORDENADOS ===');
    this.inventoryService.mostrarProductos(productos);
  }

  /**
   * Carga datos de ejemplo
   */
  private cargarDatosEjemplo(): void {
    console.log('\n=== CARGANDO DATOS DE EJEMPLO ===');
    
    const productosEjemplo = [
      { nombre: 'Laptop HP', cantidad: 10, precio: 899.99 },
      { nombre: 'Mouse Logitech', cantidad: 25, precio: 29.99 },
      { nombre: 'Teclado Mecánico', cantidad: 15, precio: 149.99 },
      { nombre: 'Monitor Samsung 24"', cantidad: 8, precio: 299.99 },
      { nombre: 'Webcam HD', cantidad: 12, precio: 79.99 }
    ];

    for (const producto of productosEjemplo) {
      try {
        this.inventoryService.agregarProducto(
          producto.nombre,
          producto.cantidad,
          producto.precio
        );
      } catch (error) {
        console.log(`✗ No se pudo agregar ${producto.nombre}: ${(error as Error).message}`);
      }
    }

    console.log('\n✓ Datos de ejemplo cargados exitosamente');
  }
}