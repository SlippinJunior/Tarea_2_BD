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
    response = requests.post(url, json=data)
    return response.json()

def iniciar_sesion(correo, clave):
    url = f"{BASE_URL}/login"
    data = {
        "correo": correo,
        "clave": clave
    }
    response = requests.post(url, json=data)
    return response.json()

# Ejemplo de uso
if __name__ == "__main__":
    # Registrar un nuevo usuario
    print(registrar_usuario("Daniel", "daniel.duenas@usm.cl", "clavecita123", "Una descripcion que puede escribir el usuario"))

    # Iniciar sesión
    print(iniciar_sesion("daniel.duenas@usm.cl", "clavecita123"))
