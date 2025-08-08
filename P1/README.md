# Sistema de Gestión de Inventario - Práctica 1
# 202010856

## Descripción del Proyecto

Este proyecto implementa un sistema de gestión de inventario para una tienda, desarrollado aplicando los principios SOLID de diseño orientado a objetos.

## Características Principales

- ✅ Agregar nuevos productos al inventario
- ✅ Eliminar productos existentes
- ✅ Buscar productos por nombre
- ✅ Mostrar lista completa de productos
- ✅ Ordenar productos por precio (ascendente/descendente)
- ✅ Ordenar productos por cantidad (ascendente/descendente)
- ✅ Actualizar cantidad y precio de productos
- ✅ Validación de datos y manejo de errores

## Tecnologías Utilizadas

- **TypeScript**: Lenguaje principal de desarrollo
- **Node.js**: Entorno de ejecución
- **readline-sync**: Para interacción con el usuario por consola

## Estructura del Proyecto

```
P1/
├── src/
│   ├── interfaces/      # Contratos y abstracciones
│   │   ├── IProduct.ts
│   │   └── IRepository.ts
│   ├── models/          # Modelos de dominio
│   │   └── Product.ts
│   ├── repositories/    # Capa de datos
│   │   └── ProductRepository.ts
│   ├── services/        # Lógica de negocio
│   │   └── InventoryService.ts
│   ├── utils/           # Utilidades
│   │   └── MenuHandler.ts
│   └── index.ts         # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

## Instalación y Ejecución

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]

# Navegar al directorio del proyecto
cd Practicas-SA-B-202010856/P1

# Instalar dependencias
npm install
```

### Ejecución

```bash
# Compilar el proyecto TypeScript
npm run build

# Ejecutar el programa
npm start

# O ejecutar directamente con ts-node
npm run dev
```

## Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP) - Principio de Responsabilidad Única

**Definición**: Una clase debe tener una sola razón para cambiar, es decir, debe tener una única responsabilidad.

**Ejemplo en el código**:

```typescript
// src/models/Product.ts
export class Product implements IProduct {
  constructor(
    public nombre: string,
    public cantidad: number,
    public precio: number
  ) {
    this.validar();
  }

  // Responsabilidad única: Representar y validar un producto
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
}
```

La clase `Product` tiene una única responsabilidad: representar un producto y garantizar que sus datos sean válidos. No se encarga de persistencia, UI, o lógica de negocio compleja.

```typescript
// src/repositories/ProductRepository.ts
export class ProductRepository implements IRepository<IProduct> {
  private productos: IProduct[] = [];

  // Responsabilidad única: Gestionar el almacenamiento de productos
  agregar(producto: IProduct): void {
    const productoExistente = this.buscar(
      p => p.nombre.toLowerCase() === producto.nombre.toLowerCase()
    );
    if (productoExistente) {
      throw new Error(`Ya existe un producto con el nombre: ${producto.nombre}`);
    }
    this.productos.push(new Product(producto.nombre, producto.cantidad, producto.precio));
  }

  eliminar(criterio: (producto: IProduct) => boolean): boolean {
    const indice = this.productos.findIndex(criterio);
    if (indice !== -1) {
      this.productos.splice(indice, 1);
      return true;
    }
    return false;
  }
}
```

`ProductRepository` se encarga únicamente del almacenamiento y recuperación de productos, no de validación o lógica de negocio.

### 2. Open-Closed Principle (OCP) - Principio Abierto/Cerrado

**Definición**: Las entidades de software deben estar abiertas para extensión pero cerradas para modificación.

**Ejemplo en el código**:

```typescript
// src/services/InventoryService.ts
export class InventoryService {
  constructor(private repository: IRepository<IProduct>) {}

  // Abierto a extensión: Se pueden agregar nuevos métodos de ordenamiento
  ordenarPorPrecio(ascendente: boolean = true): IProduct[] {
    const productos = [...this.repository.obtenerTodos()];
    return productos.sort((a, b) => {
      const comparacion = a.precio - b.precio;
      return ascendente ? comparacion : -comparacion;
    });
  }

  ordenarPorCantidad(ascendente: boolean = true): IProduct[] {
    const productos = [...this.repository.obtenerTodos()];
    return productos.sort((a, b) => {
      const comparacion = a.cantidad - b.cantidad;
      return ascendente ? comparacion : -comparacion;
    });
  }

  // Se pueden agregar nuevos métodos sin modificar los existentes
  // Por ejemplo: ordenarPorNombre, filtrarPorRango, etc.
}
```

El servicio está diseñado para permitir agregar nuevas funcionalidades (nuevos métodos de ordenamiento, filtrado, etc.) sin modificar el código existente.

### 3. Liskov Substitution Principle (LSP) - Principio de Sustitución de Liskov

**Definición**: Los objetos de una clase derivada deben poder reemplazar objetos de la clase base sin alterar el correcto funcionamiento del programa.

**Ejemplo en el código**:

```typescript
// src/interfaces/IRepository.ts
export interface IRepository<T> {
  agregar(item: T): void;
  eliminar(criterio: (item: T) => boolean): boolean;
  buscar(criterio: (item: T) => boolean): T | undefined;
  obtenerTodos(): T[];
}

// src/repositories/ProductRepository.ts
export class ProductRepository implements IRepository<IProduct> {
  // Implementación concreta que respeta el contrato de IRepository
  agregar(producto: IProduct): void {
    // Implementación específica para productos
  }
}

// El servicio puede trabajar con cualquier implementación de IRepository
export class InventoryService {
  constructor(private repository: IRepository<IProduct>) {}
  // El servicio funcionará correctamente con cualquier implementación
  // que respete el contrato IRepository<IProduct>
}
```

Se podría crear una nueva implementación como `DatabaseProductRepository` o `FileProductRepository` y el `InventoryService` funcionaría sin cambios:

```typescript
// Ejemplo de extensión (no implementado en el proyecto actual)
class DatabaseProductRepository implements IRepository<IProduct> {
  agregar(producto: IProduct): void {
    // Guardar en base de datos
  }
  // ... resto de métodos
}

// Se puede sustituir sin problemas
const service = new InventoryService(new DatabaseProductRepository());
```

### 4. Interface Segregation Principle (ISP) - Principio de Segregación de Interfaces

**Definición**: Los clientes no deberían verse forzados a depender de interfaces que no utilizan.

**Ejemplo en el código**:

```typescript
// src/interfaces/IProduct.ts
export interface IProduct {
  nombre: string;
  cantidad: number;
  precio: number;
}

// src/interfaces/IRepository.ts
export interface IRepository<T> {
  agregar(item: T): void;
  eliminar(criterio: (item: T) => boolean): boolean;
  buscar(criterio: (item: T) => boolean): T | undefined;
  obtenerTodos(): T[];
}
```

Las interfaces están segregadas según su propósito:
- `IProduct`: Define solo las propiedades esenciales de un producto
- `IRepository<T>`: Define solo las operaciones CRUD básicas

Cada interfaz es pequeña y enfocada, evitando que las clases implementen métodos que no necesitan.

### 5. Dependency Inversion Principle (DIP) - Principio de Inversión de Dependencias

**Definición**: Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

**Ejemplo en el código**:

```typescript
// src/services/InventoryService.ts
export class InventoryService {
  // Depende de la abstracción IRepository, no de ProductRepository
  constructor(private repository: IRepository<IProduct>) {}

  agregarProducto(nombre: string, cantidad: number, precio: number): void {
    try {
      const producto = new Product(nombre, cantidad, precio);
      // Usa la abstracción, no la implementación concreta
      this.repository.agregar(producto);
      console.log(`✓ Producto '${nombre}' agregado exitosamente`);
    } catch (error) {
      throw new Error(`Error al agregar producto: ${(error as Error).message}`);
    }
  }
}

// src/index.ts
import { ProductRepository } from './repositories/ProductRepository';
import { InventoryService } from './services/InventoryService';

// La inyección de dependencias ocurre en el nivel más alto
const repository = new ProductRepository();
const inventoryService = new InventoryService(repository);
```

**Ventajas de aplicar DIP**:
1. **Flexibilidad**: Se puede cambiar la implementación del repositorio sin modificar el servicio
2. **Testabilidad**: Se pueden inyectar mocks para pruebas unitarias
3. **Desacoplamiento**: El servicio no conoce los detalles de implementación del repositorio

Ejemplo de test (conceptual):
```typescript
// En pruebas unitarias
class MockRepository implements IRepository<IProduct> {
  private items: IProduct[] = [];
  
  agregar(item: IProduct): void {
    this.items.push(item);
  }
  // ... resto de métodos mock
}

// El servicio puede ser probado con el mock
const mockRepo = new MockRepository();
const serviceToTest = new InventoryService(mockRepo);
```

## Buenas Prácticas Implementadas

### 1. Modularización
El código está organizado en módulos claros con responsabilidades bien definidas:
- **interfaces/**: Contratos y abstracciones
- **models/**: Entidades del dominio
- **repositories/**: Capa de persistencia
- **services/**: Lógica de negocio
- **utils/**: Utilidades auxiliares

### 2. Nombres Descriptivos
Todos los elementos del código tienen nombres que reflejan claramente su propósito:
- `ProductRepository`: Repositorio de productos
- `InventoryService`: Servicio de gestión de inventario
- `agregarProducto()`: Método para agregar productos
- `buscarPorNombre()`: Método para buscar por nombre

### 3. Comentarios
El código incluye comentarios JSDoc que explican el propósito de cada clase y método principal.

### 4. Manejo de Errores
Implementación robusta de validación y manejo de errores:

```typescript
// Validación en el modelo
private validar(): void {
  if (!this.nombre || this.nombre.trim().length === 0) {
    throw new Error('El nombre del producto no puede estar vacío');
  }
  if (this.cantidad < 0) {
    throw new Error('La cantidad no puede ser negativa');
  }
}

// Manejo de errores en el servicio
agregarProducto(nombre: string, cantidad: number, precio: number): void {
  try {
    const producto = new Product(nombre, cantidad, precio);
    this.repository.agregar(producto);
    console.log(`✓ Producto '${nombre}' agregado exitosamente`);
  } catch (error) {
    throw new Error(`Error al agregar producto: ${(error as Error).message}`);
  }
}
```

### 5. Código Limpio
- Indentación consistente de 2 espacios
- Líneas en blanco para separar secciones lógicas
- Funciones pequeñas y enfocadas
- Evitación de números mágicos
- Uso de TypeScript para type safety

## Decisiones de Diseño

### Estructura de Datos
Se utiliza un array en memoria como estructura de datos principal por las siguientes razones:
- Simplicidad para operaciones CRUD
- Facilidad para implementar ordenamiento
- Adecuado para el alcance del proyecto (sin persistencia)

### Patrón Repository
Se implementó el patrón Repository para:
- Abstraer la capa de datos
- Facilitar futuros cambios en la persistencia
- Mejorar la testabilidad

### Inyección de Dependencias
Se utiliza inyección de dependencias por constructor para:
- Cumplir con el principio DIP
- Facilitar las pruebas unitarias
- Permitir diferentes implementaciones del repositorio
