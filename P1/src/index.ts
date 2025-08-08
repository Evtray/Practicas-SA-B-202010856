import { ProductRepository } from './repositories/ProductRepository';
import { InventoryService } from './services/InventoryService';
import { MenuHandler } from './utils/MenuHandler';


function main(): void {
  // Crear el repositorio 
  const productRepository = new ProductRepository();
  
  // Crear el servicio de inventario con el repositorio inyectado
  const inventoryService = new InventoryService(productRepository);
  
  const menuHandler = new MenuHandler(inventoryService);
  
  menuHandler.ejecutar();
}

main();