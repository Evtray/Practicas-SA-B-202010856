export interface IRepository<T> {
  agregar(item: T): void;
  eliminar(criterio: (item: T) => boolean): boolean;
  buscar(criterio: (item: T) => boolean): T | undefined;
  obtenerTodos(): T[];
}