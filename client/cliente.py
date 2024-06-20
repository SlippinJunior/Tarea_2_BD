import requests

BASE_URL = 'http://localhost:3000/api'

def registrar_usuario(nombre, correo, clave, descripcion):
    url = f"{BASE_URL}/registrar"
    data = {
        "nombre": nombre,
        "correo": correo,
        "clave": clave,
        "descripcion": descripcion
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()  # Muestra error
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"estado": 500, "mensaje": f"Error al conectar con la API: {e}"}

def solicitar_datos_usuario():
    nombre = input("Ingrese su nombre: ")
    correo = input("Ingrese su correo electrónico: ")
    clave = input("Ingrese su clave: ")
    descripcion = input("Ingrese una descripción: ")
    return nombre, correo, clave, descripcion

if __name__ == "__main__":
    nombre, correo, clave, descripcion = solicitar_datos_usuario()
    resultado = registrar_usuario(nombre, correo, clave, descripcion)
    print(resultado["mensaje"])
