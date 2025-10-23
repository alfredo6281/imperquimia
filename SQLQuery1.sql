CREATE DATABASE InventarioImper;
USE InventarioImper

CREATE TABLE Proveedores(
	id_Proveedor int primary key identity,
	nombre NVARCHAR(100),
	telefono NVARCHAR(100)
)
CREATE TABLE UnidadMedida(
	idUnidadMedida int primary key identity,
	nombre nvarchar(3)
)

CREATE TABLE Producto(
	idProducto int primary key identity,
	nombre nvarchar(100),
	CONSTRAINT FK_Productos_UnidadMedida
        FOREIGN KEY (idUnidadMedida) REFERENCES UnidadMedida(idUnidadMedida),
	UnidadMedida nvarchar,
	Unidad int,
	PrecioUnitario decimal (10,2),
	Stock int,
	stockMinimo int,
	CONSTRAINT FK_Productos_Proveedores
        FOREIGN KEY (id_Proveedor) REFERENCES Proveedores(id_Proveedor),
	CONSTRAINT FK_Productos_Categoria
        FOREIGN KEY (id_Categoria) REFERENCES Categoria(id_Categoria)
)

CREATE TABLE Categoria(
	idCategoria int primary key identity,
	nombre nvarchar(100)
)

CREATE TABLE Salida(
	idSalida int primary key identity,
	fecha date,
	CONSTRAINT FK_Salida_Producto
        FOREIGN KEY (id_Producto) REFERENCES Producto(id_Producto),
	cantidad int,
	observaciones nvarchar(100)
)

CREATE TABLE Entrada(
	idEntrada int primary key identity,
	fecha date,
	CONSTRAINT FK_Entrada_Producto
        FOREIGN KEY (id_Producto) REFERENCES Producto(id_Producto),
	cantidad int,
	observaciones nvarchar(100)
)