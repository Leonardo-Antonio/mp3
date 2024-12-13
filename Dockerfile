# Usar la imagen oficial de Go
FROM golang:1.23.2

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app


COPY . .

RUN go mod tidy

# Compilar la aplicación
RUN go build -o main .

# Comando para ejecutar la aplicación
CMD ["./main"]
